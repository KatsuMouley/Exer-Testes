const express = require('express');
const morgan = require('morgan');
const tarefaService = require('./services/tarefaService');

const app = express();

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(morgan('dev'));

// ─── Rotas ───────────────────────────────────────────────────────────────────

/**
 * GET /tarefas
 * Lista todas as tarefas. Aceita query param ?status=pendente|concluida
 */
app.get('/tarefas', (req, res) => {
  const { status } = req.query;
  const lista = tarefaService.listarTodas(status);
  res.status(200).json({ total: lista.length, tarefas: lista });
});

/**
 * GET /tarefas/:id
 * Retorna uma tarefa pelo ID.
 */
app.get('/tarefas/:id', (req, res) => {
  const tarefa = tarefaService.buscarPorId(req.params.id);
  if (!tarefa) {
    return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  }
  res.status(200).json(tarefa);
});

/**
 * POST /tarefas
 * Cria uma nova tarefa. Body: { titulo, descricao?, prioridade? }
 */
app.post('/tarefas', (req, res) => {
  try {
    const nova = tarefaService.criar(req.body);
    res.status(201).json(nova);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

/**
 * PUT /tarefas/:id
 * Atualiza campos de uma tarefa existente.
 */
app.put('/tarefas/:id', (req, res) => {
  try {
    const atualizada = tarefaService.atualizar(req.params.id, req.body);
    if (!atualizada) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }
    res.status(200).json(atualizada);
  } catch (err) {
    res.status(400).json({ erro: err.message });
  }
});

/**
 * PATCH /tarefas/:id/concluir
 * Marca uma tarefa como concluída.
 */
app.patch('/tarefas/:id/concluir', (req, res) => {
  try {
    const tarefa = tarefaService.concluir(req.params.id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada.' });
    }
    res.status(200).json(tarefa);
  } catch (err) {
    res.status(409).json({ erro: err.message });
  }
});

/**
 * DELETE /tarefas/:id
 * Remove uma tarefa.
 */
app.delete('/tarefas/:id', (req, res) => {
  const removida = tarefaService.remover(req.params.id);
  if (!removida) {
    return res.status(404).json({ erro: 'Tarefa não encontrada.' });
  }
  res.status(200).json({ mensagem: 'Tarefa removida com sucesso.', tarefa: removida });
});

// ─── 404 genérico ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

module.exports = app;
