const app = require('../../../src/server.js');
const pool = require('../../../src/db/pool.js');
const { count } = require('../../helpers.js');
require('../../db_setup_teardown.js');
const supertest = require('supertest');
const request = supertest(app);

const auth = require('../../../src/middleware/auth.js');
jest.mock('../../../src/middleware/auth.js');

async function insertDummyDrafts(n) {
  let id_list = [];
  for (let i = 0; i < n; i++) {
    id_list.push((await pool.query(`INSERT INTO
      drafts(title, author, description, content, category)
      VALUES('', '', '', '', '') RETURNING id;`)).rows[0].id);
  }
  return id_list;
}

describe('GET /api/admin/drafts', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.get('/api/admin/drafts').expect(403, done);
  });

  it('should send 200 for authorized access', async done => {
    request.get('/api/admin/drafts').expect(200, done);
  });

  it('should paginate properly', async done => {
    await insertDummyDrafts(30);

    const default_p1 = await request.get('/api/admin/drafts');
    expect(default_p1.body.length).toEqual(20);
    const default_p2 = await request.get('/api/admin/drafts?page=2');
    expect(default_p2.body.length).toEqual(10);

    const long_p1 = await request.get('/api/admin/drafts?count=25');
    expect(long_p1.body.length).toEqual(25);
    const long_p2 = await request.get('/api/admin/drafts?count=25&page=2');
    expect(long_p2.body.length).toEqual(5);
    done();
  });
});

describe('POST /api/admin/drafts', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.post('/api/admin/drafts').expect(403, done);
  });

  it('should create draft and send 201', async done => {
    expect(await count('drafts')).toEqual(0);
    await request.post('/api/admin/drafts').expect(201);
    expect(await count('drafts')).toEqual(1);
    done();
  });
});

describe('GET /api/admin/drafts/count', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.get('/api/admin/drafts/count').expect(403, done);
  });

  it('should send correct result', async done => {
    await insertDummyDrafts(30);
    request.get('/api/admin/drafts/count').expect(200, { count: '30' }, done);
  });
});

describe('PUT /api/admin/drafts/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.put('/api/admin/drafts/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.put('/api/admin/drafts/fff').expect(400, done);
  });

  it('should perform saving workflow and send 200', async done => {
    const [id] = await insertDummyDrafts(1);
    const new_data = {
      title: 'title', author: 'author', description: 'description',
      content: 'content', category: 'category',
      tags: ['tag 1', 'tag 2'], image: 'image'
    };
    await request.put(`/api/admin/drafts/${id}`)
      .send(new_data)
      .expect(200);
    const new_row = (await pool.query(
      'SELECT * FROM drafts WHERE id = $1;',
      [id]))
      .rows[0];
    for (const key of Object.keys(new_data)) {
      expect(new_row[key]).toEqual(new_data[key]);
    }
    done();
  });
});

describe('GET /api/admin/drafts/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.get('/api/admin/drafts/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.get('/api/admin/drafts/fff').expect(400, done);
  });

  it('should send 404 for nonexistent draft', async done => {
    request.get('/api/admin/drafts/1').expect(404, done);
  });

  it('should get correct draft and send 200', async done => {
    const new_data = {
      title: 'title', author: 'author', description: 'description',
      content: 'content', category: 'category',
      tags: ['tag 1', 'tag 2'], image: 'image'
    };
    const row = (await pool.query(`INSERT INTO
      drafts(title, author, description, content, category, tags, image)
      VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;`, Object.values(new_data)))
      .rows[0];
    request.get(`/api/admin/drafts/${row.id}`).expect(200);
    for (const key of Object.keys(new_data)) {
      expect(row[key]).toEqual(new_data[key]);
    }
    done();
  });
});

describe('DELETE /api/admin/drafts/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.delete('/api/admin/drafts/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.delete('/api/admin/drafts/fff').expect(400, done);
  });

  it('should send 500 for nonexistent draft', async done => {
    request.delete('/api/admin/drafts/1').expect(500, done);
  });

  it('should perform deletion workflow and send 200', async done => {
    const [id] = await insertDummyDrafts(1);
    expect(await count('drafts')).toEqual(1);
    expect(await count('trash')).toEqual(0);
    await request.delete(`/api/admin/drafts/${id}`).expect(200);
    expect(await count('drafts')).toEqual(0);
    expect(await count('trash')).toEqual(1);
    done();
  });
});

describe('POST /api/admin/drafts/publish/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.post('/api/admin/drafts/publish/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.post('/api/admin/drafts/publish/fff').expect(400, done);
  });

  it('should send 500 for nonexistent draft', async done => {
    request.post('/api/admin/drafts/publish/1').expect(500, done);
  });

  it('should send 409 if article with conflicting slug exists', async done => {
    const new_data = {
      title: 'title', author: 'author', description: 'description',
      content: 'content', category: 'category',
      tags: ['tag 1', 'tag 2'], image: 'image'
    };
    const expected_slug = 'title';
    const row = (await pool.query(`INSERT INTO
      drafts(title, author, description, content, category, tags, image)
      VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING *;`, Object.values(new_data)))
      .rows[0];
    await pool.query(`INSERT INTO
      articles(title, slug, author, description, content, category)
      VALUES('', $1, '', '', '', '');`, [expected_slug]);
    request.post(`/api/admin/drafts/publish/${row.id}`).expect(409, done);
  });

  it('should update existing article from drafts table and send 201', async done => {
    const old_from_slug = (await pool.query(`INSERT INTO
      redirects(from_slug, to_slug)
      VALUES('very-old-slug', 'before-slug') RETURNING from_slug;`))
      .rows[0].from_slug;
    const article_id = (await pool.query(`INSERT INTO
      articles(title, slug, author, description, content, category)
      VALUES('', 'before-slug', '', '', '', '') RETURNING id;`))
      .rows[0].id;
    const draft_id = (await pool.query(`INSERT INTO
      drafts(article_id, title, author, description, content, category)
      VALUES($1, 'after slug', '', '', '', '') RETURNING id;`, [article_id]))
      .rows[0].id;
    expect(await count('drafts')).toEqual(1);
    expect(await count('articles')).toEqual(1);
    expect(await count('redirects')).toEqual(1);
    await request.post(`/api/admin/drafts/publish/${draft_id}`).expect(201);
    expect(await count('drafts')).toEqual(0);
    expect(await count('articles')).toEqual(1);
    expect(await count('redirects')).toEqual(2);
    const new_to_slug = (await pool.query(`SELECT to_slug FROM redirects
      WHERE from_slug = 'before-slug';`))
      .rows[0].to_slug;
    const cascaded_to_slug = (await pool.query(`SELECT to_slug FROM redirects
      WHERE from_slug = $1;`, [old_from_slug]))
      .rows[0].to_slug;
    expect(new_to_slug).toEqual('after-slug');
    expect(cascaded_to_slug).toEqual('after-slug');
    done();
  });

  it('should create new article from drafts table and send 201', async done => {
    const [id] = await insertDummyDrafts(1);
    expect(await count('drafts')).toEqual(1);
    expect(await count('articles')).toEqual(0);
    await request.post(`/api/admin/drafts/publish/${id}`).expect(201);
    expect(await count('drafts')).toEqual(0);
    expect(await count('articles')).toEqual(1);
    done();
  });

  it('should update existing article from body and send 201', async done => {
    const old_from_slug = (await pool.query(`INSERT INTO
      redirects(from_slug, to_slug)
      VALUES('very-old-slug', 'before-slug') RETURNING from_slug;`))
      .rows[0].from_slug;
    const article_id = (await pool.query(`INSERT INTO
      articles(title, slug, author, description, content, category)
      VALUES('', 'before-slug', '', '', '', '') RETURNING id;`))
      .rows[0].id;
    const draft_id = (await pool.query(`INSERT INTO
      drafts(article_id, title, author, description, content, category)
      VALUES($1, 'unused_title', '', '', '', '') RETURNING id;`, [article_id]))
      .rows[0].id;
    const new_data = {
      title: 'after slug', author: 'author', description: 'description',
      content: 'content', category: 'category',
      tags: ['tag 1', 'tag 2'], image: 'image'
    };
    expect(await count('drafts')).toEqual(1);
    expect(await count('articles')).toEqual(1);
    expect(await count('redirects')).toEqual(1);
    await request.post(`/api/admin/drafts/publish/${draft_id}`)
      .send(new_data) 
      .expect(201);
    expect(await count('drafts')).toEqual(0);
    expect(await count('articles')).toEqual(1);
    expect(await count('redirects')).toEqual(2);
    const new_to_slug = (await pool.query(`SELECT to_slug FROM redirects
      WHERE from_slug = 'before-slug';`))
      .rows[0].to_slug;
    const cascaded_to_slug = (await pool.query(`SELECT to_slug FROM redirects
      WHERE from_slug = $1;`, [old_from_slug]))
      .rows[0].to_slug;
    expect(new_to_slug).toEqual('after-slug');
    expect(cascaded_to_slug).toEqual('after-slug');
    const article_title = (await pool.query(
      'SELECT title FROM articles;'))
      .rows[0].title;
    expect(article_title).toEqual(new_data.title);
    done();
  });

  it('should create new article from body and send 201', async done => {
    const [id] = await insertDummyDrafts(1);
    const new_data = {
      title: 'title', author: 'author', description: 'description',
      content: 'content', category: 'category',
      tags: ['tag 1', 'tag 2'], image: 'image'
    };
    expect(await count('drafts')).toEqual(1);
    expect(await count('articles')).toEqual(0);
    await request.post(`/api/admin/drafts/publish/${id}`)
      .send(new_data)
      .expect(201);
    expect(await count('drafts')).toEqual(0);
    expect(await count('articles')).toEqual(1);
    const article_title = (await pool.query(
      'SELECT title FROM articles;'))
      .rows[0].title;
    expect(article_title).toEqual(new_data.title);
    done();
  });
});

describe('GET /api/admin/drafts/article/{id}', () => {
  it('should send 403 for unauthorized access', async done => {
    auth.__mockUnauthorized();
    request.get('/api/admin/drafts/article/1').expect(403, done);
  });

  it('should send 400 for invalid ID', async done => {
    request.get('/api/admin/drafts/article/fff').expect(400, done);
  });

  it('should send 404 for nonexistent article', async done => {
    request.get('/api/admin/drafts/article/1').expect(404, done);
  });

  it('should retrieve existent draft and send 200', async done => {
    const article_id = (await pool.query(`INSERT INTO
      articles(title, slug, author, description, content, category)
      VALUES('', '', '', '', '', '') RETURNING id;`))
      .rows[0].id;
    const draft_id = (await pool.query(`INSERT INTO
      drafts(article_id, title, author, description, content, category)
      VALUES($1, '', '', '', '', '') RETURNING id;`, [article_id]))
      .rows[0].id;
    request.get(`/api/admin/drafts/article/${article_id}`)
      .expect(200, { id: draft_id }, done);
  });
});