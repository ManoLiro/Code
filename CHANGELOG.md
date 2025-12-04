# 📄 CHANGELOG - Histórico de Mudanças

## [1.1.0] - 2025-10-20

### ✨ Adicionado
- **Paginação de Bikes**: Sistema de paginação mostrando 10 bikes por página
  - Navegação com botões: Primeira, Anterior, Próxima, Última página
  - Indicador visual da página atual (ex: 1/3)
  - Contador de bikes exibidas (ex: "Mostrando 1 a 10 de 25 bikes")
  - Navegação rápida por números (em telas grandes, quando há até 7 páginas)
  - Design responsivo e alinhado ao tema

### 🎨 Melhorias
- Componente `Pagination.jsx` adicionado com:
  - Ícones de navegação (setas simples e duplas)
  - Botões desabilitados automaticamente nos extremos
  - Efeitos hover elegantes
  - Cores consistentes com o tema Abitah

### 🔧 Alterações Técnicas
- `App.jsx` atualizado para gerenciar paginação
- Nova constante `BIKES_PER_PAGE = 10`
- Cálculo automático de páginas baseado no total de bikes
- Reset automático para página 1 se a página atual ficar vazia

### 📝 Comportamento
- Mostra até 10 bikes por vez
- Paginação aparece apenas quando há mais de 10 bikes
- Ao adicionar/remover bikes, a paginação se ajusta automaticamente
- Estado da página é mantido enquanto navega

---

## [1.0.0] - 2025-10-15

### 🎉 Lançamento Inicial
- Dashboard completo para monitoramento de bikes
- Backend FastAPI com WebSocket
- Frontend React com atualização em tempo real
- Design baseado na identidade Abitah Bikes
- Suporte para até 20 bikes simultâneas
- Documentação completa
- Simulador de testes incluído

---

## 🔮 Próximas Versões

### [1.2.0] - Planejado
- [ ] Busca/filtro de bikes por nome
- [ ] Ordenação (por velocidade, potência, etc.)
- [ ] Visualização em lista (alternativa ao grid)
- [ ] Configuração de bikes por página (5, 10, 20, Todas)

### [1.3.0] - Planejado
- [ ] Favoritar bikes específicas
- [ ] Alertas customizáveis
- [ ] Histórico de sessões
- [ ] Exportação de dados

---

## 📌 Legenda

- ✨ **Adicionado**: Novas funcionalidades
- 🎨 **Melhorias**: Melhorias visuais ou de UX
- 🔧 **Alterações**: Mudanças técnicas
- 🐛 **Corrigido**: Bugs corrigidos
- 🗑️ **Removido**: Funcionalidades removidas
- 📝 **Documentação**: Atualizações na documentação
- 🔒 **Segurança**: Correções de segurança
