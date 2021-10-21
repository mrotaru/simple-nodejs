// @ts-nocheck
const assert = require('assert')
const { PassThrough } = require('stream')

const endpoints = require('./endpoints')

// stub an IncomingMessage; using PassThrough to stub stream data
const stubIncomingMessage = (method: string, url: string, data: any) => {
  const req = new PassThrough()
  req.url = url
  req.method = method
  req.headers = {
    host: 'localhost',
  }
  return req
}
const stubServerResponse = () => ({
  writeHead: () => {},
  end: () => {},
})

describe('Tasks', () => {
  // we will stup Date.now, so get a reference to the original function
  const originalDateNow = Date.now
  const hardcodedTimestamp = 1634817600000
  const hardcodedTimestampIso = '2021-10-21T12:00:00.000Z'

  // mock function; something like sinon could be used
  function executeQuery(query: string, ...args): any{
    executeQuery.calledTimes++
    executeQuery.calls.push([query, ...args])
    return executeQuery?.forcedReturnValues.length
      ? executeQuery.forcedReturnValues.pop()
      : undefined
  }
  let db = {
    executeQuery,
  }

  beforeEach(() => {
    executeQuery.calledTimes = 0
    executeQuery.calls = []
    executeQuery.forcedReturnValues = []
    Date.now = () => hardcodedTimestamp
  })

  after(() => {
    Date.now = originalDateNow
  })

  describe('CREATE', () => {
    it('the "create" handler should issue an SQL query for creating a new task', () => {
      const create = endpoints.handlers["create"]

      const title = 'Foo'
      const req = stubIncomingMessage('POST', '/tasks')
      const res = stubServerResponse()

      // stub query execution return value because handler expects a promise
      // (otherwise throws, and test fails)
      db.executeQuery.forcedReturnValues = [Promise.resolve({ rowCount: 1 })]

      // invoke the "create" handler
      const createPromise = create(req, res, db).then(() => {
        const expectedQuery = 'INSERT INTO tasks (title, updatedAt) VALUES ($1, $2)'
        const expectedValues = [title, hardcodedTimestampIso]
        assert.equal(db.executeQuery.calledTimes, 1)
        assert.deepEqual(db.executeQuery.calls[0], [
          expectedQuery,
          expectedValues,
        ])
      })

      // stream data, so promise resolves
      req.emit('data', JSON.stringify({ title }))
      req.end()

      return createPromise
    });
  });

  describe('READ - all', () => {
    it('the "read" handler should issue an SQL query for reading all tasks', () => {
      const read = endpoints.handlers["read"]
      const req = stubIncomingMessage('GET', '/tasks')
      const res = stubServerResponse()
      db.executeQuery.forcedReturnValues = [Promise.resolve({ rows: [{}] })]
      return read(req, res, db).then(res => {
        const expectedQuery = 'SELECT * FROM tasks'
        assert.equal(db.executeQuery.calledTimes, 1)
        assert.deepEqual(db.executeQuery.calls[0], [
          expectedQuery,
        ])
      })
    });
  })
  // describe.skip('UPDATE', () => {
  //   it('should update a task given by id and payload', () => {
  //   });
  // })
  // describe.skip('DELETE', () => {
  //   it('should delete a task given by id', () => {
  //   });
  // })
});
