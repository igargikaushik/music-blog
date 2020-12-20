const app = require('../../../src/server.js');
const pool = require('../../../src/db/pool.js');
const init_db = require('../../../src/db/init_db.js');
const teardown_db = require('../../../src/db/teardown_db.js');
const supertest = require('supertest');
const request = supertest(app);

const auth_path = '../../../src/middleware/auth.js';
jest.mock(auth_path, () => (
  {
    ...(jest.requireActual(auth_path)),
    requiresAdmin: jest.fn((_req, res) => res.status(403).send('Unauthorized')),
  }
));
const auth = require(auth_path);

beforeAll(async done => {
  await teardown_db();
  done();
});

beforeEach(async () => {
  await init_db();
});

afterEach(async () => {
  await teardown_db();
});


describe('GET /api/admin/archives', () => {
  it('should send 403 for unauthorized access', async done => {
    request.get('/api/admin/archives').expect(403, done);
  });

  it('should send 200 for authorized access', async done => {
    auth.requiresAdmin.mockImplementationOnce((_req, _res, next) => next());
    request.get('/api/admin/archives').expect(200, done);
  });

  it('should send 20 items by default', async done => {
    auth.requiresAdmin.mockImplementationOnce((_req, _res, next) => next());
    for (let i = 0; i < 30; i++) {
      await pool.query(`INSERT INTO
        archives(title, slug, author, description, creation_time, content, category)
        VALUES('', '', '', '', CURRENT_TIMESTAMP, '', '');`);
    }
    const response = await request.get('/api/admin/archives')
      .set('Accept', 'application/json');
    expect(response.body.length).toEqual(20);
    done();
  });
});