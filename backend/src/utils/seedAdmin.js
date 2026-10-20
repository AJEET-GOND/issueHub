import 'dotenv/config'
import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import User from '../models/User.js'

const uri = (process.env.MONGO_URI || '').trim()
const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME?.trim()

async function seedAdmin() {
  if (!uri) throw new Error('Set MONGO_URI in backend/.env.')
  if (!email || !password || !name) {
    throw new Error('Set ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD in backend/.env.')
  }
  if (password.length < 12 || password.length > 72) {
    throw new Error('ADMIN_PASSWORD must be between 12 and 72 characters.')
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { name, password: passwordHash, role: 'admin' } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  )
  console.log(`Admin account ready: ${user.email}`)
}

seedAdmin()
  .catch((error) => {
    console.error(`Could not seed admin: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
  })
