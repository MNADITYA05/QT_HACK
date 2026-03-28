"""Flask backend for the Quantum Booth Multiplier Puzzle."""
import os

from flask import Flask, jsonify, render_template, request, send_from_directory

from simulator import (
    Gate,
    analyze_circuit,
    build_reference,
    check_solution,
    circuit_metrics,
    generate_truth_table,
    get_next_hint,
    simulate_columns,
    simulate_quantum,
)

app = Flask(__name__)

def gates_from_json(data):
    return [Gate(g.get("id",i), g["type"], g["col"], g["target"], g.get("controls",[])) for i,g in enumerate(data)]

@app.route("/")
def landing():
    return send_from_directory(
        os.path.join(app.root_path, "static", "landing"),
        "index.html",
    )


@app.route("/puzzle")
def puzzle():
    return send_from_directory(
        os.path.join(app.root_path, "static", "landing"),
        "puzzle.html",
    )

@app.route("/theory")
def theory():
    return send_from_directory(
        os.path.join(app.root_path, "static", "landing"),
        "theory.html",
    )

@app.route("/api/check", methods=["POST"])
def api_check():
    d = request.json; a,b = d.get("a",0), d.get("b",0)
    r = check_solution(gates_from_json(d.get("gates",[])), a, b)
    return jsonify({"correct":r.correct,"a_val":r.a_val,"b_val":r.b_val,
                    "p_val":r.p_val,"c_val":r.c_val,"e_val":r.e_val,
                    "expected":r.expected_product,"state":r.state})

@app.route("/api/hint", methods=["POST"])
def api_hint():
    d = request.json; a,b = d.get("a",0), d.get("b",0)
    h = get_next_hint(gates_from_json(d.get("gates",[])), a, b)
    if h: return jsonify({"found":True,"type":h.gate_type,"col":h.col,"target":h.target,"controls":h.controls})
    return jsonify({"found":False})

@app.route("/api/solution", methods=["POST"])
def api_solution():
    d = request.json; a,b = d.get("a",0), d.get("b",0)
    return jsonify({"gates":[{"type":g.gate_type,"col":g.col,"target":g.target,"controls":g.controls} for g in build_reference(a,b)]})

@app.route("/api/simulate_step", methods=["POST"])
def api_simulate_step():
    d = request.json
    out = simulate_quantum(gates_from_json(d.get("gates",[])))
    # out is a list of dicts: {"prob": p, "state_arr": [...], "regs": {...}}
    return jsonify({"states": out})

@app.route("/api/simulate_columns", methods=["POST"])
def api_simulate_columns():
    d = request.json
    timeline = simulate_columns(gates_from_json(d.get("gates", [])))
    return jsonify({"timeline": timeline})

@app.route("/api/analyze_circuit", methods=["POST"])
def api_analyze_circuit():
    d = request.json or {}
    try:
        shots = int(d.get("shots", 256))
    except (TypeError, ValueError):
        shots = 256
    shots = max(1, min(shots, 4096))
    analysis = analyze_circuit(
        gates_from_json(d.get("gates", [])),
        a=d.get("a"),
        b=d.get("b"),
        shots=shots,
    )
    return jsonify(analysis)

@app.route("/api/truth_table", methods=["POST"])
def api_truth_table():
    d = request.json
    rows = generate_truth_table(gates_from_json(d.get("gates", [])))
    return jsonify({"rows": rows})

@app.route("/api/metrics", methods=["POST"])
def api_metrics():
    d = request.json
    m = circuit_metrics(gates_from_json(d.get("gates", [])))
    return jsonify(m)

if __name__ == "__main__": app.run(debug=True, port=5000)
