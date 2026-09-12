import { createRequire } from 'module';
import { expect } from 'chai';
import { api } from '../helpers/api.js';
import { comTokenDeAdmin, comTokenDeAluno } from '../helpers/auth.js';

const require = createRequire(import.meta.url);
const casos = require('../fixtures/entregaDeTrabalho.json');

describe('Fluxo: Cadastro de Aluno e Entrega de Trabalho', () => {

    for (const caso of casos) {

        describe(`Caso: ${caso.descricao}`, () => {

            const sufixo = Date.now();
            let alunoId;
            let disciplinaId;

            const dadosAluno = {
                nome: caso.aluno.nome,
                email: `${sufixo}.${caso.aluno.email}`,
                matricula: `${caso.aluno.matricula}-${sufixo}`,
                senha: caso.aluno.senha,
            };

            const dadosDisciplina = {
                nome: caso.disciplina.nome,
                codigo: `${caso.disciplina.codigo}-${sufixo}`,
                cargaHoraria: caso.disciplina.cargaHoraria,
            };

            it('Admin deve conseguir logar e cadastrar o aluno', async () => {
                const tokenAdmin = await comTokenDeAdmin();

                const resposta = await api()
                    .post('/api/admin/alunos')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', tokenAdmin)
                    .send(dadosAluno);

                expect(resposta.status).to.equal(201);
                expect(resposta.body).to.have.property('id');
                expect(resposta.body.email).to.equal(dadosAluno.email);
                expect(resposta.body).to.not.have.property('senha');

                alunoId = resposta.body.id;
            });

            it('Admin deve criar a disciplina e matricular o aluno nela', async () => {
                const tokenAdmin = await comTokenDeAdmin();

                const respostaDisciplina = await api()
                    .post('/api/admin/disciplinas')
                    .set('Content-Type', 'application/json')
                    .set('Authorization', tokenAdmin)
                    .send(dadosDisciplina);

                expect(respostaDisciplina.status).to.equal(201);
                expect(respostaDisciplina.body).to.have.property('id');

                disciplinaId = respostaDisciplina.body.id;

                const respostaMatricula = await api()
                    .post(`/api/admin/disciplinas/${disciplinaId}/matriculas`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', tokenAdmin)
                    .send({ alunoId });

                expect(respostaMatricula.status).to.equal(201);
                expect(respostaMatricula.body.alunoId).to.equal(alunoId);
                expect(respostaMatricula.body.disciplinaId).to.equal(disciplinaId);
            });

            it('Aluno deve conseguir logar e registrar a entrega do trabalho', async () => {
                const tokenAluno = await comTokenDeAluno(dadosAluno.email, dadosAluno.senha);

                const respostaTrabalho = await api()
                    .post(`/api/alunos/${alunoId}/trabalhos`)
                    .set('Content-Type', 'application/json')
                    .set('Authorization', tokenAluno)
                    .send({
                        disciplinaId,
                        titulo: caso.trabalho.titulo,
                        descricao: caso.trabalho.descricao,
                    });

                expect(respostaTrabalho.status).to.equal(201);
                expect(respostaTrabalho.body).to.have.property('id');
                expect(respostaTrabalho.body.alunoId).to.equal(alunoId);
                expect(respostaTrabalho.body.disciplinaId).to.equal(disciplinaId);
                expect(respostaTrabalho.body.status).to.equal('entregue');
                expect(respostaTrabalho.body.titulo).to.equal(caso.trabalho.titulo);
            });

        });
    }
});
