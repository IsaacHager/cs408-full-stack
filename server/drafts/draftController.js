const { Readable } = require('stream');
const mongoose = require('mongoose');
const Draft = require('./draft');
const { getGridFSBucket } = require('./gridfs');

exports.addFileToDraft = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { draftId } = req.params;
    const { userId } = req.query;
    const bucket = getGridFSBucket();

    const readableStream = Readable.from(req.file.buffer);

    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype
    });

    readableStream.pipe(uploadStream);

    uploadStream.on('error', (error) => {
      return res.status(500).json({ error: error.message });
    });

    uploadStream.on('finish', async () => {
      const fileMetadata = {
        fileId: uploadStream.id,
        fileName: req.file.originalname,
        contentType: req.file.mimetype,
        fileSize: req.file.size
      };

      const draft = await Draft.findOneAndUpdate(
        { _id: draftId, userId },
        { $push: { files: fileMetadata } },
        { new: true, runValidators: true }
      );

      if (!draft) {
        await bucket.delete(uploadStream.id);
        return res.status(404).json({ error: 'Draft not found' });
      }

      return res.status(201).json({ data: draft });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const bucket = getGridFSBucket();
    const _id = new mongoose.Types.ObjectId(fileId);

    const files = await bucket.find({ _id }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const file = files[0];
    const downloadName = file.filename || 'downloaded-file';
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Content-Disposition', `attachment; filename="${encodeURIComponent(downloadName)}"`);

    const downloadStream = bucket.openDownloadStream(_id);
    downloadStream.pipe(res);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message });
  }
};

exports.removeFileFromDraft = async (req, res) => {
  try {
    const { draftId, fileId } = req.params;
    const { userId } = req.query;
    const bucket = getGridFSBucket();
    const gridFsId = new mongoose.Types.ObjectId(fileId);

    await bucket.delete(gridFsId);

    const draft = await Draft.findOneAndUpdate(
      { _id: draftId, userId },
      { $pull: { files: { fileId: gridFsId } } },
      { new: true }
    );

    if (!draft) {
      return res.status(404).json({ error: 'Draft not found' });
    }

    return res.status(200).json({ data: draft });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};