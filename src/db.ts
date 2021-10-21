import { Pool } from 'pg'

import { DatabaseWrapper } from './types'

// connection pool
export class PostgresWrapper implements DatabaseWrapper {
  connectionString: string;
  private connected: boolean = false;
  private connecting: boolean = false;
  private pool: Pool | null = null;

  constructor(connectionString: string) {
    this.connectionString = connectionString
  }

  connect(): Promise<void> {
    if (this.connecting) {
      return Promise.reject("Can only have one Postgres connection pool")
    }

    this.connecting = true
    this.pool = new Pool({
      max: 20,
      connectionString: this.connectionString,
    })

    return this.pool.connect().then((result) => {
      console.log(`postgres: connected to ${this.connectionString}`)
      this.connected = true
    }).catch((ex) => {
      this.connecting = false
      throw ex
    })
  }

  executeQuery(query: string, args?: unknown[]): Promise<any> {
    if (!this.connectionString) {
      return Promise.reject('Database has no connection string')
    }
    if (!this.connected || !this.pool) {
      return Promise.reject('Database not connected')
    }
    return this.pool.query(query, args)
  }
}

