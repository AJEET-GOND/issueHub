import 'dotenv/config'
import dns from 'node:dns'
import app from './app.js'
import connectDatabase from './config/database.js'

dns.setServers(['1.1.1.1', '8.8.8.8'])

const port = Number(process.env.PORT || 3000)
const mongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim()

async function startServer() {
  if (!mongoUri) {
    throw new Error('Set MONGO_URI (or MONGODB_URI) in backend/.env before starting IssueHub.')
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Set JWT_SECRET to a random value of at least 32 characters in backend/.env.')
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number between 1 and 65535.')
  }

  await connectDatabase(mongoUri)
  app.listen(port, () => {
    console.log(`IssueHub API listening on http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error(`IssueHub failed to start: ${error.message}`)
  process.exitCode = 1
})
