# 🚀 GUIA RÁPIDO DE INÍCIO

## Passo 1: Backend

```powershell
cd bike-dashboard-backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py
```

✅ Backend rodando em http://localhost:8000

## Passo 2: Frontend

**Abra um NOVO terminal PowerShell**

```powershell
cd bike-dashboard-frontend
npm install
npm run dev
```

✅ Frontend rodando em http://localhost:3000

## Passo 3: Configurar ESP32

1. Abra `CodigoMicroPythonBase.py`
2. Altere estas linhas:

```python
# Coloque o IP da sua máquina
ENDPOINT_URL = "http://192.168.1.100:8000/api/ftms"

# Nome único para cada bike
BIKE_NAME_SUBSTR = "BIKE-0001"  # Use BIKE-0002, BIKE-0003, etc.
```

3. Faça upload do código para o ESP32

## Passo 4: Testar

1. Acesse http://localhost:3000
2. Você deve ver "Aguardando dados das bicicletas..."
3. Quando o ESP32 conectar, a bike aparecerá no dashboard

## 🎨 O que você verá

- **Header**: Logo Abitah Bikes, contador de bikes ativas, status da conexão
- **Cards de bikes**: Um card para cada bike mostrando métricas em tempo real
- **Cores**: Laranja (marca) + Preto elegante com gradientes
- **Responsivo**: Funciona perfeitamente em mobile, tablet e desktop

## ⚡ Comandos Úteis

### Verificar se o backend está funcionando
```powershell
# PowerShell
Invoke-RestMethod http://localhost:8000
```

### Ver todas as bikes conectadas
```powershell
Invoke-RestMethod http://localhost:8000/api/bikes
```

### Parar os servidores
- Backend: `Ctrl + C`
- Frontend: `Ctrl + C`

## 🐛 Problemas Comuns

**Backend não inicia:**
- Verifique se a porta 8000 está livre
- Verifique se o Python está instalado: `python --version`

**Frontend não inicia:**
- Verifique se o Node.js está instalado: `node --version`
- Delete `node_modules` e rode `npm install` novamente

**Bikes não aparecem:**
- Verifique se o ESP32 está conectado ao Wi-Fi
- Verifique se a URL no ESP32 está correta (use o IP da sua máquina)
- Verifique os logs do backend

## 📱 Acessar de outros dispositivos

1. Descubra o IP da sua máquina:
```powershell
ipconfig
# Procure por "Endereço IPv4"
```

2. Acesse de outro dispositivo na mesma rede:
```
http://SEU_IP:3000
```

## 🎯 Pronto!

Agora você tem um dashboard completo e elegante para monitorar suas 20 bicicletas em tempo real! 🚴‍♂️✨
