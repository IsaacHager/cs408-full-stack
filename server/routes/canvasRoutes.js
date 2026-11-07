const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { makeAPIGetRequest, makeAPIPostRequest, makeAPIDeleteRequest, getCanvasDomain } = require('../../utils/canvasAPIInterface');
const { encryptToken } = require('../../utils/encryption');

router.get('/domain', async (req, res) => {
    const {userId } = req.query;

    try {
        const canvasDomain = await getCanvasDomain(userId);
        return res.json({ canvasDomain: canvasDomain });
    } catch (error) {
        console.error('Error when retrieving canvas domain:', error.message);
        return res.status(500).json({ error: 'Error when retrieving canvas domain.' });
    }
});

router.get('/favorites', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter.' });
    }

    try {
        const courses = await makeAPIGetRequest(userId, '/api/v1/users/self/favorites/courses?include[]=course_image');
        return res.json(courses);
    } catch (error) {
        console.error('Error in /api/courses: ', error);
        res.status(500).json({ error: 'Failed to load course data.' });
    }
});

router.post('/favorites', async (req, res) => {
    const { userId, courseIds } = req.body;

    if (!userId || !courseIds || !Array.isArray(courseIds)) {
        return res.status(400).json({ error: 'Missing userId or courseIds array.' });
    }

    try {
        const favoritePromises = courseIds.map(courseId =>
            makeAPIPostRequest(userId, `/api/v1/users/self/favorites/courses/${courseId}`, null)
        );

        await Promise.all(favoritePromises);
        return res.status(200).json({ message: `Successfully favorited ${courseIds.length} courses.` });

    } catch (error) {
        console.error('Error batch favoriting Canvas courses:', error.message);
        return res.status(500).json({ error: 'Failed to complete batch favorite operation.' });
    }
});

router.delete('/favorites', async (req, res) => {
    const { userId, courseIds } = req.body;

    if (!userId || !courseIds || !Array.isArray(courseIds)) {
        return res.status(400).json({ error: 'Missing userId or courseIds array.' });
    }

    try {
        const unfavoritePromises = courseIds.map(courseId =>
            makeAPIDeleteRequest(userId, `/api/v1/users/self/favorites/courses/${courseId}`, null)
        );

        await Promise.all(unfavoritePromises);
        return res.status(200).json({ message: `Successfully unfavorited ${courseIds.length} courses.` });

    } catch (error) {
        console.error('Error batch unfavoriting Canvas courses:', error.message);
        return res.status(500).json({ error: 'Failed to complete batch unfavorite operation.' });
    }
});

router.get('/courses', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter.' });
    }

    try {
        const courses = await makeAPIGetRequest(userId, '/api/v1//courses?include[]=term');

        const accessibleCourses = courses.filter(course => {
            if (course.access_restricted_by_date === true) return false;

            if (course.workflow_state === 'completed') return false;

            if (course.enrollments && Array.isArray(course.enrollments)) {
                const hasConcludedEnrollment = course.enrollments.some(
                    enrollment => enrollment.enrollment_state === 'completed'
                );
                if (hasConcludedEnrollment) return false;
            }

            if (course.restrict_enrollments_to_course_dates === true && course.end_at) {
                const endDate = new Date(course.end_at);
                const now = new Date();

                if (now > endDate) {
                    return false;
                }
            }

            return true;
        }
        );

        return res.json(accessibleCourses);
    } catch (error) {
        console.error('Error in /api/all-courses: ', error);
        res.status(500).json({ error: 'Failed to load course data.' });
    }
});

router.get('/assignments', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter.' });
    }

    try {
        const courses = await makeAPIGetRequest(userId, '/api/v1/users/self/favorites/courses');

        const courseLookup = {};
        courses.forEach(c => {
            courseLookup[c.id] = c.name || c.course_code || `Course ${c.id}`;
        });

        const assignmentsPromises = courses.map(course =>
            makeAPIGetRequest(userId, `/api/v1/courses/${course.id}/assignments?exclude_response_fields[]=description&include[]=submission&include[]=assignment_visibility`)
        );

        const assignmentsArrays = await Promise.all(assignmentsPromises);

        const flatAssignments = assignmentsArrays.flat();

        const cleanData = flatAssignments.map((item, index) => {
            const realId = item.id || (item.assignment && item.assignment.id);

            return {
                ...item,
                id: realId ? String(realId) : `fallback-row-id-${index}`,

                course_name: courseLookup[item.course_id] || 'Unknown Class'
            };
        });

        return res.json(cleanData);
    } catch (error) {
        console.error('Error in /api/assignments: ', error);
        res.status(500).json({ error: 'Failed to load assignment data.' });
    }
});

router.post('/connect', async (req, res) => {
    const { userId, canvasDomain, canvasToken } = req.body;

    if (!userId || !canvasDomain || !canvasToken) {
        return res.status(400).json({ error: `Missing required parameters. userId: ${userId}, canvasDomain: ${canvasDomain}, canvasToken: ${canvasToken}` });
    }

    const cleanDomain = canvasDomain
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '')
        .trim();

    try {
        const canvasTestUrl = `https://${cleanDomain}/api/v1/users/self`;
        const canvasRes = await fetch(canvasTestUrl, {
            headers: { Authorization: `Bearer ${canvasToken.trim()}` },
            signal: AbortSignal.timeout(5000),
        });

        if (canvasRes.status === 401) {
            return res.status(401).json({ error: 'Canvas token is invalid or expired.' });
        }

        if (!canvasRes.ok) {
            return res.status(canvasRes.status).json({
                error: `Canvas server returned status ${canvasRes.status}. Check your Canvas domain.`
            });
        }

        const canvasData = await canvasRes.json();

        if (!canvasData || !canvasData.id) {
            return res.status(400).json({ error: 'Invalid response format received from Canvas.' });
        }

        const encryptedToken = encryptToken(canvasToken.trim());

        const db = mongoose.connection.db;
        const result = await db.collection('users').updateOne(
            { userId },
            {
                $set: {
                    canvasDomain: cleanDomain,
                    canvasToken: encryptedToken,
                    hasCanvasToken: true,
                    canvasUserId: canvasData.id,
                    updatedAt: new Date(),
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User record not found.' });
        }

        return res.json({
            success: true,
            message: 'Canvas token connected successfully.',
            canvasUser: {
                id: canvasData.id,
                name: canvasData.name,
            },
        });
    } catch (error) {
        if (error.name === 'TimeoutError') {
            return res.status(504).json({ error: 'Canvas server connection timed out.' });
        }
        console.error('Canvas connection error:', error.message);
        return res.status(500).json({ error: 'Failed to verify or connect Canvas token.' });
    }
});

module.exports = router;
