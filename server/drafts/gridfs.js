const mongoose = require('mongoose');

let bucket;

const getGridFSBucket = () => {
  if (!bucket) {
    bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'fs'
    });
  }
  return bucket;
};

module.exports = { getGridFSBucket };