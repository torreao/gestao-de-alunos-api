import { api } from './api.js';
import 'dotenv/config';

let tokenAdminEmCache = null;

export async function comTokenDeAdmin() {
    if (!tokenAdminEmCache) {
        const loginResposta = await api()
            .post('/api/auth/login')
            .set('Content-Type', 'application/json')
            .send({ 
                email: process.env.ADMIN_EMAIL, 
                senha: process.env.ADMIN_SENHA
            });
        
        tokenAdminEmCache = loginResposta.body.token;
    }

    return `Bearer ${tokenAdminEmCache}`;
}

export async function comTokenDeAluno(email, senha) {
    const loginResposta = await api()
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ email, senha });

    return `Bearer ${loginResposta.body.token}`;
}

export async function getToken(emailUser, passUser) {
    const loginResposta = await api()
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send({ 
            email: emailUser, 
            senha: passUser
        });

    return loginResposta.body.token;
}