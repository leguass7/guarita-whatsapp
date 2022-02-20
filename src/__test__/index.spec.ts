import request, { SuperTest } from 'supertest';

import { env } from '../config';
import { startServer } from '../index';

const to = env.WHATSAPP_TEST;

describe('Test server features', () => {
  let token;
  let app: SuperTest<request.Test>;
  jest.setTimeout(30000);
  beforeAll(async () => {
    const express = await startServer();
    app = request(express);
  });

  afterAll(async () => {
    await new Promise(resolve =>
      setTimeout(() => {
        app = undefined;
        resolve(true);
      }, 800),
    );
  });

  it('Request index', async () => {
    const result = await app.get('/').send();
    expect(result.status).toBe(403);
  });

  it('Request auth', async () => {
    const result = await app.post('/auth').send({ maxbotToken: env.MAXBOT_KEY });

    expect(result.status).toBe(200);
    expect(result.body?.success).toBe(true);

    token = result.body.token;
    expect(typeof token).toBe('string');
  });

  it('Send invalid text', async () => {
    const result = await app.post('/send').set('Authorization', `Bearer ${token}`).send({
      provider: 'maxbot',
      type: 'text',
      message: 'Teste de mensagem TESTING',
      to: '551212345678',
    });
    expect(result.status).toBe(200);
  });

  it('Send text message', async () => {
    const result = await app.post('/send').set('Authorization', `Bearer ${token}`).send({
      provider: 'maxbot',
      type: 'text',
      message: 'Teste de mensagem TESTING',
      to,
    });
    expect(result.status).toBe(200);
  });

  it('Send text image', async () => {
    const result = await app.post('/send').set('Authorization', `Bearer ${token}`).send({
      provider: 'maxbot',
      type: 'image',
      message: 'https://avatarsolucoesdigitais.com.br/images/makeupok.jpg',
      to,
    });
    expect(result.status).toBe(200);
  });

  it('Request tokens', async () => {
    const result = await app.get('/token').set('Authorization', `Bearer ${token}`).send();
    expect(result.status).toBe(200);
  });
});
