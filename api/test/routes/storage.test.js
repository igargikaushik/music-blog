const app = require('../../src/server.js');
const supertest = require('supertest');
const request = supertest(app);

const GOOD_ALT_FILENAME = 'this_file_has_an_alt.jpeg';
const GOOD_NO_ALT_FILENAME = 'this_file_has_no_alt.jpeg';
const BAD_FILENAME = 'this_file_does_not_exist.jpeg';

const TEST_ALT = 'test_alt';

jest.mock('../../src/services/cloud_storage.js', () => {
  const good_alt_file = {
    get: jest.fn(
      (cb) => cb(null, { metadata: { metadata: { alt: TEST_ALT } } })
    ),
  };

  const good_no_alt_file = {
    get: jest.fn((cb) => cb(null, { metadata: {} })),
  };

  const bad_file = {
    get: jest.fn((cb) => cb({ code: 404 }, null)),
  };

  const mocked_bucket = {
    file: jest.fn((name) => {
      if (name == `static/${GOOD_ALT_FILENAME}`) {
        return good_alt_file;
      } else if (name == `static/${GOOD_NO_ALT_FILENAME}`) {
        return good_no_alt_file;
      } else {
        return bad_file;
      }
    }),
  };

  return {
    bucket: mocked_bucket
  };
});

describe('GET /api/storage/alt', () => {
  it('should send 400 on empty query', async done => {
    const response1 = await request.get('/api/storage/alt');
    const response2 = await request.get('/api/storage/alt?file=');
    expect(response1.status).toEqual(400);
    expect(response2.status).toEqual(400);
    done();
  });

  it('should send null on nonexistent file', async done => {
    const response = await request.get(`/api/storage/alt?file=/static_files/${BAD_FILENAME}`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ alt: null });
    done();
  });

  it('should send alt if file has one', async done => {
    const response = await request.get(`/api/storage/alt?file=/static_files/${GOOD_ALT_FILENAME}`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ alt: TEST_ALT });
    done();
  });

  it('should send null if file has no alt', async done => {
    const response = await request.get(`/api/storage/alt?file=/static_files/${GOOD_NO_ALT_FILENAME}`);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ alt: null });
    done();
  });
});