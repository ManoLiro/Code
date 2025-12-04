# 🔌 Backend - Abitah Bikes Dashboard

Backend da aplicação de monitoramento de bicicletas em tempo real.

## 🚀 Tecnologias

- **FastAPI** - Framework web moderno
- **WebSockets** - Comunicação em tempo real
- **Uvicorn** - Servidor ASGI de alta performance
- **Pydantic** - Validação de dados

## 📦 Instalação

```powershell
# Criar ambiente virtual
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r requirements.txt
```

## ▶️ Execução

```powershell
# Modo padrão
python main.py

# Ou com uvicorn diretamente
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 📡 Endpoints

### HTTP REST

#### `POST /api/ftms`
Recebe dados das bicicletas (usado pelos ESP32).

**Request Body:**
```json
{
  "ts": 1697395200.0,
  "src": "esp32-ftms",
  "device": "BIKE-0775",
  "reading": {
    "instant_speed": 25.5,
    "instant_power": 180,
    "instant_cadence": 85,
    "total_distance": 5420,
    "heart_rate": 145
  }
}
```

**Response:**
```json
{
  "status": "ok",
  "device": "BIKE-0775"
}
```

#### `GET /api/bikes`
Retorna dados de todas as bikes cadastradas.

**Response:**
```json
{
  "bikes": {
    "BIKE-0775": {
      "device": "BIKE-0775",
      "last_update": "2024-10-15T10:30:45.123456",
      "instant_speed": 25.5,
      "instant_power": 180
    }
  }
}
```

#### `GET /`
Status da API e estatísticas.

**Response:**
```json
{
  "app": "Bike Dashboard API",
  "status": "running",
  "active_bikes": 5,
  "active_connections": 3
}
```

### WebSocket

#### `WS /ws`
Conexão WebSocket para receber atualizações em tempo real.

**Mensagens do servidor:**

1. Dados iniciais (ao conectar):
```json
{
  "type": "initial",
  "bikes": {
    "BIKE-0775": { ... }
  }
}
```

2. Atualização de bike:
```json
{
  "type": "update",
  "device": "BIKE-0775",
  "data": {
    "device": "BIKE-0775",
    "instant_speed": 26.2,
    ...
  }
}
```

**Mensagens do cliente:**
```json
"ping"
```

**Resposta:**
```json
{
  "type": "pong"
}
```

## 🔧 Configuração

### Variáveis de Ambiente (opcional)

Crie um arquivo `.env`:
```env
HOST=0.0.0.0
PORT=8000
```

### CORS

Por padrão, CORS está configurado para aceitar qualquer origem (`allow_origins=["*"]`).

Para produção, modifique em `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://seu-dominio.com"],
    ...
)
```

## 📊 Estrutura de Dados

### BikeReading (Input)
```python
class BikeReading(BaseModel):
    ts: float                    # Timestamp Unix
    src: str                     # Fonte dos dados
    device: str                  # Nome único da bike
    reading: Dict[str, Any]      # Métricas da bike
```

### Bike Data (Armazenado)
```python
{
    "device": str,               # Nome da bike
    "last_update": str,          # ISO 8601 timestamp
    "timestamp": float,          # Unix timestamp
    "instant_speed": float,      # km/h
    "instant_power": int,        # Watts
    "instant_cadence": float,    # RPM
    "total_distance": int,       # metros
    "heart_rate": int,           # BPM
    ...
}
```

## 🔍 Logs

O servidor exibe logs úteis:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
Cliente desconectado. Conexões ativas: 2
```

## 🐛 Debug

### Testar endpoint POST
```powershell
# PowerShell
$body = @{
    ts = [Math]::Floor((Get-Date).ToUniversalTime().Subtract((Get-Date "1970-01-01")).TotalSeconds)
    src = "test"
    device = "BIKE-TEST"
    reading = @{
        instant_speed = 25.5
        instant_power = 180
    }
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8000/api/ftms" -Method Post -Body $body -ContentType "application/json"
```

### Testar WebSocket
Use uma ferramenta como **WebSocket King** ou **Postman** para conectar em `ws://localhost:8000/ws`

## ⚡ Performance

- Suporta múltiplas conexões WebSocket simultâneas
- Broadcast assíncrono para todos os clientes
- Cleanup automático de conexões mortas
- Armazenamento em memória (rápido mas volátil)

## 📈 Melhorias Futuras

- [ ] Adicionar Redis para cache
- [ ] Implementar persistência em banco de dados
- [ ] Adicionar autenticação JWT
- [ ] Rate limiting
- [ ] Logging estruturado
- [ ] Métricas Prometheus
- [ ] Containerização (Docker)

## 🔒 Segurança (Produção)

Para ambiente de produção, considere:

1. **HTTPS**: Use certificado SSL/TLS
2. **Autenticação**: Implemente tokens JWT
3. **Rate Limiting**: Limite requisições por IP
4. **Validação**: Valide origem das requisições
5. **Firewall**: Restrinja acesso ao backend

---

**Backend pronto para receber dados de múltiplas bikes! 🚴‍♂️**
