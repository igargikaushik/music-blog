const app = require('../../src/server.js');
const pool = require('../../src/db/pool.js');
require('../db_setup_teardown.js');
const supertest = require('supertest');
const request = supertest(app);

jest.mock('../../src/middleware/auth.js');

async function insertDummyArticles(n) {
  let id_list = [];
  for (let i = 0; i < n; i++) {
    id_list.push((await pool.query(`INSERT INTO
      articles(title, slug, author, description, content, category)
      VALUES('', '${'slug-' + i}', '', '', '', '') RETURNING id;`)).rows[0].id);
  }
  return id_list;
}

describe('GET /api/articles', () => {
  it('should send 200', async done => {
    request.get('/api/articles').expect(200, done);
  });

  it('should paginate properly', async done => {
    await insertDummyArticles(30);

    const default_p1 = await request.get('/api/articles');
    expect(default_p1.body.length).toEqual(12);
    const default_p2 = await request.get('/api/articles?page=2');
    expect(default_p2.body.length).toEqual(12);
    const default_p3 = await request.get('/api/articles?page=3');
    expect(default_p3.body.length).toEqual(6);

    const long_p1 = await request.get('/api/articles?count=25');
    expect(long_p1.body.length).toEqual(25);
    const long_p2 = await request.get('/api/articles?count=25&page=2');
    expect(long_p2.body.length).toEqual(5);
    done();
  });
});

describe('GET /api/articles/{id}', () => {
  it('should send 404 for invalid ID', async done => {
    request.get('/api/articles/fff').expect(404, done);
  });

  it('should send 404 for nonexistent draft', async done => {
    request.get('/api/articles/1').expect(404, done);
  });

  it('should get correct article and send 200', async done => {
    const new_data = {
      title: 'title', slug: 'slug', author: 'author', description: 'description',
      content: 'content', category: 'category',
      tags: ['tag 1', 'tag 2'], image: 'image'
    };
    const row = (await pool.query(`INSERT INTO
      articles(title, slug, author, description, content, category, tags, image)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`, Object.values(new_data)))
      .rows[0];
    request.get(`/api/articles/${row.slug}`).expect(200);
    for (const key of Object.keys(new_data)) {
      expect(row[key]).toEqual(new_data[key]);
    }
    done();
  });
});