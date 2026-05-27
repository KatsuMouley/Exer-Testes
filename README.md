# Exer_Testes — API de Gerenciamento de Tarefas

API REST desenvolvida com **Node.js + Express**, testada com **Jest + Supertest**.

## 📁 Estrutura

```
exer_testes/
├── services/
│   └── tarefaService.js   # Lógica de negócio (CRUD em memória)
├── tests/
│   └── tarefa.test.js     # Testes automatizados (Jest + Supertest)
├── app.js                 # Configuração do Express (exportado para testes)
├── server.js              # Inicialização do servidor HTTP
└── package.json
```

## ▶️ Instalação e uso

```bash
npm install

# Subir servidor
npm start

# Rodar testes
npm test

# Rodar testes com saída detalhada
npm run test:verbose

# Rodar testes com cobertura
npm run test:coverage
```

## 🗺️ Endpoints

| Método | Rota                     | Descrição                      |
|--------|--------------------------|--------------------------------|
| GET    | /tarefas                 | Lista todas (filtro: ?status=) |
| GET    | /tarefas/:id             | Busca por ID                   |
| POST   | /tarefas                 | Cria nova tarefa               |
| PUT    | /tarefas/:id             | Atualiza tarefa                |
| PATCH  | /tarefas/:id/concluir    | Marca como concluída           |
| DELETE | /tarefas/:id             | Remove tarefa                  |

## 📦 Body esperado no POST/PUT

```json
{
  "titulo": "Minha tarefa",          // obrigatório
  "descricao": "Detalhes...",        // opcional
  "prioridade": "baixa|normal|alta"  // opcional (padrão: "normal")
}
```

## 🧪 Cobertura de testes

- Criação com dados válidos e inválidos
- Listagem com e sem filtros de status
- Busca por ID existente e inexistente
- Atualização parcial e validações
- Conclusão e rejeição de dupla conclusão (409)
- Remoção e verificação pós-remoção
- Rotas não mapeadas (404)
"# Exer-Testes" 
