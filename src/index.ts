import App from './app'
import { PostgresWrapper } from './db'

const dbName = 'organiser'

const db = new PostgresWrapper(`postgres://postgres:password@localhost:5432/${dbName}`)

const app = new App(db)
db.connect().then(() => {
  console.log('connected to db...')
  app.start(8000)
}).catch(ex => {
  console.error('app could not start')
  console.error(ex)
})
