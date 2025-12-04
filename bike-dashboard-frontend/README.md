# 🎨 Frontend - Abitah Bikes Dashboard

Interface web moderna e responsiva para monitoramento em tempo real de bicicletas.

## 🚀 Tecnologias

- **React 18** - Biblioteca UI declarativa
- **Vite** - Build tool ultra-rápido
- **TailwindCSS** - Framework CSS utilitário
- **Lucide React** - Ícones SVG otimizados
- **WebSocket API** - Comunicação em tempo real

## 📦 Instalação

```powershell
npm install
```

## ▶️ Execução

### Desenvolvimento
```powershell
npm run dev
```
Acesse: http://localhost:3000

### Produção
```powershell
# Build otimizado
npm run build

# Preview do build
npm run preview
```

## 🎨 Design System

### Paleta de Cores

Baseada na identidade visual da Abitah Bikes:

```css
/* Laranja (Primary) */
--primary-500: #f97316  /* Cor principal da marca */
--primary-400: #fb923c
--primary-600: #ea580c

/* Preto/Cinza (Dark) */
--dark-900: #1a1a1a     /* Fundo principal */
--dark-800: #454545
--dark-700: #4f4f4f

/* Estados */
--green-400: #4ade80    /* Bike ativa */
--red-400: #f87171      /* Desconectado */
--gray-400: #9ca3af     /* Inativo */
```

### Componentes

#### Header
- Logo e título da empresa
- Contador de bikes ativas
- Indicador de conexão WebSocket

#### BikeCard
- Status da bike (ativo/inativo)
- Métricas principais em destaque
- Métricas secundárias compactas
- Animação de pulse quando ativa

#### BikeGrid
- Layout responsivo (1-5 colunas)
- Estado de carregamento
- Auto-organização

## 🔧 Configuração

### URL do Backend

Edite `src/App.jsx`:
```javascript
const WS_URL = 'ws://localhost:8000/ws'
```

Para produção, altere para o IP/domínio do servidor:
```javascript
const WS_URL = 'ws://seu-servidor.com:8000/ws'
```

### Tailwind Config

Personalize cores em `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: { ... },
      dark: { ... }
    }
  }
}
```

## 📊 Estrutura de Componentes

```
App.jsx                          # Componente raiz
├── Header.jsx                   # Cabeçalho com status
└── BikeGrid.jsx                 # Grid de bikes
    └── BikeCard.jsx             # Card individual
        ├── MetricBox            # Métrica principal
        └── SmallMetric          # Métrica secundária

hooks/
└── useWebSocket.js              # Hook customizado WebSocket
```

## 🌐 WebSocket Integration

### Hook useWebSocket

```javascript
const { isConnected, lastMessage } = useWebSocket(url)
```

**Funcionalidades:**
- Conexão automática ao montar
- Reconexão automática (3s de delay)
- Heartbeat ping a cada 30s
- Cleanup ao desmontar

### Processamento de Mensagens

```javascript
useEffect(() => {
  if (lastMessage) {
    const data = JSON.parse(lastMessage)
    
    if (data.type === 'initial') {
      // Dados iniciais de todas as bikes
      setBikes(data.bikes)
    } else if (data.type === 'update') {
      // Atualização de bike específica
      setBikes(prev => ({
        ...prev,
        [data.device]: data.data
      }))
    }
  }
}, [lastMessage])
```

## 📱 Responsividade

### Breakpoints

```css
/* Mobile: 1 coluna */
sm: 640px   /* Tablet: 2 colunas */
md: 768px   /* Desktop: 3 colunas */
lg: 1024px  /* Desktop: 4 colunas */
xl: 1280px  /* Ultra-wide: 5 colunas */
2xl: 1536px
```

### Grid Layout

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
```

## 🎯 Funcionalidades

### Indicador de Status
Bike é considerada **ativa** se recebeu dados nos últimos 10 segundos:

```javascript
const isActive = () => {
  const lastUpdate = new Date(bike.last_update)
  const now = new Date()
  return (now - lastUpdate) < 10000
}
```

### Formatação de Valores

```javascript
// Valores numéricos
formatValue(25.567, 1, ' km/h') // "25.6 km/h"

// Tempo
formatTime(125) // "2:05"
```

### Métricas Exibidas

**Principais (grandes):**
- Velocidade (km/h)
- Potência (W)
- Cadência (RPM)
- Distância (km)

**Secundárias (pequenas):**
- Frequência cardíaca (BPM)
- Tempo decorrido (mm:ss)
- Energia total (kcal)

## 🎨 Classes CSS Customizadas

### card-bike
```css
.card-bike {
  @apply bg-dark-800/50 backdrop-blur-sm border border-dark-700 rounded-xl p-4 shadow-lg;
  @apply transition-all duration-300 hover:shadow-primary-500/20 hover:border-primary-500/50;
}
```

### metric-value
```css
.metric-value {
  @apply text-2xl font-bold text-primary-400;
}
```

### metric-label
```css
.metric-label {
  @apply text-xs text-gray-400 uppercase tracking-wider;
}
```

## 🔍 Debug

### Console Logs

O hook WebSocket registra eventos importantes:
```
WebSocket conectado
WebSocket desconectado
Tentando reconectar...
Erro no WebSocket: [error]
```

### React DevTools

Instale a extensão [React Developer Tools](https://react.dev/learn/react-developer-tools) para:
- Inspecionar hierarquia de componentes
- Ver props e state em tempo real
- Profiling de performance

## ⚡ Performance

### Otimizações Implementadas

✅ **useCallback** para funções de conexão WebSocket  
✅ **Memoização** de valores calculados  
✅ **CSS otimizado** com TailwindCSS (tree-shaking)  
✅ **Code splitting** automático do Vite  
✅ **Atualização seletiva** de componentes  

### Build de Produção

```powershell
npm run build
```

Gera:
- HTML minificado
- JS com tree-shaking e minificação
- CSS otimizado (apenas classes usadas)
- Assets com hash para cache

Tamanho típico: **< 200KB** (gzipped)

## 🐛 Troubleshooting

### WebSocket não conecta

1. Verifique se o backend está rodando
2. Confirme a URL do WebSocket em `App.jsx`
3. Verifique console do navegador para erros
4. Teste conectividade: `telnet localhost 8000`

### Bikes não aparecem

1. Confirme que ESP32 está enviando dados
2. Verifique endpoint do backend: `http://localhost:8000/api/bikes`
3. Verifique mensagens no WebSocket (DevTools > Network > WS)

### Layout quebrado

1. Limpe cache do navegador
2. Reinstale dependências: `rm -rf node_modules && npm install`
3. Reconstrua: `npm run build`

## 📦 Build para Deploy

### Netlify / Vercel

```powershell
npm run build
```

Configure:
- Build command: `npm run build`
- Publish directory: `dist`

### Servidor próprio (Nginx)

```nginx
server {
    listen 80;
    server_name dashboard.abitahbikes.com;
    
    root /var/www/bike-dashboard/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## 📈 Melhorias Futuras

- [ ] PWA (Progressive Web App)
- [ ] Dark/Light mode toggle
- [ ] Filtros e ordenação de bikes
- [ ] Gráficos históricos (Chart.js)
- [ ] Notificações push
- [ ] Exportar dados (CSV/PDF)
- [ ] Testes automatizados (Vitest)
- [ ] Storybook para componentes

---

**Interface moderna e performática para suas bikes! 🎨🚴‍♂️**
