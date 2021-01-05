const app = require('../../src/server.js');
const pool = require('../../src/db/pool.js');
require('../db_setup_teardown.js');
const supertest = require('supertest');
const request = supertest(app);

jest.mock('../../src/middleware/auth.js');

describe('GET /api/redirect/{slug}', () => {
  it('should send empty object when no redirect exists', async done => {
    request.get('/api/redirect/from-slug')
      .expect(200, {}, done);
  });

  it('should send correct redirect', async done => {
    await pool.query(`INSERT INTO
      redirects(from_slug, to_slug)
      VALUES('from-slug', 'to-slug');`);
    request.get('/api/redirect/from-slug')
      .expect(200, { to_slug: 'to-slug' }, done);
  });
});