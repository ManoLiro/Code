from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import asyncio
import json
import sqlite3
import os
from datetime import datetime
import time

app = FastAPI(title="Bike Dashboard API")

# CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ──────────────────────────────────────────────
# SQLite – Banco de dados para alunos e vínculos
# ──────────────────────────────────────────────
DB_PATH = os.path.join(os.path.dirname(__file__), "abitah_bikes.db")


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS students (
            cpf TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            weight REAL NOT NULL,
            height REAL NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bike_assignments (
            device TEXT PRIMARY KEY,
            student_cpf TEXT NOT NULL,
            assigned_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_cpf) REFERENCES students(cpf)
        )
    """)
    conn.commit()
    conn.close()


# Inicializa banco na startup
init_db()


# ──────────────────────────────────────────
# Modelos Pydantic
# ──────────────────────────────────────────
class BikeReading(BaseModel):
    ts: float
    src: str
    device: str
    reading: Dict[str, Any]


class StudentCreate(BaseModel):
    cpf: str
    name: str
    weight: float
    height: float


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    weight: Optional[float] = None
    height: Optional[float] = None


class BikeAssignment(BaseModel):
    device: str
    student_cpf: str


# ──────────────────────────────────────────
# Estado em memória das bikes
# ──────────────────────────────────────────
bike_data: Dict[str, Dict[str, Any]] = {}
bike_state: Dict[str, Dict[str, Any]] = {}
active_connections: List[WebSocket] = []


def calculate_speed_from_power_and_cadence(power: float, cadence: float) -> float:
    """
    Calcula a velocidade (km/h) baseada na potência (W) e cadência (RPM).
    """
    speed_from_cadence = cadence * 2.1 * 3.5 * 60 / 1000
    power_factor = 0.9 + (power - 80) / (250 - 80) * 0.25
    power_factor = max(0.8, min(1.2, power_factor))
    speed = speed_from_cadence * power_factor
    return round(speed, 1)


# ──────────────────────────────────────────
# Endpoints – Dados das bikes (apenas 4 métricas)
# ──────────────────────────────────────────
@app.post("/api/ftms")
async def receive_bike_data(data: BikeReading):
    """
    Recebe dados das bicicletas (ESP32).
    Apenas cadência e potência são recebidos; velocidade e distância são calculados.
    """
    device_name = data.device
    current_time = time.time()

    if device_name not in bike_state:
        bike_state[device_name] = {
            "total_distance": 0.0,
            "last_timestamp": current_time,
        }

    reading = data.reading
    instant_power = reading.get("instant_power", 0)
    instant_cadence = reading.get("instant_cadence", 0)

    instant_speed = calculate_speed_from_power_and_cadence(instant_power, instant_cadence)

    time_delta = current_time - bike_state[device_name]["last_timestamp"]
    if time_delta > 0:
        distance_increment = (instant_speed * time_delta / 3600) * 1000
        bike_state[device_name]["total_distance"] += distance_increment

    bike_state[device_name]["last_timestamp"] = current_time

    bike_data[device_name] = {
        "device": device_name,
        "last_update": datetime.now().isoformat(),
        "timestamp": data.ts,
        "instant_speed": instant_speed,
        "instant_power": instant_power,
        "instant_cadence": instant_cadence,
        "total_distance": int(bike_state[device_name]["total_distance"]),
    }

    if active_connections:
        message = json.dumps({
            "type": "update",
            "device": device_name,
            "data": bike_data[device_name],
        })
        await broadcast(message)

    return {"status": "ok", "device": device_name}


@app.get("/api/bikes")
async def get_all_bikes():
    return {"bikes": bike_data}


# ──────────────────────────────────────────
# Endpoints – CRUD de Alunos
# ──────────────────────────────────────────
@app.get("/api/students")
async def list_students():
    conn = get_db()
    rows = conn.execute("SELECT * FROM students ORDER BY name").fetchall()
    conn.close()
    return {"students": [dict(r) for r in rows]}


@app.get("/api/students/{cpf}")
async def get_student(cpf: str):
    conn = get_db()
    row = conn.execute("SELECT * FROM students WHERE cpf = ?", (cpf,)).fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    return dict(row)


@app.post("/api/students")
async def create_student(student: StudentCreate):
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO students (cpf, name, weight, height) VALUES (?, ?, ?, ?)",
            (student.cpf, student.name, student.weight, student.height),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=409, detail="CPF já cadastrado")
    conn.close()
    return {"status": "ok", "cpf": student.cpf}


@app.put("/api/students/{cpf}")
async def update_student(cpf: str, student: StudentUpdate):
    conn = get_db()
    existing = conn.execute("SELECT * FROM students WHERE cpf = ?", (cpf,)).fetchone()
    if not existing:
        conn.close()
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    updates = {}
    if student.name is not None:
        updates["name"] = student.name
    if student.weight is not None:
        updates["weight"] = student.weight
    if student.height is not None:
        updates["height"] = student.height
    if updates:
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        values = list(updates.values()) + [cpf]
        conn.execute(f"UPDATE students SET {set_clause} WHERE cpf = ?", values)
        conn.commit()
    conn.close()
    return {"status": "ok", "cpf": cpf}


@app.delete("/api/students/{cpf}")
async def delete_student(cpf: str):
    conn = get_db()
    conn.execute("DELETE FROM bike_assignments WHERE student_cpf = ?", (cpf,))
    result = conn.execute("DELETE FROM students WHERE cpf = ?", (cpf,))
    conn.commit()
    if result.rowcount == 0:
        conn.close()
        raise HTTPException(status_code=404, detail="Aluno não encontrado")
    conn.close()

    # Notifica frontend que vínculos mudaram
    await broadcast_assignments()

    return {"status": "ok"}


# ──────────────────────────────────────────
# Endpoints – Vínculo Bike ↔ Aluno
# ──────────────────────────────────────────
@app.get("/api/assignments")
async def list_assignments():
    conn = get_db()
    rows = conn.execute("""
        SELECT ba.device, ba.student_cpf, s.name as student_name, s.weight, s.height
        FROM bike_assignments ba
        JOIN students s ON ba.student_cpf = s.cpf
    """).fetchall()
    conn.close()
    assignments = {r["device"]: dict(r) for r in rows}
    return {"assignments": assignments}


@app.post("/api/assignments")
async def assign_student_to_bike(assignment: BikeAssignment):
    conn = get_db()
    # Verifica se o aluno existe
    student = conn.execute("SELECT * FROM students WHERE cpf = ?", (assignment.student_cpf,)).fetchone()
    if not student:
        conn.close()
        raise HTTPException(status_code=404, detail="Aluno não encontrado")

    # Upsert – substitui se já existe vínculo para esse device
    conn.execute(
        "INSERT OR REPLACE INTO bike_assignments (device, student_cpf) VALUES (?, ?)",
        (assignment.device, assignment.student_cpf),
    )
    conn.commit()
    conn.close()

    await broadcast_assignments()

    return {"status": "ok", "device": assignment.device, "student_cpf": assignment.student_cpf}


@app.delete("/api/assignments/{device}")
async def unassign_bike(device: str):
    conn = get_db()
    conn.execute("DELETE FROM bike_assignments WHERE device = ?", (device,))
    conn.commit()
    conn.close()

    await broadcast_assignments()

    return {"status": "ok"}


@app.post("/api/assignments/reset")
async def reset_all_assignments():
    """Remove todos os vínculos – usado ao trocar de turma."""
    conn = get_db()
    conn.execute("DELETE FROM bike_assignments")
    conn.commit()
    conn.close()

    await broadcast_assignments()

    return {"status": "ok", "message": "Todos os vínculos foram removidos"}


async def broadcast_assignments():
    """Envia a lista atualizada de vínculos para todos os clientes WS."""
    conn = get_db()
    rows = conn.execute("""
        SELECT ba.device, ba.student_cpf, s.name as student_name, s.weight, s.height
        FROM bike_assignments ba
        JOIN students s ON ba.student_cpf = s.cpf
    """).fetchall()
    conn.close()
    assignments = {r["device"]: dict(r) for r in rows}
    msg = json.dumps({"type": "assignments", "assignments": assignments})
    await broadcast(msg)


# ──────────────────────────────────────────
# WebSocket
# ──────────────────────────────────────────
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)

    # Envia dados iniciais + vínculos
    conn = get_db()
    rows = conn.execute("""
        SELECT ba.device, ba.student_cpf, s.name as student_name, s.weight, s.height
        FROM bike_assignments ba
        JOIN students s ON ba.student_cpf = s.cpf
    """).fetchall()
    conn.close()
    assignments = {r["device"]: dict(r) for r in rows}

    await websocket.send_text(json.dumps({
        "type": "initial",
        "bikes": bike_data,
        "assignments": assignments,
    }))

    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        active_connections.remove(websocket)
        print(f"Cliente desconectado. Conexões ativas: {len(active_connections)}")


async def broadcast(message: str):
    disconnected = []
    for connection in active_connections:
        try:
            await connection.send_text(message)
        except:
            disconnected.append(connection)
    for connection in disconnected:
        active_connections.remove(connection)


@app.get("/")
async def root():
    return {
        "app": "Bike Dashboard API",
        "status": "running",
        "active_bikes": len(bike_data),
        "active_connections": len(active_connections),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
