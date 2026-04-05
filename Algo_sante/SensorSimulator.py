import random 

class SensorSimulator:

    MODES = {
        "normal": {
            "bpm": (60, 80), "spo2": (97, 100), "temp": (28, 31),
            "accel": (0.8, 1.2),   
            "d_bpm": 0, "d_spo2": 0, "d_temp": 0,
        },
        "effort": {
            "bpm": (110, 150), "spo2": (95, 100), "temp": (33, 36),
            "accel": (2.0, 5.0),   
            "d_bpm": 0, "d_spo2": 0, "d_temp": 0,
        },
        #malaises
        "vagal": {
            "bpm": (35, 55), "spo2": (94, 97), "temp": (27, 30),
            "accel": (0.0, 0.3),   # immobilité (syncope)
            "d_bpm": -1.5, "d_spo2": -0.15, "d_temp": -0.1,
        },
        "deshydratation": {
            "bpm": (90, 120), "spo2": (94, 98), "temp": (31, 35),
            "accel": (0.2, 0.8),   # peu actif mais debout/assis
            "d_bpm": 0.8, "d_spo2": -0.08, "d_temp": 0.15,
        },
        "alcool": {
            "bpm": (80, 105), "spo2": (93, 97), "temp": (30, 33),
            "accel": (0.5, 1.8),   # mouvements irréguliers
            "d_bpm": 0.4, "d_spo2": -0.18, "d_temp": 0.08,
        },
        "chaleur": {
            "bpm": (100, 140), "spo2": (93, 97), "temp": (35, 39),
            "accel": (0.1, 0.6),   # prostration
            "d_bpm": 1.0, "d_spo2": -0.25, "d_temp": 0.3,
        },
    }

    def __init__(self):
        self.bpm = 70.0
        self.spo2 = 98.0
        self.temp = 30.0
        self.accel = 1.0
        #Cibles
        self.target_bpm = 70.0
        self.target_spo2 = 98.0
        self.target_temp = 30.0
        self.target_accel = 1.0

        self.mode = "normal"
        self._accel_history = [1.0] * 5

    def _is_malaise(self) -> bool :
        return self.mode not in ("normal", "effort")

    def set_mode(self, mode: str):
        assert mode in self.MODES, f"Mode inconnu : {mode}"
        self.mode = mode

    def update_targets(self):
        cfg = self.MODES[self.mode]

        if not self._is_malaise() :
            self.target_bpm = random.uniform(*cfg["bpm"])
            self.target_spo2 = random.uniform(*cfg["spo2"])
            self.target_temp = random.uniform(*cfg["temp"])
            self.target_temp  = random.uniform(*cfg["temp"])
            self.target_accel = random.uniform(*cfg["accel"])
        
        else :
            noise = lambda: random.uniform(-0.2,0.2)
            self.target_bpm  += cfg["d_bpm"]  + noise()
            self.target_spo2 += cfg["d_spo2"] - random.uniform(0, 0.08)
            self.target_temp += cfg["d_temp"] + random.uniform(0, 0.04)
            
            self.target_accel = random.uniform(*cfg["accel"])

            # Limites physiologiques absolues
            self.target_bpm  = max(25,  min(220, self.target_bpm))
            self.target_spo2 = max(70,  min(100, self.target_spo2))
            self.target_temp = max(25,  min(42,  self.target_temp))
            self.target_accel = max(0, min(10, self.target_accel))
    
    @staticmethod
    def _ease(current: float, target: float, speed: float = 0.1, max_delta: float = 3.0) -> float:
        delta = (target - current) * speed
        delta = max(-max_delta, min(max_delta, delta))
        return current + delta
    
    def simulate_data(self) -> dict :
        if random.random()< 0.1:
            self.update_targets()

        #applique easing 
        self.bpm = self._ease(self.bpm, self.target_bpm, 0.12, 4.0)
        self.spo2 = self._ease(self.spo2, self.target_spo2, 0.06, 1.0)
        self.temp = self._ease(self.temp, self.target_temp, 0.06, 2.0)
        self.accel = self._ease(self.accel, self.target_accel, 0.15, 0.8)

        #Vibrations naturelles 
        accel_noisy =  max(0.0, self.accel + random.gauss(0,0.05))

        self._accel_history.append(accel_noisy)
        self._accel_history = self._accel_history[-20:]

        #Variabilité du potentiometre sur une courte fenetre 
        accel_variance = self._variance(self._accel_history[-8:])

        return {
            "bpm": round(self.bpm, 1),
            "spo2": round(self.spo2,1),
            "temp": round(self.temp, 1),
            "accel" : round(accel_noisy, 3),
            "accel_variance" : round(accel_variance, 4)
        }
    
    @staticmethod
    def _variance(values: list) -> float :
        if len(values) < 2:
            return 0.0
        mean = sum(values) /len(values)
        return sum((v - mean)**2 for v in values) / len(values)