import { Server } from "http"

import { handlers as taskHandlers } from './tasks/endpoints'
import { handlers as listHandlers } from './lists/endpoints'
import { AppError, DatabaseWrapper } from './types'

import { handle } from './utils'

export default class App {
  db: DatabaseWrapper;
  server: Server;

  constructor(db: DatabaseWrapper) {
    this.db = db
    this.server = new Server()
  }

  start(port: number): void {
    this.server
      .on('request', (req, res) => {
        const { method, url } = req
        console.log(`${method} ${url}`)

        // handle errors - use the req and res from closure
        const errorHandler = (error: AppError | any): void => {
          console.error(`  ${error}`)
          if (error === "UNKNOWN_ROUTE" || error === "INVALID_PATH") {
            res.writeHead(404)
          } else if (error === "INVALID_JSON") {
            res.writeHead(400, "Invalid JSON")
          } else if (error === "UNSUPPORTED_METHOD") {
            res.writeHead(405)
          } else {
            res.writeHead(500)
          }
          res.end()
        }

        // routing
        if (req.url === '/tasks' || req.url?.startsWith('/tasks/')) {
          handle(req, res, this.db, taskHandlers).catch(errorHandler)
        } else if (req.url === '/lists' || req.url?.startsWith('/lists/')) {
          handle(req, res, this.db, listHandlers).catch(errorHandler)
        } else {
          errorHandler("UNKNOWN_ROUTE")
        }
      })
      .listen(port)
    console.log(`listening on ${port}...`)
  }
}

