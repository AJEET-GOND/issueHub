import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'
import errorHandler from './middleware/errorHandler.js'
import notFound from './middleware/notFound.js'
import apiRoutes from './routes/index.js'

const app = express()

app.use(cors({
  origin: process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use('/api', apiRoutes)
app.use(notFound)
app.use(errorHandler)

export default app
