"""
Script de simulação para testar o dashboard sem precisar de ESP32/Bikes reais.
Simula 5 bicicletas enviando dados aleatórios para o backend.
"""

import requests
import time
import random
import json
from datetime import datetime

# URL do backend
BACKEND_URL = "http://localhost:8000/api/ftms"

# Configuração das bikes simuladas
BIKES = [
    "BIKE-0001",
    "BIKE-0002",
    "BIKE-0003",
    "BIKE-0004",
    "BIKE-0005",
    "BIKE-0006",
    "BIKE-0007",
    "BIKE-0008",
    "BIKE-0009",
    "BIKE-0010",
    "BIKE-0011",
    "BIKE-0012",
    "BIKE-0013",
    "BIKE-0014",
    "BIKE-0015",
    "BIKE-0016",
    "BIKE-0017",
    "BIKE-0018",
    "BIKE-0019",
    "BIKE-0020",
]

def generate_bike_data(bike_name):
    """Gera dados aleatórios realistas para uma bike"""
    return {
        "ts": time.time(),
        "src": "simulator",
        "device": bike_name,
        "reading": {
            "instant_speed": round(random.uniform(15.0, 35.0), 1),
            "instant_power": random.randint(80, 250),
            "instant_cadence": round(random.uniform(60.0, 100.0), 1),
            "total_distance": random.randint(1000, 20000),
            "heart_rate": random.randint(110, 170),
            "total_energy": random.randint(50, 500),
            "elapsed_time": random.randint(60, 3600)
        }
    }

def send_bike_data(bike_name):
    """Envia dados de uma bike para o backend"""
    try:
        data = generate_bike_data(bike_name)
        response = requests.post(BACKEND_URL, json=data, timeout=2)
        
        if response.status_code == 200:
            print(f"✅ {bike_name}: Velocidade={data['reading']['instant_speed']} km/h, "
                  f"Potência={data['reading']['instant_power']} W")
        else:
            print(f"❌ {bike_name}: Erro {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ {bike_name}: Falha na conexão - {e}")

def main():
    """Loop principal de simulação"""
    print("🚴 Simulador de Bikes - Abitah Dashboard")
    print("=" * 60)
    print(f"Backend: {BACKEND_URL}")
    print(f"Bikes simuladas: {len(BIKES)}")
    print("=" * 60)
    print("\nPressione Ctrl+C para parar\n")
    
    iteration = 0
    
    try:
        while True:
            iteration += 1
            print(f"\n--- Iteração {iteration} - {datetime.now().strftime('%H:%M:%S')} ---")
            
            # Envia dados de cada bike
            for bike in BIKES:
                send_bike_data(bike)
                time.sleep(0.2)  # Pequeno delay entre bikes
            
            # Aguarda 2 segundos antes da próxima rodada
            print("\nAguardando 2 segundos...")
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Simulador encerrado pelo usuário")
        print("=" * 60)

if __name__ == "__main__":
    main()
