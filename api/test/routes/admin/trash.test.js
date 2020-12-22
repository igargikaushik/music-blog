const app = require('../../../src/server.js');
const pool = require('../../../src/db/pool.js');
const { count } = require('../../helpers.js');
require('../../db_setup_teardown.js');
const supertest = require('supertest');
const request = supertest(app);

const auth = require('../../../src/middleware/auth.js');
jest.mock('../../../src/middleware/auth.js');

async function insertDummyTrash(n) {
  let id_list = [];
  for (let i = 0; i < n; i++) {
    id_list.push((await pool.query(`INSERT INTO
      trash(title, author, description, creation_time, content, category, doc_type)
      VALUES('', '', '', CURRENT_TIMESTAMP, '', '', 'article') RETURNING id;`))
      .rows[0].id);
  }
  return id_list;
}

describe('GET /api/admin/trash', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.get('/api/admin/trash').expect(403, done);
  });

  it('should send 200 for authorized access', async done => {
    request.get('/api/admin/trash').expect(200, done);
  });

  it('should paginate properly', async done => {
    await insertDummyTrash(30);

    const default_p1 = await request.get('/api/admin/trash');
    expect(default_p1.body.length).toEqual(20);
    const default_p2 = await request.get('/api/admin/trash?page=2');
    expect(default_p2.body.length).toEqual(10);

    const long_p1 = await request.get('/api/admin/trash?count=25');
    expect(long_p1.body.length).toEqual(25);
    const long_p2 = await request.get('/api/admin/trash?count=25&page=2');
    expect(long_p2.body.length).toEqual(5);
    done();
  });
});

describe('GET /api/admin/trash/count', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.get('/api/admin/trash/count').expect(403, done);
  });

  it('should send correct result', async done => {
    await insertDummyTrash(30);
    request.get('/api/admin/trash/count').expect(200, { count: '30' }, done);
  });
});

describe('PUT /api/admin/trash/rename/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.put('/api/admin/trash/rename/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.put('/api/admin/trash/rename/fff').expect(400, done);
  });

  it('should send 404 for nonexistent archive', async done => {
    request.put('/api/admin/trash/rename/1')
      .send({ title: 'new title' })
      .expect(404, done);
  });

  it('should send 400 for missing title', async done => {
    const [id] = await insertDummyTrash(1);
    request.put(`/api/admin/trash/rename/${id}`).expect(400, done);
  });

  it('should perform renaming workflow and send 200', async done => {
    const [id] = await insertDummyTrash(1);
    const newTitle = 'new title';
    await request.put(`/api/admin/trash/rename/${id}`)
      .send({ title: newTitle })
      .expect(200);
    const title_res = await pool.query('SELECT title FROM trash WHERE id = $1;', [id]);
    expect(title_res.rows[0].title).toEqual(newTitle);
    done();
  });
});

describe('POST /api/admin/trash/restore/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.post('/api/admin/trash/restore/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.post('/api/admin/trash/restore/fff').expect(400, done);
  });

  it('should send 500 for nonexistent item', async done => {
    request.post('/api/admin/trash/restore/1').expect(500, done);
  });

  it('should send 409 when restoring conflicting article', async done => {
    const id = (await pool.query(`INSERT INTO
      trash(title, author, description, creation_time, content, category, doc_type)
      VALUES('test slug', '', '', CURRENT_TIMESTAMP, '', '', 'article') RETURNING id;`))
      .rows[0].id;
    await pool.query(`INSERT INTO
      articles(title, slug, author, description, content, category)
      VALUES('', 'test-slug', '', '', '', '');`);
    request.post(`/api/admin/trash/restore/${id}`).expect(409, done);
  });

  it('should send 409 when restoring conflicting draft', async done => {
    const article_id = (await pool.query(`INSERT INTO
      articles(title, slug, author, description, content, category)
      VALUES('article title', 'test-slug', '', '', '', '') RETURNING id;`))
      .rows[0].id;
    const draft_id = (await pool.query(`INSERT INTO
      drafts(article_id, title, author, description, content, category)
      VALUES($1, 'draft title', '', '', '', '') RETURNING id;`, [article_id]))
      .rows[0].id;
    const trash_id = (await pool.query(`INSERT INTO
      trash(title, author, description, creation_time,
        content, category, doc_type, draft_article_id)
      VALUES('test slug', '', '', CURRENT_TIMESTAMP,
        '', '', 'draft', $1) RETURNING id;`, [draft_id]))
      .rows[0].id;
    request.post(`/api/admin/trash/restore/${trash_id}`).expect(409, done);
  });

  it('should perform article restore workflow and send 200', async done => {
    const id = (await pool.query(`INSERT INTO
      trash(title, author, description, creation_time, content, category, doc_type)
      VALUES('', '', '', CURRENT_TIMESTAMP, '', '', 'article') RETURNING id;`))
      .rows[0].id;
    expect(await count('trash')).toEqual(1);
    expect(await count('articles')).toEqual(0);
    await request.post(`/api/admin/trash/restore/${id}`).expect(200);
    expect(await count('trash')).toEqual(0);
    expect(await count('articles')).toEqual(1);
    done();
  });

  it('should perform draft restore workflow and send 200', async done => {
    const id = (await pool.query(`INSERT INTO
      trash(title, author, description, creation_time, content, category, doc_type)
      VALUES('', '', '', CURRENT_TIMESTAMP, '', '', 'draft') RETURNING id;`))
      .rows[0].id;
    expect(await count('trash')).toEqual(1);
    expect(await count('drafts')).toEqual(0);
    await request.post(`/api/admin/trash/restore/${id}`).expect(200);
    expect(await count('trash')).toEqual(0);
    expect(await count('drafts')).toEqual(1);
    done();
  });
});

describe('DELETE /api/admin/trash/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.delete('/api/admin/trash/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.delete('/api/admin/trash/fff').expect(400, done);
  });

  it('should send 404 for nonexistent item', async done => {
    request.delete('/api/admin/trash/1').expect(404, done);
  });

  it('should perform permanent deletion workflow and send 200', async done => {
    const [id] = await insertDummyTrash(1);
    expect(await count('trash')).toEqual(1);
    await request.post(`/api/admin/trash/restore/${id}`).expect(200);
    expect(await count('trash')).toEqual(0);
    done();
  });
});