import { IncomingMessage, ServerResponse } from "http"
import { equal, ok } from 'assert'

import { CrudHandlers, DatabaseWrapper } from '../types'

import { parseRequest, sendJsonResponse, toPostgresTimeAndZone } from "../utils"

export const handlers: CrudHandlers = {
  "read": (req: IncomingMessage, res: ServerResponse, db: DatabaseWrapper): Promise<any> => {
    return parseRequest(req).then((request) => {
      equal(request.crudOperation, "read")
      if (request.id) {
        return db.executeQuery('SELECT * FROM tasks WHERE id = $1', [request.id]).then(results => {
          console.log(results)
          equal(results.rows.length, 1)
          sendJsonResponse(res, results.rows[0])
        })
      } else {
        return db.executeQuery('SELECT * FROM tasks').then(results => {
          sendJsonResponse(res, results.rows)
        })
      }
    })
  },

  "create": (req: IncomingMessage, res: ServerResponse, db: DatabaseWrapper): Promise<any> => {
    return parseRequest(req).then((request) => {
      ok(request.jsonPayload.title)
      // console.log('creating', request)
      return db.executeQuery('INSERT INTO tasks (title, updatedAt) VALUES ($1, $2)', [
          request.jsonPayload.title,
          toPostgresTimeAndZone(Date.now()),
        ]
      ).then(results => {
        equal(results.rowCount, 1)
        res.writeHead(201)
        res.end()
      })
    })
  },

  "update": (req: IncomingMessage, res: ServerResponse, db: DatabaseWrapper): Promise<any> => {
    return parseRequest(req).then((request) => {
      ok(request.id)
      ok(request.jsonPayload.title)
      return db.executeQuery(
        'UPDATE tasks SET (title, updatedAt) = ($1, $2) WHERE ID = $3', [
          request.jsonPayload.title,
          toPostgresTimeAndZone(Date.now()),
          request.id
        ]
      ).then(results => {
        equal(results.rowCount, 1)
        res.writeHead(200)
        res.end()
      })
    })
  },

  "delete": (req: IncomingMessage, res: ServerResponse, db: DatabaseWrapper): Promise<any> => {
    return parseRequest(req).then((request) => {
      return db.executeQuery(
        'DELETE FROM tasks WHERE ID = $1', [
          request.id
        ]
      ).then(results => {
        console.log('query results', results)
        equal(results.rowCount, 1)
        res.writeHead(200)
        res.end()
      })
    })
  },
}
