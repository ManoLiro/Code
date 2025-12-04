# 🧪 GUIA DE TESTES - Simulador de Bikes

Use este simulador para testar o dashboard **SEM precisar de ESP32 ou bikes reais**.

## 🚀 Como Usar

### 1. Inicie o Backend

```powershell
cd bike-dashboard-backend
.\venv\Scripts\Activate.ps1
python main.py
```

### 2. Inicie o Frontend (outro terminal)

```powershell
cd bike-dashboard-frontend
npm run dev
```

### 3. Execute o Simulador (terceiro terminal)

```powershell
cd bike-dashboard-backend
.\venv\Scripts\Activate.ps1
python simulator.py
```

## 📊 O que o Simulador Faz

- ✅ Simula **5 bicicletas** enviando dados
- ✅ Gera dados **realistas e aleatórios**:
  - Velocidade: 15-35 km/h
  - Potência: 80-250 W
  - Cadência: 60-100 RPM
  - Frequência cardíaca: 110-170 BPM
  - Distância, energia, tempo
- ✅ Envia dados a cada **2 segundos**
- ✅ Mostra status no console

## 📺 Exemplo de Saída

```
🚴 Simulador de Bikes - Abitah Dashboard
============================================================
Backend: http://localhost:8000/api/ftms
Bikes simuladas: 5
============================================================

Pressione Ctrl+C para parar

--- Iteração 1 - 14:30:45 ---
✅ BIKE-0001: Velocidade=28.3 km/h, Potência=185 W
✅ BIKE-0002: Velocidade=22.7 km/h, Potência=142 W
✅ BIKE-0003: Velocidade=31.2 km/h, Potência=220 W
✅ BIKE-0004: Velocidade=19.5 km/h, Potência=98 W
✅ BIKE-0005: Velocidade=26.8 km/h, Potência=167 W

Aguardando 2 segundos...
```

## 🎯 Verificando no Dashboard

1. Abra http://localhost:3000
2. Você verá **5 cards de bikes** aparecendo
3. Os dados serão atualizados em **tempo real**
4. Os cards devem mostrar o indicador **verde "Ativa"**

## ⚙️ Personalização

### Adicionar/Remover Bikes

Edite `simulator.py`:

```python
BIKES = [
    "BIKE-0001",
    "BIKE-0002",
    # Adicione mais bikes aqui
    "BIKE-0020",  # Até 20 bikes!
]
```

### Ajustar Intervalo de Envio

```python
# Linha ~99
time.sleep(2)  # Mude para 1, 3, 5, etc.
```

### Ajustar Valores das Métricas

```python
# Função generate_bike_data(), linha ~23
"instant_speed": round(random.uniform(10.0, 40.0), 1),  # Ajuste min/max
"instant_power": random.randint(50, 300),               # Ajuste min/max
```

## 🛑 Parar o Simulador

Pressione `Ctrl + C` no terminal do simulador.

## 🐛 Solução de Problemas

### Erro de conexão
```
❌ BIKE-0001: Falha na conexão - Connection refused
```

**Solução:** Verifique se o backend está rodando em http://localhost:8000

### Backend não responde
```
❌ BIKE-0001: Erro 500
```

**Solução:** Verifique os logs do backend para erros

### Bikes não aparecem no dashboard

1. Verifique se o frontend está conectado (ícone verde no header)
2. Abra o console do navegador (F12) e procure por erros
3. Teste manualmente: http://localhost:8000/api/bikes

## 💡 Dicas

- **Performance:** O simulador é leve e pode simular até 20+ bikes sem problemas
- **Realismo:** Os valores variam aleatoriamente para simular pedalada real
- **Debugging:** Use os logs do simulador + backend + frontend para rastrear problemas
- **Demo:** Perfeito para demonstrações sem hardware

## 🎬 Workflow de Desenvolvimento

1. **Backend** (terminal 1): `python main.py`
2. **Frontend** (terminal 2): `npm run dev`
3. **Simulador** (terminal 3): `python simulator.py`
4. **Abra navegador**: http://localhost:3000
5. **Desenvolva e teste!** 🎉

---

**Teste seu dashboard facilmente sem precisar de hardware! 🚴‍♂️✨**
