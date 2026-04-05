from flask import Flask, jsonify
from bracelet_monitor import BraceletMonitor
from SensorSimulator import SensorSimulator
import threading
import time
import requests

app = Flask(__name__)

BACKEND_URL = "http://localhost:3000/api/bracelet"  # Node.js

NUM_BRACELETS = 3

# Crée un bracelet par instance
bracelets = []
simulators = []
for i in range(NUM_BRACELETS):
    monitor = BraceletMonitor()
    sim = SensorSimulator()
    bracelets.append(monitor)
    simulators.append(sim)

def simulate_bracelet(index: int):
    monitor = bracelets[index]
    sim = simulators[index]
    while True:
        data = sim.simulate_data()
        monitor.update(
            data["bpm"],
            data["spo2"],
            data["temp"],
            accel=data["accel"],
            accel_variance=data["accel_variance"]
        )
        # Envoie toujours (pour test)
        payload = {
            "id": index + 1,
            "level": monitor.current_level,
            "malaise": monitor.malaise_type
        }
        try:
            requests.post(BACKEND_URL, json=payload)
        except:
            print(f"[Bracelet {index+1}] Impossible de joindre le backend")
        time.sleep(1)  # 1 seconde entre chaque update

# Lance tous les bracelets en threads
for i in range(NUM_BRACELETS):
    t = threading.Thread(target=simulate_bracelet, args=(i,), daemon=True)
    t.start()

@app.route('/')
def home():
    return jsonify({"status": "Simulation active", "bracelets": NUM_BRACELETS})

if __name__ == '__main__':
    app.run(port=5000)