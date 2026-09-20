import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect } from 'chai';
import { api } from './helpers/api.helper.js';
import { loginAdmin, loginAluno } from './helpers/auth.helper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fixturePath = path.join(__dirname, 'fixtures', 'dadosTestes.json');
const massaDados = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));

describe('Fluxo Completo: Admin e Aluno (Data-Driven Testing)', () => {
  massaDados.forEach((dados) => {
    describe(`Cenário para o aluno: ${dados.nome}`, () => {

      const timestamp = Date.now();
      const emailUnico = `${dados.email.split('@')[0]}_${timestamp}@teste.com`;
      const matriculaUnica = `${dados.matricula}${timestamp.toString().slice(-4)}`;

      let adminToken = '';
      let alunoId = '';
      let alunoToken = '';

      it('1. Deve logar como administrador via Helper', async () => {
        adminToken = await loginAdmin();
        expect(adminToken).to.be.a('string').and.not.empty;
      });

      it('2. Deve cadastrar um aluno utilizando o token de admin', async () => {
        const payloadAluno = {
          nome: dados.nome,
          email: emailUnico,
          matricula: matriculaUnica,
          senha: dados.senha,
        };

        const resposta = await api()
          .post('/api/admin/alunos')
          .set('Authorization', `Bearer ${adminToken}`)
          .send(payloadAluno);

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.have.property('id');
        expect(resposta.body.nome).to.equal(dados.nome);
        expect(resposta.body.email).to.equal(emailUnico);
        expect(resposta.body.matricula).to.equal(matriculaUnica);
        expect(resposta.body.role).to.equal('aluno');
        expect(resposta.body).to.not.have.property('senha');

        alunoId = resposta.body.id;
      });

      it('3. Deve matricular o aluno na disciplina', async () => {
        const resposta = await api()
          .post(`/api/admin/disciplinas/${dados.disciplinaId}/matriculas`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ alunoId });

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.have.property('alunoId', alunoId);
        expect(resposta.body).to.have.property('disciplinaId', dados.disciplinaId);
      });

      it('4. Deve logar como o aluno recém-cadastrado via Helper', async () => {
        alunoToken = await loginAluno(emailUnico, dados.senha);
        expect(alunoToken).to.be.a('string').and.not.empty;
      });

      it('5. Deve registrar a entrega de um trabalho como aluno', async () => {
        const payloadTrabalho = {
          disciplinaId: dados.disciplinaId,
          titulo: dados.tituloTrabalho,
          descricao: dados.descricaoTrabalho,
        };

        const resposta = await api()
          .post(`/api/alunos/${alunoId}/trabalhos`)
          .set('Authorization', `Bearer ${alunoToken}`)
          .send(payloadTrabalho);

        expect(resposta.status).to.equal(201);
        expect(resposta.body).to.have.property('id');
        expect(resposta.body.alunoId).to.equal(alunoId);
        expect(resposta.body.disciplinaId).to.equal(dados.disciplinaId);
        expect(resposta.body.titulo).to.equal(dados.tituloTrabalho);
        expect(resposta.body.descricao).to.equal(dados.descricaoTrabalho);
        expect(resposta.body.status).to.equal('entregue');
        expect(resposta.body).to.have.property('dataEntrega');
      });
    });
  });
});

