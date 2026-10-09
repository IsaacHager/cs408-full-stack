const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');
// const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000;

// Database logic once database can be connected with script
// const MONGO_URI = process.env.MONGO_URI;


// mongoose.connect(MONGO_URI)
//   .then(() => {
//     console.log('Connected to MongoDB');
//     app.listen(PORT, () => {
//       console.log(`Server listening on port ${PORT}`)
//     })
//   })
//   .catch((err) => {
//     console.error('MongoDB connection error: ', err);
//     process.exit(1);
//   });

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
