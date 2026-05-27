const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponíveis:`);
  console.log(`   GET    /tarefas`);
  console.log(`   GET    /tarefas/:id`);
  console.log(`   POST   /tarefas`);
  console.log(`   PUT    /tarefas/:id`);
  console.log(`   PATCH  /tarefas/:id/concluir`);
  console.log(`   DELETE /tarefas/:id`);
});
