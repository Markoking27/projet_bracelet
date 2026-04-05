from bracelet_monitor import BraceletMonitor
from SensorSimulator import SensorSimulator
import time

SCENARIO = [
    (60, "normal"), #30s de calibration 
    (30, "effort"),
    (30, "normal"),
    (60, "deshydratation"),
    (60, "vagal"),
    (60, "chaleur"),
    (60, "alcool"),
]

monitor = BraceletMonitor()
simulator = SensorSimulator()
start = time.time()

while True:
    elapsed = time.time() - start
    cursor = 0
    mode = SCENARIO[-1][1]

    for duration, m in SCENARIO:
        cursor += duration
        if elapsed < cursor :
            mode = m 
            break

    simulator.set_mode(mode)
    data = simulator.simulate_data()

    monitor.update(
        data["bpm"], 
        data["spo2"], 
        data ["temp"],
        accel=data["accel"],
        accel_variance=data["accel_variance"]
        )
    
    time.sleep(1)