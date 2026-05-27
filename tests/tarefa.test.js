const request = require('supertest');
const app = require('../app');
const tarefaService = require('../services/tarefaService');

// Reinicia o estado antes de cada teste para garantir isolamento
beforeEach(() => {
  tarefaService.resetar();
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /tarefas
// ─────────────────────────────────────────────────────────────────────────────
describe('POST /tarefas', () => {
  test('deve criar uma tarefa com dados válidos', async () => {
    const res = await request(app).post('/tarefas').send({
      titulo: 'Estudar Jest',
      descricao: 'Aprender testes automatizados com Jest e Supertest',
      prioridade: 'alta',
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.titulo).toBe('Estudar Jest');
    expect(res.body.descricao).toBe('Aprender testes automatizados com Jest e Supertest');
    expect(res.body.prioridade).toBe('alta');
    expect(res.body.concluida).toBe(false);
    expect(res.body).toHaveProperty('criadaEm');
  });

  test('deve criar tarefa com prioridade padrão "normal" quando omitida', async () => {
    const res = await request(app).post('/tarefas').send({ titulo: 'Tarefa simples' });

    expect(res.statusCode).toBe(201);
    expect(res.body.prioridade).toBe('normal');
  });

  test('deve criar tarefa com descrição vazia quando omitida', async () => {
    const res = await request(app).post('/tarefas').send({ titulo: 'Sem descrição' });

    expect(res.statusCode).toBe(201);
    expect(res.body.descricao).toBe('');
  });

  test('deve retornar 400 quando o titulo estiver ausente', async () => {
    const res = await request(app).post('/tarefas').send({ descricao: 'Sem título' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('erro');
    expect(res.body.erro).toMatch(/titulo/i);
  });

  test('deve retornar 400 quando o titulo for uma string vazia', async () => {
    const res = await request(app).post('/tarefas').send({ titulo: '   ' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('erro');
  });

  test('deve retornar 400 quando a prioridade for inválida', async () => {
    const res = await request(app).post('/tarefas').send({
      titulo: 'Tarefa',
      prioridade: 'urgentissima',
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.erro).toMatch(/prioridade/i);
  });

  test('IDs devem ser incrementais e únicos', async () => {
    const r1 = await request(app).post('/tarefas').send({ titulo: 'Tarefa 1' });
    const r2 = await request(app).post('/tarefas').send({ titulo: 'Tarefa 2' });

    expect(r1.body.id).toBe(1);
    expect(r2.body.id).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /tarefas
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /tarefas', () => {
  test('deve retornar lista vazia quando não há tarefas', async () => {
    const res = await request(app).get('/tarefas');

    expect(res.statusCode).toBe(200);
    expect(res.body.tarefas).toEqual([]);
    expect(res.body.total).toBe(0);
  });

  test('deve listar todas as tarefas criadas', async () => {
    await request(app).post('/tarefas').send({ titulo: 'A' });
    await request(app).post('/tarefas').send({ titulo: 'B' });
    await request(app).post('/tarefas').send({ titulo: 'C' });

    const res = await request(app).get('/tarefas');

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(3);
    expect(res.body.tarefas).toHaveLength(3);
  });

  test('deve filtrar tarefas pendentes com ?status=pendente', async () => {
    const { body: t1 } = await request(app).post('/tarefas').send({ titulo: 'Pendente 1' });
    const { body: t2 } = await request(app).post('/tarefas').send({ titulo: 'Pendente 2' });
    await request(app).post('/tarefas').send({ titulo: 'Será concluída' });

    // Conclui t1
    await request(app).patch(`/tarefas/${t1.id}/concluir`);

    const res = await request(app).get('/tarefas?status=pendente');

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.tarefas.map((t) => t.id)).not.toContain(t1.id);
    expect(res.body.tarefas.map((t) => t.id)).toContain(t2.id);
  });

  test('deve filtrar tarefas concluídas com ?status=concluida', async () => {
    const { body: t1 } = await request(app).post('/tarefas').send({ titulo: 'A concluir' });
    await request(app).post('/tarefas').send({ titulo: 'Nunca concluída' });

    await request(app).patch(`/tarefas/${t1.id}/concluir`);

    const res = await request(app).get('/tarefas?status=concluida');

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.tarefas[0].id).toBe(t1.id);
    expect(res.body.tarefas[0].concluida).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /tarefas/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('GET /tarefas/:id', () => {
  test('deve retornar a tarefa correta pelo ID', async () => {
    const { body: criada } = await request(app)
      .post('/tarefas')
      .send({ titulo: 'Buscar por ID', prioridade: 'baixa' });

    const res = await request(app).get(`/tarefas/${criada.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(criada.id);
    expect(res.body.titulo).toBe('Buscar por ID');
  });

  test('deve retornar 404 para ID inexistente', async () => {
    const res = await request(app).get('/tarefas/9999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('erro');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /tarefas/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('PUT /tarefas/:id', () => {
  test('deve atualizar titulo e descrição', async () => {
    const { body: criada } = await request(app).post('/tarefas').send({ titulo: 'Original' });

    const res = await request(app)
      .put(`/tarefas/${criada.id}`)
      .send({ titulo: 'Atualizado', descricao: 'Nova descrição' });

    expect(res.statusCode).toBe(200);
    expect(res.body.titulo).toBe('Atualizado');
    expect(res.body.descricao).toBe('Nova descrição');
    expect(res.body).toHaveProperty('atualizadaEm');
    expect(res.body.atualizadaEm).not.toBeNull();
  });

  test('deve atualizar apenas a prioridade sem alterar titulo', async () => {
    const { body: criada } = await request(app)
      .post('/tarefas')
      .send({ titulo: 'Manter titulo', prioridade: 'normal' });

    const res = await request(app).put(`/tarefas/${criada.id}`).send({ prioridade: 'alta' });

    expect(res.statusCode).toBe(200);
    expect(res.body.prioridade).toBe('alta');
    expect(res.body.titulo).toBe('Manter titulo');
  });

  test('deve retornar 404 ao tentar atualizar tarefa inexistente', async () => {
    const res = await request(app).put('/tarefas/9999').send({ titulo: 'Fantasma' });

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('erro');
  });

  test('deve retornar 400 ao definir titulo vazio na atualização', async () => {
    const { body: criada } = await request(app).post('/tarefas').send({ titulo: 'Válido' });

    const res = await request(app).put(`/tarefas/${criada.id}`).send({ titulo: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('erro');
  });

  test('deve retornar 400 ao definir prioridade inválida na atualização', async () => {
    const { body: criada } = await request(app).post('/tarefas').send({ titulo: 'Válido' });

    const res = await request(app)
      .put(`/tarefas/${criada.id}`)
      .send({ prioridade: 'mega-urgente' });

    expect(res.statusCode).toBe(400);
    expect(res.body.erro).toMatch(/prioridade/i);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /tarefas/:id/concluir
// ─────────────────────────────────────────────────────────────────────────────
describe('PATCH /tarefas/:id/concluir', () => {
  test('deve marcar uma tarefa como concluída', async () => {
    const { body: criada } = await request(app).post('/tarefas').send({ titulo: 'Concluir' });

    const res = await request(app).patch(`/tarefas/${criada.id}/concluir`);

    expect(res.statusCode).toBe(200);
    expect(res.body.concluida).toBe(true);
    expect(res.body.atualizadaEm).not.toBeNull();
  });

  test('deve retornar 409 ao tentar concluir uma tarefa já concluída', async () => {
    const { body: criada } = await request(app).post('/tarefas').send({ titulo: 'Já feita' });

    await request(app).patch(`/tarefas/${criada.id}/concluir`);
    const res = await request(app).patch(`/tarefas/${criada.id}/concluir`);

    expect(res.statusCode).toBe(409);
    expect(res.body.erro).toMatch(/já está concluída/i);
  });

  test('deve retornar 404 ao tentar concluir tarefa inexistente', async () => {
    const res = await request(app).patch('/tarefas/9999/concluir');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('erro');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /tarefas/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('DELETE /tarefas/:id', () => {
  test('deve remover uma tarefa existente', async () => {
    const { body: criada } = await request(app).post('/tarefas').send({ titulo: 'Remover' });

    const res = await request(app).delete(`/tarefas/${criada.id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.mensagem).toMatch(/removida com sucesso/i);
    expect(res.body.tarefa.id).toBe(criada.id);
  });

  test('tarefa removida não deve mais aparecer na listagem', async () => {
    const { body: criada } = await request(app).post('/tarefas').send({ titulo: 'Apagar' });

    await request(app).delete(`/tarefas/${criada.id}`);

    const listRes = await request(app).get('/tarefas');
    const ids = listRes.body.tarefas.map((t) => t.id);
    expect(ids).not.toContain(criada.id);
  });

  test('deve retornar 404 ao tentar remover tarefa inexistente', async () => {
    const res = await request(app).delete('/tarefas/9999');

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('erro');
  });

  test('deve retornar 404 ao buscar tarefa já removida', async () => {
    const { body: criada } = await request(app).post('/tarefas').send({ titulo: 'Efêmera' });
    await request(app).delete(`/tarefas/${criada.id}`);

    const res = await request(app).get(`/tarefas/${criada.id}`);
    expect(res.statusCode).toBe(404);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Rota inexistente
// ─────────────────────────────────────────────────────────────────────────────
describe('Rota não existente', () => {
  test('deve retornar 404 para rota não mapeada', async () => {
    const res = await request(app).get('/nao-existe');

    expect(res.statusCode).toBe(404);
    expect(res.body.erro).toMatch(/rota não encontrada/i);
  });

  test('deve retornar 404 para método não mapeado em rota existente', async () => {
    const res = await request(app).patch('/tarefas');
    expect(res.statusCode).toBe(404);
  });
});
