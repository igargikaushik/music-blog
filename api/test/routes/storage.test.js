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
  it('should send 400 on empty query', async () => {
    return Promise.all([
      request.get('/api/storage/alt').expect(400),
      request.get('/api/storage/alt?file=').expect(400),
    ]);
  });

  it('should send null on nonexistent file', async done => {
    request.get(`/api/storage/alt?file=/static_files/${BAD_FILENAME}`)
      .expect(200, { alt: null }, done);
  });

  it('should send alt if file has one', async done => {
    request.get(`/api/storage/alt?file=/static_files/${GOOD_ALT_FILENAME}`)
      .expect(200, { alt: TEST_ALT }, done);
  });

  it('should send null if file has no alt', async done => {
    request.get(`/api/storage/alt?file=/static_files/${GOOD_NO_ALT_FILENAME}`)
      .expect(200, { alt: null }, done);
  });
});