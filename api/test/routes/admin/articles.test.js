const app = require('../../../src/server.js');
const pool = require('../../../src/db/pool.js');
const { count } = require('../../helpers.js');
require('../../db_setup_teardown.js');
const supertest = require('supertest');
const request = supertest(app);

const auth = require('../../../src/middleware/auth.js');
jest.mock('../../../src/middleware/auth.js');

async function insertDummyArticles(n) {
  let id_list = [];
  for (let i = 0; i < n; i++) {
    id_list.push((await pool.query(`INSERT INTO
      articles(title, slug, author, description, content, category)
      VALUES('', '${'slug-' + i}', '', '', '', '') RETURNING id;`)).rows[0].id);
  }
  return id_list;
}

describe('GET /api/admin/articles', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.get('/api/admin/articles').expect(403, done);
  });

  it('should send 200 for authorized access', async done => {
    request.get('/api/admin/articles').expect(200, done);
  });

  it('should paginate properly', async done => {
    await insertDummyArticles(30);

    const default_p1 = await request.get('/api/admin/articles');
    expect(default_p1.body.length).toEqual(20);
    const default_p2 = await request.get('/api/admin/articles?page=2');
    expect(default_p2.body.length).toEqual(10);

    const long_p1 = await request.get('/api/admin/articles?count=25');
    expect(long_p1.body.length).toEqual(25);
    const long_p2 = await request.get('/api/admin/articles?count=25&page=2');
    expect(long_p2.body.length).toEqual(5);
    done();
  });
});

describe('GET /api/admin/articles/count', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.get('/api/admin/articles/count').expect(403, done);
  });

  it('should send correct result', async done => {
    await insertDummyArticles(30);
    request.get('/api/admin/articles/count').expect(200, { count: '30' }, done);
  });
});

describe('DELETE /api/admin/articles/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.delete('/api/admin/articles/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.delete('/api/admin/articles/fff').expect(400, done);
  });

  it('should send 500 for nonexistent archive', async done => {
    request.delete('/api/admin/articles/1').expect(500, done);
  });

  it('should perform deletion workflow and send 200', async done => {
    const [id] = await insertDummyArticles(1);
    const draft_id = (await pool.query(`INSERT INTO
      drafts(article_id, title, author, description, content, category)
      VALUES($1, '', '', '', '', '') RETURNING id;`, [id]))
      .rows[0].id;
    expect(await count('articles')).toEqual(1);
    expect(await count('trash')).toEqual(0);
    await request.delete(`/api/admin/articles/${id}`).expect(200);
    expect(await count('articles')).toEqual(0);
    expect(await count('trash')).toEqual(1);
    const article_id = (await pool.query(
      'SELECT article_id FROM drafts WHERE id = $1;',
      [draft_id]))
      .rows[0].article_id;
    expect(article_id).toBeFalsy();
    done();
  });
});

describe('POST /api/admin/articles/archive/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.post('/api/admin/articles/archive/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.post('/api/admin/articles/archive/fff').expect(400, done);
  });

  it('should send 500 for nonexistent article', async done => {
    request.post('/api/admin/articles/archive/1').expect(500, done);
  });

  it('should perform archive workflow and send 200', async done => {
    const [id] = await insertDummyArticles(1);
    const draft_id = (await pool.query(`INSERT INTO
      drafts(article_id, title, author, description, content, category)
      VALUES($1, '', '', '', '', '') RETURNING id;`, [id]))
      .rows[0].id;
    expect(await count('articles')).toEqual(1);
    expect(await count('archives')).toEqual(0);
    await request.post(`/api/admin/articles/archive/${id}`).expect(200);
    expect(await count('articles')).toEqual(0);
    expect(await count('archives')).toEqual(1);
    const article_id = (await pool.query(
      'SELECT article_id FROM drafts WHERE id = $1;',
      [draft_id]))
      .rows[0].article_id;
    expect(article_id).toBeFalsy();
    done();
  });
});

describe('POST /api/admin/articles/unpublish/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.post('/api/admin/articles/unpublish/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.post('/api/admin/articles/unpublish/fff').expect(400, done);
  });

  it('should send 500 for nonexistent article', async done => {
    request.post('/api/admin/articles/unpublish/1').expect(500, done);
  });

  it('should send 409 if a conflicting draft exists', async done => {
    const [id] = await insertDummyArticles(1);
    await pool.query(`INSERT INTO
      drafts(article_id, title, author, description, content, category)
      VALUES($1, '', '', '', '', '') RETURNING id;`, [id]);
    await request.post(`/api/admin/articles/unpublish/${id}`).expect(409);
    done();
  });

  it('should perform unpublish workflow and send 200', async done => {
    const [id] = await insertDummyArticles(1);
    expect(await count('articles')).toEqual(1);
    expect(await count('drafts')).toEqual(0);
    await request.post(`/api/admin/articles/unpublish/${id}`).expect(200);
    expect(await count('articles')).toEqual(0);
    expect(await count('drafts')).toEqual(1);
    done();
  });
});