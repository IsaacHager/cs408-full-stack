const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const PORT = process.env.PORT || 3000;

// const MONGO_URI = process.env.NODE_ENV === 'test' ? process.env.MONGODB_URI_TEST : process.env.MONGODB_URI;  // Not using NODE_ENV as of now
async function startServer() {
  let mongoURI = process.env.MONGODB_URI;
  let mongoServer = null;

  if (!mongoURI) {
    console.log('Running on MongoMemoryServer');
    mongoServer = await MongoMemoryServer.create();
    mongoURI = mongoServer.getUri();
  }

  try {
    await mongoose.connect(mongoURI);

    console.log('Connected to MongoDB');

    const server = app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`)
    });

    const stopServer = async () => {
      console.log('Shutting down...');

      server.close();
      await mongoose.disconnect();
      
      if (mongoServer) {
        await mongoServer.stop();
      }

      process.exit(0);
    };

    process.on('SIGINT', stopServer);
    process.on('SIGTERM', stopServer);

  } catch (error) {
    console.error('MongoDB connection error: ', error);
    process.exit(1);
  }
}

startServer();
