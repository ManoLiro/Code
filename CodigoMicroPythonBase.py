import uasyncio as asyncio
import network, time
import bluetooth, aioble
import urequests
import ujson
import struct
import machine

# ====== CONFIGURAÇÃO ======
WIFI_SSID = "Abitah_Bikes"
WIFI_PSK  = "01020304"
ENDPOINT_URL = "http://172.20.10.2:8000/api/ftms"

# Filtrar por nome (sem MAC)
BIKE_NAME_SUBSTR = "BIKE-0775"    # por exemplo: "SmartBike"; ou None para aceitar qualquer FTMS

# UUIDs FTMS (Assigned Numbers)
FTMS_SERVICE_UUID = bluetooth.UUID(0x1826)
INDOOR_BIKE_DATA_UUID = bluetooth.UUID(0x2AD2)

# ====== REDE ======
def wifi_connect():
    wlan = network.WLAN(network.STA_IF)
    if not wlan.active():
        wlan.active(True)
    if not wlan.isconnected():
        wlan.connect(WIFI_SSID, WIFI_PSK)
        for _ in range(50):
            if wlan.isconnected():
                break
            time.sleep_ms(200)
    return wlan.isconnected()

# ====== PARSER FTMS ======
def _u16_le(b, off):
    # unsigned 16-bit little-endian
    return (b[off] | (b[off+1] << 8))

def _s16_le(b, off):
    # signed 16-bit little-endian usando struct (evita signed kwarg em int.from_bytes)
    return struct.unpack_from("<h", b, off)[0]

def parse_indoor_bike_data(msg: bytes) -> dict:
    if len(msg) < 2:
        return {}

    f0 = msg[0]
    f1 = msg[1]

    flag_more_data            = bool(f0 & 0b00000001)
    flag_average_speed        = bool(f0 & 0b00000010)
    flag_instant_cadence      = bool(f0 & 0b00000100)
    flag_average_cadence      = bool(f0 & 0b00001000)
    flag_total_distance       = bool(f0 & 0b00010000)
    flag_resistance_level     = bool(f0 & 0b00100000)
    flag_instant_power        = bool(f0 & 0b01000000)
    flag_average_power        = bool(f0 & 0b10000000)

    flag_expended_energy      = bool(f1 & 0b00000001)
    flag_heart_rate           = bool(f1 & 0b00000010)
    flag_metabolic_equivalent = bool(f1 & 0b00000100)
    flag_elapsed_time         = bool(f1 & 0b00001000)
    flag_remaining_time       = bool(f1 & 0b00010000)

    i = 2
    out = {}

    if not flag_more_data:
        if i + 2 <= len(msg):
            out["instant_speed"] = _u16_le(msg, i) / 100.0
        i += 2

    if flag_average_speed:
        if i + 2 <= len(msg):
            out["average_speed"] = _u16_le(msg, i) / 100.0
        i += 2

    if flag_instant_cadence:
        if i + 2 <= len(msg):
            out["instant_cadence"] = _u16_le(msg, i) / 2.0
        i += 2

    if flag_average_cadence:
        if i + 2 <= len(msg):
            out["average_cadence"] = _u16_le(msg, i) / 2.0
        i += 2

    if flag_total_distance:
        if i + 3 <= len(msg):
            # 24-bit little-endian
            out["total_distance"] = msg[i] | (msg[i+1] << 8) | (msg[i+2] << 16)
        i += 3

    if flag_resistance_level:
        if i + 2 <= len(msg):
            out["resistance_level"] = _s16_le(msg, i)
        i += 2

    if flag_instant_power:
        if i + 2 <= len(msg):
            out["instant_power"] = _s16_le(msg, i)
        i += 2

    if flag_average_power:
        if i + 2 <= len(msg):
            out["average_power"] = _s16_le(msg, i)
        i += 2

    if flag_expended_energy:
        if i + 5 <= len(msg):
            out["total_energy"]      = _u16_le(msg, i)
            out["energy_per_hour"]   = _u16_le(msg, i+2)
            out["energy_per_minute"] = msg[i+4]
        i += 5

    if flag_heart_rate:
        if i + 1 <= len(msg):
            out["heart_rate"] = msg[i]
        i += 1

    if flag_metabolic_equivalent:
        if i + 1 <= len(msg):
            out["metabolic_equivalent"] = msg[i] / 10.0
        i += 1

    if flag_elapsed_time:
        if i + 2 <= len(msg):
            out["elapsed_time"] = _u16_le(msg, i)
        i += 2

    if flag_remaining_time:
        if i + 2 <= len(msg):
            out["remaining_time"] = _u16_le(msg, i)
        i += 2

    return out

# ====== HTTP ======
def post_json(payload: dict):
    try:
        headers = {"Content-Type": "application/json"}
        print(payload)
        r = urequests.post(ENDPOINT_URL, data=ujson.dumps(payload), headers=headers)
        try:
            _ = r.text  # consome a resposta (opcional)
        except:
            pass
        r.close()
        return True
    except Exception as e:
        print("POST falhou:", e)
        return False

# ====== BLE / AIOBLE ======
async def find_and_connect_ftms():
    device = None
    max_attempts = 3  # 1 tentativa inicial + 5 retentativas

    # 1. Laço principal para controlar as tentativas
    for attempt in range(max_attempts):
        print(f"--- Buscando dispositivo: Tentativa {attempt + 1}/{max_attempts} ---")
        
        # O bloco de scan original agora fica dentro do laço
        async with aioble.scan(10_000, 300_000, 30_000, True) as scanner:
            async for res in scanner:
                name = res.name() or ""
                has_ftms = any(u == FTMS_SERVICE_UUID for u in res.services())
                if (BIKE_NAME_SUBSTR is None or BIKE_NAME_SUBSTR.lower() in name.lower()) and has_ftms:
                    device = res.device
                    try:
                        print(f"✅ Dispositivo encontrado: {name} ({device.addr_hex()})")
                    except:
                        print(f"✅ Dispositivo encontrado: {name}")
                    break  # Sai do scan, pois já achamos o dispositivo

        # 2. Verifica se o dispositivo foi encontrado nesta tentativa
        if device:
            break  # Se sim, sai do laço de tentativas

        # 3. Se não encontrou, informa o usuário e espera antes da próxima tentativa
        print("Dispositivo não encontrado nesta busca.")
        if attempt < max_attempts - 1: # Evita esperar após a última tentativa
            print("Aguardando 3 segundos para tentar novamente...")
            await asyncio.sleep(3)

    # 4. Após o fim de todas as tentativas, lança a exceção se o dispositivo ainda for None
    if not device:
        raise Exception(f"Nenhuma bike FTMS encontrada após {max_attempts} tentativas.")

    # O resto do seu código original para conectar e assinar permanece igual
    print("\nConectando...")
    conn = await device.connect(10_000)
    try:
        print("Conectado:", device.addr_hex())
    except:
        print("Conectado.")

    svc = None
    ibd = None
    connection_setup_attempts = 5

    # Laço para tentar configurar o serviço e a característica
    for attempt in range(connection_setup_attempts):
        try:
            print(f"Buscando serviços e características (Tentativa {attempt + 1}/{connection_setup_attempts})...")
            svc = await conn.service(FTMS_SERVICE_UUID)
            ibd = await svc.characteristic(INDOOR_BIKE_DATA_UUID)
            await ibd.subscribe(True)
            print("✅ Assinado em 'Indoor Bike Data' (notificações).")
            break

        except Exception as e:
            print(f"⚠️ Erro na configuração do serviço na tentativa {attempt + 1}: {e}")
            if attempt < connection_setup_attempts - 1:
                await asyncio.sleep(3)
            else:
                print("Falha final ao configurar o serviço. Desconectando...")
                await conn.disconnect()
                raise Exception("Não foi possível encontrar o serviço/característica FTMS após a conexão.")

    # Retorna os objetos somente se a configuração foi bem-sucedida
    return conn, ibd, device

async def stream_loop():
    # Qualquer falha aqui deve explodir até o topo pra provocar soft reboot.
    if not wifi_connect():
        raise Exception("Falha ao conectar no Wi‑Fi.")

    conn, ibd, device = await find_and_connect_ftms()

    # cache do endereço (se disponível)
    try:
        dev_hex = device.addr_hex()
    except:
        dev_hex = None

    while True:
        # Se qualquer await der erro, deixa subir para o main() e resetar.
        data = await ibd.notified()
        reading = parse_indoor_bike_data(data)
        if reading:
            payload = {
                "ts": time.time(),
                "src": "esp32-ftms",
                "device": BIKE_NAME_SUBSTR,
                "reading": reading,
            }
            post_json(payload)


def main():
    try:
        asyncio.run(stream_loop())
    except Exception as e:
        print("Falha fatal:", e)
        main()
    finally:
        # Mantém compatível com seu padrão atual
        asyncio.new_event_loop()

if __name__ == "__main__":
    main()
