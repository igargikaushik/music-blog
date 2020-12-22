const app = require('../../../src/server.js');
const pool = require('../../../src/db/pool.js');
const { count } = require('../../helpers.js');
require('../../db_setup_teardown.js');
const supertest = require('supertest');
const request = supertest(app);

const auth = require('../../../src/middleware/auth.js');
jest.mock('../../../src/middleware/auth.js');

async function insertDummyArchives(n) {
  let id_list = [];
  for (let i = 0; i < n; i++) {
    id_list.push((await pool.query(`INSERT INTO
      archives(title, slug, author, description, creation_time, content, category)
      VALUES('', '', '', '', CURRENT_TIMESTAMP, '', '') RETURNING id;`)).rows[0].id);
  }
  return id_list;
}

describe('GET /api/admin/archives', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.get('/api/admin/archives').expect(403, done);
  });

  it('should send 200 for authorized access', async done => {
    request.get('/api/admin/archives').expect(200, done);
  });

  it('should paginate properly', async done => {
    await insertDummyArchives(30);

    const default_p1 = await request.get('/api/admin/archives');
    expect(default_p1.body.length).toEqual(20);
    const default_p2 = await request.get('/api/admin/archives?page=2');
    expect(default_p2.body.length).toEqual(10);

    const long_p1 = await request.get('/api/admin/archives?count=25');
    expect(long_p1.body.length).toEqual(25);
    const long_p2 = await request.get('/api/admin/archives?count=25&page=2');
    expect(long_p2.body.length).toEqual(5);
    done();
  });
});

describe('DELETE /api/admin/archives/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.delete('/api/admin/archives/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.delete('/api/admin/archives/fff').expect(400, done);
  });

  it('should send 500 for nonexistent archive', async done => {
    request.delete('/api/admin/archives/1').expect(500, done);
  });

  it('should perform deletion workflow and send 200', async done => {
    const [id] = await insertDummyArchives(1);
    expect(await count('archives')).toEqual(1);
    expect(await count('trash')).toEqual(0);
    await request.delete(`/api/admin/archives/${id}`).expect(200);
    expect(await count('archives')).toEqual(0);
    expect(await count('trash')).toEqual(1);
    done();
  });
});

describe('GET /api/admin/archives/count', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.get('/api/admin/archives/count').expect(403, done);
  });

  it('should send correct result', async done => {
    await insertDummyArchives(30);
    request.get('/api/admin/archives/count').expect(200, { count: '30' }, done);
  });
});

describe('PUT /api/admin/archives/rename/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.put('/api/admin/archives/rename/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.put('/api/admin/archives/rename/fff').expect(400, done);
  });

  it('should send 404 for nonexistent archive', async done => {
    request.put('/api/admin/archives/rename/1')
      .send({ title: 'new title' })
      .expect(404, done);
  });

  it('should send 400 for missing title', async done => {
    const [id] = await insertDummyArchives(1);
    request.put(`/api/admin/archives/rename/${id}`).expect(400, done);
  });

  it('should perform renaming workflow and send 200', async done => {
    const [id] = await insertDummyArchives(1);
    const newTitle = 'new title';
    await request.put(`/api/admin/archives/rename/${id}`)
      .send({ title: newTitle })
      .expect(200);
    const title_res = await pool.query('SELECT title FROM archives WHERE id = $1;', [id]);
    expect(title_res.rows[0].title).toEqual(newTitle);
    done();
  });
});

describe('POST /api/admin/archives/republish/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.post('/api/admin/archives/republish/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.post('/api/admin/archives/republish/fff').expect(400, done);
  });

  it('should send 500 for nonexistent archive', async done => {
    request.post('/api/admin/archives/republish/1').expect(500, done);
  });

  it('should send 409 for conflicting article', async done => {
    const testSlug = 'test-slug';
    const id = (await pool.query(`INSERT INTO
      archives(title, slug, author, description, creation_time, content, category)
      VALUES('', $1, '', '', CURRENT_TIMESTAMP, '', '') RETURNING id;`, [testSlug]))
      .rows[0].id;
    await pool.query(`INSERT INTO
      articles(title, slug, author, description, content, category)
      VALUES('', $1, '', '', '', '');`, [testSlug]);
    request.post(`/api/admin/archives/republish/${id}`).expect(409, done);
  });

  it('should perform republish workflow and send 200', async done => {
    const [id] = await insertDummyArchives(1);
    expect(await count('archives')).toEqual(1);
    expect(await count('articles')).toEqual(0);
    await request.post(`/api/admin/archives/republish/${id}`).expect(200);
    expect(await count('archives')).toEqual(0);
    expect(await count('articles')).toEqual(1);
    done();
  });
});