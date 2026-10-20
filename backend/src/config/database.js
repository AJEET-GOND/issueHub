import mongoose from 'mongoose'

async function connectDatabase(uri) {
  let parsedUri

  try {
    parsedUri = new URL(uri)
  } catch {
    throw new Error('MONGO_URI must be a valid MongoDB connection URI')
  }

  if (
    !['mongodb:', 'mongodb+srv:'].includes(parsedUri.protocol) ||
    !parsedUri.hostname
  ) {
    throw new Error('MONGO_URI must be a valid MongoDB connection URI')
  }

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 10000 })
  console.log('Connected to MongoDB')
}

export default connectDatabase
