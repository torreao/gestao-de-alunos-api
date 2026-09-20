import { api } from './api.helper.js';

/**
 * Helper para logar como Administrador
 * @param {string} [email]
 * @param {string} [senha]
 * @returns {Promise<string>} Token JWT do admin
 */
export async function loginAdmin(
  email = process.env.ADMIN_EMAIL || 'admin@escola.com',
  senha = process.env.ADMIN_PASSWORD || 'admin123'
) {
  const resposta = await api()
    .post('/api/auth/login')
    .send({ email, senha });

  return resposta.body.token;
}

/**
 * Helper para logar como Aluno
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<string>} Token JWT do aluno
 */
export async function loginAluno(email, senha) {
  const resposta = await api()
    .post('/api/auth/login')
    .send({ email, senha });

  return resposta.body.token;
}

export default { loginAdmin, loginAluno };

