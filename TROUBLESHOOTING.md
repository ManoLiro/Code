# 🔧 TROUBLESHOOTING - Solução de Problemas

Guia completo para resolver problemas comuns no dashboard Abitah Bikes.

## 🚨 Problemas Comuns

### 1. Backend não inicia

#### Sintoma
```powershell
python main.py
# Erro: ModuleNotFoundError: No module named 'fastapi'
```

#### Solução
```powershell
# Verifique se está no ambiente virtual
.\venv\Scripts\Activate.ps1

# Reinstale as dependências
pip install -r requirements.txt

# Verifique a instalação
pip list | Select-String fastapi
```

#### Sintoma
```
ERROR: [Errno 10048] Only one usage of each socket address...
```

#### Solução
A porta 8000 já está em uso. Opções:

```powershell
# Opção 1: Encontrar e matar o processo
netstat -ano | findstr :8000
taskkill /PID [número_do_pid] /F

# Opção 2: Usar outra porta
# Edite main.py, última linha:
uvicorn.run(app, host="0.0.0.0", port=8001)
```

---

### 2. Frontend não inicia

#### Sintoma
```powershell
npm run dev
# Erro: Cannot find module 'vite'
```

#### Solução
```powershell
# Delete node_modules e package-lock.json
Remove-Item -Recurse -Force node_modules, package-lock.json

# Reinstale tudo
npm install

# Tente novamente
npm run dev
```

#### Sintoma
```
Error: listen EADDRINUSE: address already in use :::3000
```

#### Solução
```powershell
# A porta 3000 está em uso
# Opção 1: Matar o processo
netstat -ano | findstr :3000
taskkill /PID [número_do_pid] /F

# Opção 2: Usar outra porta
# Edite vite.config.js:
server: {
  port: 3001
}
```

---

### 3. WebSocket não conecta

#### Sintoma
No console do navegador (F12):
```
WebSocket connection to 'ws://localhost:8000/ws' failed
```

#### Diagnóstico
```powershell
# 1. Verifique se o backend está rodando
Invoke-RestMethod http://localhost:8000

# Deve retornar:
# app: Bike Dashboard API
# status: running
```

#### Solução A: Backend não está rodando
```powershell
cd bike-dashboard-backend
.\venv\Scripts\Activate.ps1
python main.py
```

#### Solução B: URL incorreta no frontend
Edite `src/App.jsx`:
```javascript
// Verifique se a URL está correta
const WS_URL = 'ws://localhost:8000/ws'  // ✅ Correto
// NÃO: 'ws://localhost:8000'            // ❌ Errado
// NÃO: 'http://localhost:8000/ws'       // ❌ Errado
```

#### Solução C: Firewall bloqueando
```powershell
# Adicione exceção no firewall
New-NetFirewallRule -DisplayName "Abitah Backend" -Direction Inbound -Port 8000 -Protocol TCP -Action Allow
```

---

### 4. Bikes não aparecem no dashboard

#### Sintoma
Dashboard mostra "Aguardando dados das bicicletas..." indefinidamente.

#### Diagnóstico Passo a Passo

**1. Backend está recebendo dados?**
```powershell
# Verifique o endpoint
Invoke-RestMethod http://localhost:8000/api/bikes

# Resposta esperada:
# bikes: @{}  (vazio se nenhuma bike enviou dados)
```

**2. Teste manual enviando dados:**
```powershell
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

Se a bike "BIKE-TEST" aparecer no dashboard, o problema está no ESP32.

**3. Verifique o WebSocket no navegador:**
- Abra DevTools (F12)
- Vá em Network > WS
- Deve ver conexão ativa em `ws://localhost:8000/ws`
- Clique na conexão e veja mensagens

**4. ESP32 não está enviando dados:**
- Verifique logs do ESP32 (conexão serial)
- Confirme que o ESP32 conectou no Wi-Fi
- Confirme que a URL do endpoint está correta
- Teste ping do ESP32 para o servidor

---

### 5. Bikes aparecem mas não atualizam

#### Sintoma
Cards de bikes aparecem mas ficam congelados, não atualizam em tempo real.

#### Diagnóstico
```javascript
// Console do navegador (F12)
// Deve ver mensagens WebSocket chegando
```

#### Solução
```powershell
# 1. Verifique se o WebSocket está conectado
# No header do dashboard deve mostrar: 🟢 Conectado

# 2. Verifique no console do navegador
# Network > WS > Messages
# Deve ver mensagens chegando a cada 2 segundos (se usando simulador)

# 3. Reinicie o frontend
# Ctrl+C e depois:
npm run dev
```

---

### 6. Simulador não funciona

#### Sintoma
```powershell
python simulator.py
# ❌ BIKE-0001: Falha na conexão - Connection refused
```

#### Solução
```powershell
# 1. Verifique se o backend está rodando
# Abra outro terminal:
cd bike-dashboard-backend
python main.py

# 2. Verifique a URL no simulator.py
BACKEND_URL = "http://localhost:8000/api/ftms"  # ✅ Correto
```

#### Sintoma
```powershell
# ❌ BIKE-0001: Erro 422
```

#### Solução
O formato dos dados está incorreto. Verifique se `simulator.py` tem a estrutura correta:
```python
{
    "ts": time.time(),           # Float, não string
    "src": "simulator",          # String
    "device": "BIKE-0001",       # String
    "reading": {                 # Dict
        "instant_speed": 25.5    # Float/Int
    }
}
```

---

### 7. Erros no Console do Navegador

#### Sintoma
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

#### Solução
Verifique `main.py` do backend:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ✅ Deve ser "*" ou incluir "http://localhost:3000"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### Sintoma
```
Uncaught SyntaxError: Unexpected token '<'
```

#### Solução
Problema no build do React:
```powershell
# Limpe o cache
Remove-Item -Recurse -Force node_modules, dist

# Reinstale e reconstrua
npm install
npm run dev
```

---

### 8. Performance / Lentidão

#### Sintoma
Dashboard fica lento com muitas bikes.

#### Solução

**1. Otimize o backend:**
```python
# main.py - Limite histórico de dados
MAX_BIKES = 20

@app.post("/api/ftms")
async def receive_bike_data(data: BikeReading):
    if len(bike_data) >= MAX_BIKES and data.device not in bike_data:
        return {"status": "rejected", "reason": "max bikes reached"}
```

**2. Otimize o frontend:**
```javascript
// App.jsx - Use React.memo para cards
import { memo } from 'react'

const BikeCard = memo(({ bike }) => {
  // ... componente
})
```

**3. Reduza frequência de envio:**
```python
# No ESP32 ou simulator.py
time.sleep(5)  # Mude de 2 para 5 segundos
```

---

### 9. ESP32 específicos

#### Sintoma
ESP32 não encontra a bike FTMS.

#### Solução
```python
# CodigoMicroPythonBase.py

# 1. Verifique o nome da bike
BIKE_NAME_SUBSTR = "BIKE-0775"  # Deve ser exato ou None

# 2. Aumente timeout do scan
async with aioble.scan(30_000, ...):  # 30 segundos

# 3. Teste sem filtro de nome
BIKE_NAME_SUBSTR = None  # Aceita qualquer bike FTMS
```

#### Sintoma
ESP32 conecta mas perde conexão.

#### Solução
```python
# Adicione retry na conexão
max_attempts = 5

for attempt in range(max_attempts):
    try:
        conn = await device.connect(timeout=15_000)
        break
    except Exception as e:
        if attempt < max_attempts - 1:
            await asyncio.sleep(3)
        else:
            raise
```

---

### 10. Acesso remoto não funciona

#### Sintoma
Não consigo acessar de outro dispositivo na rede.

#### Solução

**1. Descubra seu IP:**
```powershell
ipconfig
# Procure: Endereço IPv4 . . . . . . . . . : 192.168.1.100
```

**2. Configure o backend para aceitar conexões externas:**
```python
# main.py - Já está configurado:
uvicorn.run(app, host="0.0.0.0", port=8000)  # ✅
# NÃO: host="localhost"  # ❌
```

**3. Configure o frontend:**
```javascript
// src/App.jsx
const WS_URL = 'ws://192.168.1.100:8000/ws'  // Use seu IP
```

**4. Reconstrua o frontend:**
```powershell
npm run build
npm run preview
```

**5. Teste de outro dispositivo:**
```
http://192.168.1.100:3000
```

**6. Firewall:**
```powershell
# Permita as portas
New-NetFirewallRule -DisplayName "Abitah Backend" -Direction Inbound -Port 8000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Abitah Frontend" -Direction Inbound -Port 3000 -Protocol TCP -Action Allow
```

---

## 🔍 Ferramentas de Debug

### 1. Logs do Backend
```powershell
# Modo verbose
uvicorn main:app --host 0.0.0.0 --port 8000 --log-level debug
```

### 2. Console do Navegador (Frontend)
```
F12 > Console
# Veja mensagens de erro
# Veja logs do WebSocket
```

### 3. Network Inspector
```
F12 > Network > WS
# Veja mensagens WebSocket em tempo real
```

### 4. Testar Endpoints Manualmente
```powershell
# Status da API
Invoke-RestMethod http://localhost:8000

# Listar bikes
Invoke-RestMethod http://localhost:8000/api/bikes

# Enviar dados
$body = @{...} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:8000/api/ftms -Method Post -Body $body -ContentType "application/json"
```

### 5. Verificar Processos
```powershell
# Ver o que está rodando nas portas
netstat -ano | findstr :8000
netstat -ano | findstr :3000
```

---

## 📞 Checklist de Diagnóstico

Quando algo não funcionar, siga esta ordem:

- [ ] 1. Backend está rodando? (`http://localhost:8000`)
- [ ] 2. Frontend está rodando? (`http://localhost:3000`)
- [ ] 3. WebSocket conectado? (ícone verde no header)
- [ ] 4. Backend recebe dados? (`/api/bikes`)
- [ ] 5. Firewall não está bloqueando?
- [ ] 6. URLs estão corretas no código?
- [ ] 7. Dependências instaladas corretamente?
- [ ] 8. Console do navegador mostra erros?
- [ ] 9. Logs do backend mostram erros?
- [ ] 10. Tentou reiniciar tudo?

---

## 🆘 Último Recurso

Se nada funcionar:

```powershell
# 1. LIMPE TUDO

# Backend
cd bike-dashboard-backend
Remove-Item -Recurse -Force venv
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Frontend
cd bike-dashboard-frontend
Remove-Item -Recurse -Force node_modules, package-lock.json, dist
npm install

# 2. REINICIE TUDO
# Backend (terminal 1)
python main.py

# Frontend (terminal 2)
npm run dev

# 3. TESTE COM SIMULADOR
# Backend (terminal 3)
python simulator.py

# 4. ACESSE
# http://localhost:3000
```

---

**Se o problema persistir, verifique os logs detalhadamente! 🔍**
