const mongoose = require('mongoose');

const taskItemSchema = new mongoose.Schema({
    task: { type: String, required: true },
    parentId: { type: mongoose.Schema.Types.ObjectId },
    timeMinutes: { type: Number },
    isCompleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const fileSchema = new mongoose.Schema({
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'fs.files'
    },
    fileName: { type: String, required: true },
    contentType: { type: String },
    fileSize: { type: Number }, // in bytes
    uploadedAt: { type: Date, default: Date.now }
});

const draftSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    canvasAssignmentId: {
        type: String,
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['draft', 'completed', 'graded'],
        default: 'draft'
    },
    files: [fileSchema],
    todos: [taskItemSchema]
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Draft', draftSchema);
