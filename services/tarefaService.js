/**
 * Serviço de Tarefas — armazenamento em memória
 * Gerencia operações CRUD e lógica de negócio.
 */

let tarefas = [];
let proximoId = 1;

/**
 * Reinicia o estado (útil entre testes).
 */
function resetar() {
  tarefas = [];
  proximoId = 1;
}

/**
 * Retorna todas as tarefas, com filtro opcional por status.
 * @param {string|undefined} status - "pendente" | "concluida" | undefined
 */
function listarTodas(status) {
  if (status === 'pendente') return tarefas.filter((t) => !t.concluida);
  if (status === 'concluida') return tarefas.filter((t) => t.concluida);
  return [...tarefas];
}

/**
 * Busca uma tarefa pelo ID.
 * @param {number} id
 */
function buscarPorId(id) {
  return tarefas.find((t) => t.id === Number(id)) || null;
}

/**
 * Cria uma nova tarefa.
 * @param {object} dados - { titulo, descricao, prioridade }
 */
function criar(dados) {
  const { titulo, descricao = '', prioridade = 'normal' } = dados;

  if (!titulo || titulo.trim() === '') {
    throw new Error('O campo "titulo" é obrigatório.');
  }

  const prioridadesValidas = ['baixa', 'normal', 'alta'];
  if (!prioridadesValidas.includes(prioridade)) {
    throw new Error(`Prioridade inválida. Use: ${prioridadesValidas.join(', ')}.`);
  }

  const novaTarefa = {
    id: proximoId++,
    titulo: titulo.trim(),
    descricao: descricao.trim(),
    prioridade,
    concluida: false,
    criadaEm: new Date().toISOString(),
    atualizadaEm: null,
  };

  tarefas.push(novaTarefa);
  return novaTarefa;
}

/**
 * Atualiza uma tarefa existente.
 * @param {number} id
 * @param {object} dados - { titulo, descricao, prioridade }
 */
function atualizar(id, dados) {
  const tarefa = buscarPorId(id);
  if (!tarefa) return null;

  const { titulo, descricao, prioridade } = dados;

  if (titulo !== undefined) {
    if (titulo.trim() === '') throw new Error('O campo "titulo" não pode ser vazio.');
    tarefa.titulo = titulo.trim();
  }

  if (descricao !== undefined) {
    tarefa.descricao = descricao.trim();
  }

  if (prioridade !== undefined) {
    const prioridadesValidas = ['baixa', 'normal', 'alta'];
    if (!prioridadesValidas.includes(prioridade)) {
      throw new Error(`Prioridade inválida. Use: ${prioridadesValidas.join(', ')}.`);
    }
    tarefa.prioridade = prioridade;
  }

  tarefa.atualizadaEm = new Date().toISOString();
  return tarefa;
}

/**
 * Marca uma tarefa como concluída.
 * @param {number} id
 */
function concluir(id) {
  const tarefa = buscarPorId(id);
  if (!tarefa) return null;
  if (tarefa.concluida) throw new Error('Tarefa já está concluída.');

  tarefa.concluida = true;
  tarefa.atualizadaEm = new Date().toISOString();
  return tarefa;
}

/**
 * Remove uma tarefa pelo ID.
 * @param {number} id
 */
function remover(id) {
  const index = tarefas.findIndex((t) => t.id === Number(id));
  if (index === -1) return null;

  const [removida] = tarefas.splice(index, 1);
  return removida;
}

module.exports = { listarTodas, buscarPorId, criar, atualizar, concluir, remover, resetar };
