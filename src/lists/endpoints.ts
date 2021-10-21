import { IncomingMessage, ServerResponse } from "http"
import { equal, ok } from 'assert'

import { CrudHandlers, DatabaseWrapper } from '../types'

import { parseRequest, sendJsonResponse, toPostgresTimeAndZone } from "../utils"

export const handlers: CrudHandlers = {
  "read": (req: IncomingMessage, res: ServerResponse, db: DatabaseWrapper): Promise<any> => {
    return parseRequest(req).then((request) => {
      console.log('reading', request)
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
}
