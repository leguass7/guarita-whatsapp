import request, { SuperTest } from 'supertest';

import { env } from '../config';
import { startServer } from '../index';

// const to = env.WHATSAPP_TEST;

describe('Test server features', () => {
  let token: string;
  let app: SuperTest<request.Test>;
  // let server: AppExpress;
  let close: () => Promise<void>;
  jest.setTimeout(35000);

  beforeAll(async () => {
    const { server, closeServer } = await startServer();
    close = closeServer;
    app = request(server);
  });

  afterAll(async () => {
    return new Promise(resolve =>
      setTimeout(async () => {
        await close();
        app = undefined;
        resolve(true);
      }, 8000),
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

  // it('Send invalid text', async () => {
  //   const result = await app.post('/send').set('Authorization', `Bearer ${token}`).send({
  //     provider: 'maxbot',
  //     type: 'text',
  //     message: null,
  //     to: '551212345678',
  //   });
  //   expect(result.status).toBe(400);
  // });

  // it('Send text message', async () => {
  //   const result = await app.post('/send').set('Authorization', `Bearer ${token}`).send({
  //     provider: 'maxbot',
  //     type: 'text',
  //     message: 'Teste de mensagem TESTING',
  //     to,
  //   });
  //   expect(result.status).toBe(200);
  // });

  // it('Send text image', async () => {
  //   const result = await app.post('/send').set('Authorization', `Bearer ${token}`).send({
  //     provider: 'maxbot',
  //     type: 'image',
  //     message: 'https://avatarsolucoesdigitais.com.br/images/makeupok.jpg',
  //     to,
  //   });
  //   expect(result.status).toBe(200);
  // });

  it('Request tokens', async () => {
    const result = await app.get('/token').set('Authorization', `Bearer ${token}`).send();
    expect(result.status).toBe(200);
  });
});
