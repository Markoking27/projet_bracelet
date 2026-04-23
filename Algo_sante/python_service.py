from flask import Flask, jsonify, request
from bracelet_monitor import BraceletMonitor
from SensorSimulator import SensorSimulator
import threading
import time
import requests

app = Flask(__name__)

BACKEND_URL = "http://localhost:3000/api/bracelet"  # Node.js

bracelets: list[BraceletMonitor] = []
simulators: list[SensorSimulator] = []
stop_flags: list[threading.Event] = []
threads: list[threading.Thread] = []

def create_new_bracelet():
    index = len(bracelets)

    monitor = BraceletMonitor()
    sim = SensorSimulator()
    stop_event = threading.Event()

    bracelets.append(monitor)
    simulators.append(sim)
    stop_flags.append(stop_event)

    t = threading.Thread(
        target=simulate_bracelet,
        args=(index,),
        daemon=True
    )
    threads.append(t)
    t.start()

    print(f"Bracelet {index+1} lancé")

def simulate_bracelet(index: int):
    monitor = bracelets[index]
    sim = simulators[index]
    while not stop_flags[index].is_set():
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

def bracelet_state(index: int) -> dict:
    monitor = bracelets[index]
    sim = simulators[index]
    history = [
        {
            "time": time.strftime('%H:%M:%S', time.localtime(entry["time"])),
            "bpm": round(entry["bpm"], 1),
            "spo2": round(entry["spo2"], 1),
            "temperature": round(entry["temp"], 1),
        }
        for entry in monitor.history
    ]
    return {
        "id": index + 1,
        "mode": sim.mode,
        "level": monitor.current_level,
        "malaise": monitor.malaise_type,
        "bpm": round(sim.bpm, 1),
        "spo2": round(sim.spo2, 1),
        "temperature": round(sim.temp, 1),
        "accel": round(sim.accel, 3),
        "accelVariance": round(sim._accel_history[-1] if sim._accel_history else sim.accel, 4),
        "history": {
            "bpm": [entry["bpm"] for entry in history],
            "temperature": [entry["temperature"] for entry in history],
            "spo2": [entry["spo2"] for entry in history],
            "labels": [entry["time"] for entry in history],
        }
    }

@app.route('/')
def home():
    return jsonify({"status": "Simulation active", "bracelets": len(bracelets)})

@app.route('/api/bracelets')
def get_bracelets():
    return jsonify([bracelet_state(i) for i in range(len(bracelets))])

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS'
    return response

@app.route('/api/bracelets/<int:bracelet_id>/mode', methods=['POST', 'OPTIONS'])
def set_bracelet_mode(bracelet_id: int):
    if request.method == 'OPTIONS':
        return jsonify({})
    if not 1 <= bracelet_id <= len(bracelets):
        return jsonify({"error": "Bracelet introuvable"}), 404
    body = request.get_json(silent=True) or {}
    mode = body.get('mode')
    if not mode:
        return jsonify({"error": "Mode requis"}), 400
    try:
        simulators[bracelet_id - 1].set_mode(mode)
        return jsonify({"id": bracelet_id, "mode": mode})
    except AssertionError as exc:
        return jsonify({"error": str(exc)}), 400

@app.route('/api/bracelets/add', methods=['POST'])
def add_bracelet():
    create_new_bracelet()
    return jsonify({
        "status": "Nouveau bracelet ajouté",
        "total": len(bracelets)
    })

def console_listener():
    print(" Console active :")
    print(" '+' → ajouter un bracelet")
    print(" 'q' → quitter\n")

    while True:
        cmd = input().strip()

        if cmd == "+":
            create_new_bracelet()

        elif cmd.lower() == "q":
            print("Arrêt du serveur...")
            break

if __name__ == '__main__':
    for _ in range(3):
        create_new_bracelet()
    
    threading.Thread(target=console_listener, daemon=True).start()

    app.run(port=5000)