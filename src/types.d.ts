import { ClientRequest, IncomingMessage, ServerResponse } from "http"

export interface DatabaseWrapper {
  executeQuery: (query: string, args?: unknown[]) => Promise<any>;
}

export type CrudOperation = "create" | "read" | "update" | "delete"

export type AppError = "UNSUPPORTED_METHOD" | "INVALID_PATH" | "INVALID_JSON" | "UNKNOWN_ROUTE"

export type CrudHandler = (req: IncomingMessage, res: ServerResponse, db: DatabaseWrapper) => Promise<any>

export type CrudHandlers = Partial<Record<CrudOperation, CrudHandler>>

export interface ParsedRequest {
  crudOperation: CrudOperation,
  id: number | null,
  jsonPayload?: any,
}
