import { ClientRequest, IncomingMessage, ServerResponse } from 'http'
import { ok, rejects } from 'assert'

import { Pool } from 'pg'

import { CrudOperation, CrudHandlers, DatabaseWrapper, ParsedRequest } from './types.d'

export const getCrudOperation = (req: IncomingMessage): CrudOperation => {
  switch (req.method) {
    case "GET": return "read"
    case "POST": return "create"
    case "PUT": return "update"
    case "DELETE": return "delete"
    default: throw new Error(`HTTP method does not correspond to a CRUD operation: ${req.method}`)
  }
}

// Invoke the corresponding HTTP method handler.
// If the HTTP method is not supported, end the request with a 405.
export const handle = (req: IncomingMessage, res: ServerResponse, db: DatabaseWrapper, crudHandlers: CrudHandlers): Promise<any> => {
  const crudOperation = getCrudOperation(req)
  const handler = crudHandlers[crudOperation]
  if (handler) {
    return handler(req, res, db)
  } else {
    return Promise.reject("UNKNOWN_METHOD")
  }
}

// Extract information about the request, including any JSON payload.
// Throws if not a valid CRUD request.
export const parseRequest = (req: IncomingMessage): Promise<ParsedRequest> => {
  const crudOperation = getCrudOperation(req)
  let id: number | null = null

  // Validate the URL and extract components - such as the entity ID
  // @ts-ignore - Typescript complains req.url might be undefined - but we check below
  ok(req.url) // assert req.url is truthy
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathComponents = url.pathname.split('/').filter(component => component.length)
  // console.log(url.pathname, pathComponents)
  if (pathComponents.length > 2) {
    console.error(`Invalid path: ${url.pathname}`)
    return Promise.reject("INVALID_PATH")
  }
  if (pathComponents.length > 1 && Number.isInteger(Number(pathComponents[1]))) {
    id = parseInt(pathComponents[1])
  }

  if (crudOperation === "create" || crudOperation === "update") {
    // req is IncomingReqest, which implements stream.Readable and provides
    // the attached payload as a readable stream. So we need to extract all
    // the data using the stream API; we also make sure it's valid JSON.
    return new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => {
        data += chunk;
      })
      req.on('end', () => {
        // throw new Error(data)
        try {
          resolve({
            id,
            crudOperation,
            jsonPayload: JSON.parse(data)
          })
        } catch (ex) {
          reject("INVALID_JSON")
        }
      })
    })
  } else {
    return Promise.resolve({
      id,
      crudOperation,
    })
  }
}

export const sendJsonResponse = (res: ServerResponse, payload: any): void => {
  const jsonResponse = JSON.stringify(payload)
  res.writeHead(200, {'Content-Type': 'application/json' });
  res.end(jsonResponse)
}

export const toPostgresTimeAndZone = (unixEpochSeconds: number): string => {
  return new Date(unixEpochSeconds).toISOString()
}
