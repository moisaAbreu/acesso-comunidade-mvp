const request = require('supertest');
const app = require('./server');

describe('Suíte de Testes - AcessoComunidade MVP', () => {
  let tokenGerado = '';

  test('Unitário: Deve servir a página inicial (index.html) com status 200', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
  });

  test('Unitário: Deve servir a página da portaria (portaria.html) com status 200', async () => {
    const res = await request(app).get('/portaria.html');
    expect(res.statusCode).toBe(200);
  });

  test('Integração (RF01): Deve cadastrar participante em /api/inscrever e gerar token', async () => {
    const res = await request(app)
      .post('/api/inscrever')
      .send({
        nome: 'Participante Teste Jest',
        telefone: '11999999999',
        restricao: 'Nenhuma'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.sucesso).toBe(true);
    expect(res.body.dados.qr_code_token).toMatch(/^TOKEN-/);
    tokenGerado = res.body.dados.qr_code_token;
  });

  test('Integração (RF03): Deve liberar entrada na primeira leitura do token válido', async () => {
    const res = await request(app)
      .post('/api/checkin')
      .send({ token: tokenGerado });

    expect(res.statusCode).toBe(200);
    expect(res.body.valido).toBe(true);
    expect(res.body.mensagem).toBe('ENTRADA LIBERADA');
  });

  test('Integração (RF03): Deve bloquear segunda leitura do mesmo token (CREDENCIAL JÁ UTILIZADA)', async () => {
    const res = await request(app)
      .post('/api/checkin')
      .send({ token: tokenGerado });

    expect(res.statusCode).toBe(400);
    expect(res.body.valido).toBe(false);
    expect(res.body.mensagem).toBe('CREDENCIAL JÁ UTILIZADA');
  });

  test('Integração (RF03): Deve retornar 404 para credencial inexistente', async () => {
    const res = await request(app)
      .post('/api/checkin')
      .send({ token: 'TOKEN-INEXISTENTE-000' });

    expect(res.statusCode).toBe(404);
    expect(res.body.valido).toBe(false);
    expect(res.body.mensagem).toBe('CREDENCIAL INVÁLIDA');
  });
});