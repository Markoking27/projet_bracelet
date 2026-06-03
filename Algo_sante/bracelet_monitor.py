import time
import math 
from collections import deque

# Configuration 
BASELINE_DURATION   = 10  
HISTORY_WINDOW      = 300   
TREND_WINDOW        = 30    
PERSISTENCE_WINDOW  = 15   
 
# Seuils relatifs 
BPM_HIGH_RATIO      = 1.20  
BPM_LOW_RATIO       = 0.80  
SPO2_DROP           = 2.0   
TEMP_HIGH_DELTA     = 1.0   
TEMP_LOW_DELTA      = 1.0   
 
# Seuils accéléromètre
ACCEL_IMMOBILE = 0.25  
ACCEL_ACTIVE = 2.0   
ACCEL_FALL_DELTA = 3.0   
ACCEL_VAR_LOW = 0.02


class BraceletMonitor :

    ALERT_LEVELS = {0:"OK", 1:"Surveillance", 2:"Alerte", 3: "Urgence"}

    def __init__(self):
        self.history = []
        self.baseline: dict | None = None
        self._baseline_samples: list[dict] = []
        self.start_time = time.time()
        self.current_level = 0
        self.malaise_type: str | None = None 
        self._fall_detected = False
        self._fall_time: float | None = None 

    def add_data(self, bpm, spo2, temp, accel, accel_variance):
        entry = {
            "time": time.time(),
            "bpm": bpm, "spo2": spo2, "temp": temp,
            "accel": accel, "accel_variance": accel_variance,
        }
        self.history.append(entry)
        cutoff = time.time() - HISTORY_WINDOW
        self.history = [d for d in self.history if d["time"] >= cutoff]

        if self.baseline is None:
            elapsed = time.time() - self.start_time
            if elapsed < BASELINE_DURATION:
                self._baseline_samples.append(entry)
            elif self._baseline_samples:
                self._build_baseline()
 
    def _build_baseline(self):
        s = self._baseline_samples
        self.baseline = {
            "bpm":  self._mean(s, "bpm"),
            "spo2": self._mean(s, "spo2"),
            "temp": self._mean(s, "temp"),
            "accel": self._mean(s, "accel"),
            "bpm_std": self._std(s, "bpm"),   
        }
        print(f"[baseline établie] {self.baseline}")


    @staticmethod
    def _mean(data: list[dict], key: str) -> float:
        vals = [d[key] for d in data if key in d]
        return sum(vals) / len(vals) if vals else 0.0
 
    @staticmethod
    def _std(data: list[dict], key: str) -> float:
        vals = [d[key] for d in data if key in d]
        if len(vals) < 2:
            return 1.0
        mean = sum(vals) / len(vals)
        return math.sqrt(sum((v - mean) ** 2 for v in vals) / len(vals))
 
    def _window(self, seconds: float) -> list[dict]:
        """Retourne les mesures des N dernières secondes."""
        cutoff = time.time() - seconds
        return [d for d in self.history if d["time"] >= cutoff]
 
    def _trend(self, key: str, seconds: float = TREND_WINDOW) -> float:
        """
        Tendance linéaire (slope) d'une métrique sur la fenêtre.
        Retourne la variation estimée par seconde.
        """
        data = self._window(seconds)
        if len(data) < 4:
            return 0.0
        n = len(data)
        t0 = data[0]["time"]
        xs = [d["time"] - t0 for d in data]
        ys = [d[key] for d in data]
        x_mean = sum(xs) / n
        y_mean = sum(ys) / n
        num = sum((xs[i] - x_mean) * (ys[i] - y_mean) for i in range(n))
        den = sum((xs[i] - x_mean) ** 2 for i in range(n))
        return num / den if den > 0 else 0.0
 
    def _persistent(self, condition_fn, seconds: float = PERSISTENCE_WINDOW) -> float:
        """
        Retourne la fraction de mesures (0–1) vérifiant la condition
        sur la fenêtre de persistance.
        """
        data = self._window(seconds)
        if not data:
            return 0.0
        return sum(1 for d in data if condition_fn(d)) / len(data)
 
    # =========================================================================
    # Détection de chute
    # =========================================================================
 
    def _check_fall(self, entry: dict) -> bool:
        """
        Chute = pic d'accélération suivi d'immobilité prolongée.
        """
        recent = self._window(3)
        if len(recent) < 2:
            return False
 
        max_accel = max(d["accel"] for d in recent)
        current_immobile = entry["accel"] < ACCEL_IMMOBILE
 
        # Pic de chute détecté
        if max_accel > ACCEL_FALL_DELTA and not self._fall_detected:
            self._fall_detected = True
            self._fall_time = time.time()
            print("[chute] pic d'accélération détecté")
 
        # Chute confirmée si immobilité > 5s après le pic
        if self._fall_detected and self._fall_time:
            immobility_duration = time.time() - self._fall_time
            if current_immobile and immobility_duration > 5:
                return True
            if not current_immobile and immobility_duration > 10:
                # La personne s'est relevée → réinitialiser
                self._fall_detected = False
                self._fall_time = None
 
        return False
 
    # Contexte activité ↔ FC
 
    def _activity_context(self, entry: dict) -> str:
        """
        Retourne le contexte activité/FC :
          'coherent'   → FC et activité cohérentes
          'suspect'    → FC élevée + faible activité
          'critical'   → FC élevée + immobilité complète
          'bradycardia_immobile' → FC basse + immobilité
        """
        b = self.baseline
        bpm_high = entry["bpm"] > b["bpm"] * BPM_HIGH_RATIO
        bpm_low  = entry["bpm"] < b["bpm"] * BPM_LOW_RATIO
        immobile = entry["accel"] < ACCEL_IMMOBILE
        low_var  = entry["accel_variance"] < ACCEL_VAR_LOW
 
        if bpm_high and immobile and low_var:
            return "critical"
        if bpm_high and entry["accel"] < ACCEL_ACTIVE * 0.5:
            return "suspect"
        if bpm_low and immobile:
            return "bradycardia_immobile"
        return "coherent"
 
    # Reconnaissance du type de malaise
    
    def _classify(self, entry: dict) -> str | None:
        b = self.baseline
        bpm_diff  = entry["bpm"]  - b["bpm"]
        temp_diff = entry["temp"] - b["temp"]
        spo2_diff = entry["spo2"] - b["spo2"]
 
        bpm_trend  = self._trend("bpm")
        temp_trend = self._trend("temp")
 
        # Vagal : bradycardie + refroidissement + immobilité
        if bpm_diff < -15 and temp_diff < -0.8 and entry["accel"] < ACCEL_IMMOBILE:
            return "vagal"
 
        # Coup de chaleur : hyperthermie forte + tachycardie + prostration
        if temp_diff > 2.0 and bpm_diff > 20 and entry["accel"] < 1.0:
            return "coup_de_chaleur"
 
        # Déshydratation : tachycardie croissante + montée temp + peu actif
        if bpm_diff > 15 and temp_diff > 1.0 and spo2_diff > -3 and bpm_trend > 0:
            return "deshydratation"
 
        # Alcool : tachycardie modérée + hypoxie + mouvements irréguliers
        if 8 < bpm_diff < 30 and spo2_diff < -3 and entry["accel_variance"] > 0.1:
            return "alcool"
 
        return None
 
    # Score de risque — logique pattern
 
    def _compute_score(self, entry: dict) -> tuple[int, list[str]]:
        """
        Retourne (score 0–3, liste des patterns détectés).
        Chaque point nécessite persistence + contexte, pas un pic isolé.
        """
        b = self.baseline
        reasons = []
        score = 0
 
        
        if self._check_fall(entry):
            return 3, ["chute_confirmee"]
 
        
        context = self._activity_context(entry)
 
        
        immobile_ratio = self._persistent(lambda d: d["accel"] < ACCEL_IMMOBILE, 60)
        if immobile_ratio > 0.85:
            score += 1
            reasons.append(f"immobilite_prolongee ({immobile_ratio:.0%})")
 
        
        bpm_high_ratio = self._persistent(
            lambda d: d["bpm"] > b["bpm"] * BPM_HIGH_RATIO, PERSISTENCE_WINDOW
        )
        if bpm_high_ratio > 0.6:
            if context == "critical":
                score += 2
                reasons.append(f"tachycardie_immobile ({bpm_high_ratio:.0%})")
            elif context == "suspect":
                score += 1
                reasons.append(f"tachycardie_inactive ({bpm_high_ratio:.0%})")
 
        
        bpm_low_ratio = self._persistent(
            lambda d: d["bpm"] < b["bpm"] * BPM_LOW_RATIO, PERSISTENCE_WINDOW
        )
        if bpm_low_ratio > 0.6 and context == "bradycardia_immobile":
            score += 2
            reasons.append(f"bradycardie_immobile ({bpm_low_ratio:.0%})")
 
        
        bpm_trend = self._trend("bpm")
        if abs(bpm_trend) > 0.3:   # variation > 0.3 bpm/s = rupture
            score += 1
            direction = "montante" if bpm_trend > 0 else "descendante"
            reasons.append(f"tendance_fc_{direction} ({bpm_trend:+.2f} bpm/s)")
 
        
        spo2_drop_ratio = self._persistent(
            lambda d: d["spo2"] < b["spo2"] - SPO2_DROP, PERSISTENCE_WINDOW
        )
        if spo2_drop_ratio > 0.5:
            score += 1
            reasons.append(f"hypoxie_persistante ({spo2_drop_ratio:.0%})")
 
        
        if entry["spo2"] < 88:
            score += 2
            reasons.append("spo2_critique (<88%)")
 
        
        temp_high_ratio = self._persistent(
            lambda d: d["temp"] > b["temp"] + TEMP_HIGH_DELTA, PERSISTENCE_WINDOW
        )
        temp_low_ratio = self._persistent(
            lambda d: d["temp"] < b["temp"] - TEMP_LOW_DELTA, PERSISTENCE_WINDOW
        )
        if temp_high_ratio > 0.6:
            score += 1
            reasons.append(f"hyperthermie_persistante ({temp_high_ratio:.0%})")
        elif temp_low_ratio > 0.6:
            score += 1
            reasons.append(f"hypothermie_persistante ({temp_low_ratio:.0%})")
 
        return min(score, 3), reasons

 
    def update(self, bpm: float, spo2: float, temp: float,
               accel: float, accel_variance: float):
        self.add_data(bpm, spo2, temp, accel, accel_variance)
 
        if self.baseline is None:
            elapsed = time.time() - self.start_time
            remaining = int(BASELINE_DURATION - elapsed)
            print(f"[calibration] {remaining}s restantes — BPM:{bpm} SpO2:{spo2} Temp:{temp} Accel:{accel:.2f}")
            print("-" * 60)
            return
 
        entry = self.history[-1]
        score, reasons = self._compute_score(entry)
        self.current_level = score
        self.malaise_type = self._classify(entry) if score >= 2 else None
 
        label = self.ALERT_LEVELS[score]
        malaise_str = f" [{self.malaise_type}]" if self.malaise_type else ""
        context = self._activity_context(entry)
 
        print(f"[NIVEAU {score} — {label}{malaise_str}]")
        print(f"  BPM:{bpm:5.1f}  SpO2:{spo2:.1f}%  Temp:{temp:.1f}°C  "
              f"Accel:{accel:.2f}g  Var:{accel_variance:.4f}")
        print(f"  Contexte: {context}")
        if reasons:
            print(f"  Patterns: {' | '.join(reasons)}")
        print("-" * 60)
 
        # TODO : ajouter localisation 
        if score == 3:
            self._trigger_emergency()
        elif score == 2:
            self._trigger_alert()
 
    def _trigger_alert(self):
        print("  >>> PUSH + GÉOLOC envoyés")
 
    def _trigger_emergency(self):
        print("  >>> URGENCE — appel secours déclenché")