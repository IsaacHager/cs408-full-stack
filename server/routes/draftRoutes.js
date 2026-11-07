const express = require('express');
const router = express.Router();
const Draft = require('../drafts/draft')
const mongoose = require('mongoose');
const draftController = require('../drafts/draftController');
const upload = require('../drafts/fileUploadMiddleware');

router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const drafts = (await Draft.find({ userId }));

        return res.status(200).json({
            count: drafts.length,
            data: drafts
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

});

router.post('/', async (req, res) => {
    try {
        const { canvasAssignmentId, title, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const draft = await Draft.create({
            userId,
            canvasAssignmentId,
            title: title || `New Draft ${canvasAssignmentId}`,
            todos: [],
            files: []
        });

        return res.status(200).json({
            data: draft
        });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

});


router.get('/:draftId', async (req, res) => {
    try {
        const { userId } = req.query;
        const { draftId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const draft = (await Draft.findOne({ _id: draftId, userId }));

        if (!draft) {
            return res.status(404).json({ error: 'Draft not found' });
        }

        return res.status(200).json(draft);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

});


router.delete('/:draftId', async (req, res) => {
    try {
        const { userId } = req.query;
        const { draftId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const draft = (await Draft.findOne({ _id: draftId, userId })); 

        if (!draft) {
            return res.status(404).json({ error: 'Draft not found' });
        }

        if (draft.files && draft.files.length > 0 && global.gfsBucket) {
            for (const file of draft.files) {
                if (file.fileId) {
                    try {
                        await global.gfsBucket.delete(new mongoose.Types.ObjectId(file.fileId));
                    } catch (fileErr) {
                        console.error(`Failed to delete GridFS file ${file.fileId}:`, fileErr);
                    }
                }
            }
        }

        await Draft.findOneAndDelete({ _id: draftId, userId });

        return res.status(200).json({ message: 'Draft deleted successfully' });

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }

});

router.put('/:draftId', async (req, res) => {
    try {
        const { draftId } = req.params;
        const { userId } = req.query;
        const { title, assignment } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const updateFields = {};

        if (title !== undefined && title !== null) {
            updateFields.title = title;
        }

        if (assignment !== undefined && assignment !== null) {
            updateFields.canvasAssignmentId = assignment;
        }

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ error: 'No valid fields provided for update' });
        }

        const draft = await Draft.findOneAndUpdate(
            { _id: draftId, userId },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!draft) {
            return res.status(404).json({ error: 'Draft not found' });
        }

        return res.status(200).json({ success: true, data: draft });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.post('/:draftId/todos', async (req, res) => {
    try {
        const { draftId } = req.params;
        const { userId } = req.query;
        const { task, parentId, timeMinutes, isCompleted } = req.body;


        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        if (!task) {
            return res.status(400).json({ error: 'Missing required parameters' });
        }

        const draft = await Draft.findOneAndUpdate(
            { _id: draftId, userId },
            {
                $push: {
                    todos: {
                        task,
                        parentId,
                        timeMinutes: Number(timeMinutes) || 0,
                    }
                },
            },
            { new: true, runValidators: true }
        );

        if (!draft) {
            return res.status(404).json({ error: 'Draft not found' });
        }

        return res.status(200).json({ success: true, data: draft });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.put('/:draftId/todos/:taskId', async (req, res) => {
    try {
        const { draftId, taskId } = req.params;
        const { userId } = req.query;
        const { task, parentId, timeMinutes, isCompleted } = req.body;


        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const updateFields = {};

        if (task !== undefined) updateFields['todos.$.task'] = task;
        if (parentId !== undefined) updateFields['todos.$.parentId'] = parentId;
        if (timeMinutes !== undefined) updateFields['todos.$.timeMinutes'] = Number(timeMinutes) || 0;
        if (isCompleted !== undefined) updateFields['todos.$.isCompleted'] = isCompleted;

        const draft = await Draft.findOneAndUpdate(
            { _id: draftId, userId, 'todos._id': taskId },
            { $set: updateFields },
            { new: true, runValidators: true }
        );

        if (!draft) {
            return res.status(404).json({ error: 'Draft or Task not found' });
        }

        return res.status(200).json({ data: draft });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.delete('/:draftId/todos/:taskId', async (req, res) => {
    try {
        const { draftId, taskId } = req.params;
        const { userId } = req.query;


        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        const draft = await Draft.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(draftId), userId },
            {
                $pull: {
                    todos: { _id: new mongoose.Types.ObjectId(taskId) },
                },
            },
            { new: true }
        );

        if (!draft) {
            return res.status(404).json({ error: 'Draft or Task not found' });
        }

        return res.status(200).json({ data: draft });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

router.put('/:draftId/files', upload.single('file'), draftController.addFileToDraft);

router.get('/:draftId/files/:fileId', draftController.downloadFile);

router.delete('/:draftId/files/:fileId', upload.single('file'), draftController.removeFileFromDraft);

module.exports = router;
