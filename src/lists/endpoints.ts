import { IncomingMessage, ServerResponse } from "http"
import { equal, ok } from 'assert'

import { CrudHandlers, DatabaseWrapper } from '../types'

import { parseRequest, sendJsonResponse, toPostgresTimeAndZone } from "../utils"

export const handlers: CrudHandlers = {
  // If requesting an individual task list, you get the tasks as well
  // If requesting all task lists, you get the list id and title only - not the tasks
  "read": (req: IncomingMessage, res: ServerResponse, db: DatabaseWrapper): Promise<any> => {
    return parseRequest(req).then((request) => {
      equal(request.crudOperation, "read")
      if (request.id) {
        return db.executeQuery('SELECT * FROM lists WHERE id = $1', [request.id]).then(results => {
          if (results.rows.length === 0) {
            return Promise.reject("UNKNOWN_ROUTE")
          }

          // from this first query we get the task list title
          const response = {
            title: results.rows[0].title,
            tasks: [],
          }
          equal(results.rows.length, 1)

          // we still need the task items - so we get the IDs, then the payloads
          const promises: any = []
          const tasks = []
          db.executeQuery('SELECT taskId FROM tasksLists WHERE listId = $1', [request.id]).then(results => {
            for(let task of results.rows) {
              promises.push(db.executeQuery('SELECT * FROM tasks WHERE id = $1', [task.taskid]).then(results => {
                // @ts-ignore
                response.tasks.push(results.rows[0])
              }))
            }
          }).then(() => {
            // all task payloads were obtained; build return JSON payload
            return Promise.all(promises).then(() => {
              sendJsonResponse(res, response)
            })
          })
        })
      } else {
        return db.executeQuery('SELECT * FROM lists').then(results => {
          sendJsonResponse(res, results.rows)
        })
      }
    })
  },

  // To add/remove tasks to/from a list, provide JSON arrays; title updates go in "setTitle"
  // { "add": [1,2], "remove": [3], "setTitle": "Bar" }
  "update": (req: IncomingMessage, res: ServerResponse, db: DatabaseWrapper): Promise<any> => {
    return parseRequest(req).then((request) => {
      ok(request.id, 'must have an id')
      ok(request.jsonPayload)

      const promises = []

      // update title
      if (request.jsonPayload.setTitle) {
        promises.push(db.executeQuery(
          'UPDATE lists SET (title, updatedAt) = ($1, $2) WHERE ID = $3', [
            request.jsonPayload.setTitle,
            toPostgresTimeAndZone(Date.now()),
            request.id
          ]
        ))
      }
      
      // add or remove tasks
      const listId = request.id
      if (request.jsonPayload.add || request.jsonPayload.remove) {
        ok(Array.isArray(request.jsonPayload.add))
        const taskIds = request.jsonPayload.add
        ok(taskIds.length > 0)
        const values = taskIds.reduce((acc: any, curr: any) => { acc = `${acc}${acc.length ? ', ': ''}(${listId}, ${curr})`; return acc; }, '')

        if (request.jsonPayload.add) {
          // Due to unique constraints, this will fail if trying to add the same task to the same
          // task list twice. TODO: ON_CONFLICT, so it's less strict
          promises.push(db.executeQuery(`INSERT INTO tasksLists (listId, taskId) VALUES ${values}`))
        }

        if (request.jsonPayload.remove) {
          promises.push(db.executeQuery(`DELETE FROM tasksLists (listId, taskId) VALUES ${values}`))
        }
      }

      // execute queries
      return Promise.all(promises).then(results => {
        // equal(results.rowCount, 1)
        res.writeHead(200)
        res.end()
      })
    })
  },

  "create": (req: IncomingMessage, res: ServerResponse, db: DatabaseWrapper): Promise<any> => {
    return parseRequest(req).then((request) => {
      ok(request.jsonPayload.title)
      return db.executeQuery('INSERT INTO lists (title, updatedAt) VALUES ($1, $2)', [
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

  "delete": (req: IncomingMessage, res: ServerResponse, db: DatabaseWrapper): Promise<any> => {
    return parseRequest(req).then((request) => {
      // remove items from taskslists
      return db.executeQuery('DELETE FROM taskslists WHERE listid = $1', [
          request.id,
        ]
      ).then(results => {
        // remove item from lists
        return db.executeQuery('DELETE FROM lists WHERE ID = $1', [
            request.id,
          ]
        )
      }).then(results => {
        res.writeHead(200)
        res.end()
      })
    })
  },
}
