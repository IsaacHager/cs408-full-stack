const mongoose = require('mongoose');
const { decryptToken } = require('./encryption');

async function getCanvasDomain(contextUserId) {
    if (!contextUserId) {
        throw new Error(`Missing user ID`);
    }
    const db = mongoose.connection.db;

    const userInDb = await db.collection('users').findOne({ userId: contextUserId });
    
    if (!userInDb) {
        throw new Error(`User not in database`);
    }

    const canvasDomain = userInDb.canvasDomain.startsWith('https://')
        ? userInDb.canvasDomain
        : `https://${userInDb.canvasDomain}`;

    return canvasDomain;
}

async function makeAPIGetRequest(contextUserId, endpoint) {
    if (!contextUserId || !endpoint) {
        throw new Error(`Missing parameter`);
    }

    const db = mongoose.connection.db;

    const userInDb = await db.collection('users').findOne({ userId: contextUserId });

    if (!userInDb) {
        throw new Error(`User not in database`);
    }

    const encryptedCanvasToken = userInDb.canvasToken;

    if (!encryptedCanvasToken) {
        throw new Error(`Canvas Token not connected`);
    }

    const canvasToken = decryptToken(encryptedCanvasToken);

    let url = endpoint.startsWith('http')
        ? endpoint
        : userInDb.canvasDomain.startsWith('https://')
            ? `${userInDb.canvasDomain}${endpoint}`
            : `https://${userInDb.canvasDomain}${endpoint}`;

    let accumulatedResults = [];

    while (url) {
        let response;
        try {
            response = await fetch(url, {
                headers: { Authorization: `Bearer ${canvasToken}` },
            });
        } catch (networkError) {
            throw new Error(`Network Error: Cannot connect to Canvas API server.`);
        }

        if (!response.ok) {
            throw new Error(`Canvas API Error ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            return data;
        }

        accumulatedResults.push(...data);

        const linkHeader = response.headers.get('link');
        url = null;

        if (linkHeader) {
            const links = linkHeader.split(',');
            for (const link of links) {
                const match = link.match(/<([^>]+)>;\s*rel="([^"]+)"/);
                if (match && match[2] === 'next') {
                    url = match[1];
                    break;
                }
            }
        }
    }

    return accumulatedResults;
}

async function makeAPIPostRequest(contextUserId, endpoint, req) {
    if (!contextUserId || !endpoint) {
        throw new Error(`Missing parameter`);
    }

    const db = mongoose.connection.db;

    const userInDb = await db.collection('users').findOne({ userId: contextUserId });

    if (!userInDb) {
        throw new Error(`User not in database`);
    }

    const encryptedCanvasToken = userInDb.canvasToken;

    if (!encryptedCanvasToken) {
        throw new Error(`Canvas Token not connected`);
    }

    const canvasToken = decryptToken(encryptedCanvasToken);

    let url = endpoint.startsWith('http')
        ? endpoint
        : userInDb.canvasDomain.startsWith('https://')
            ? `${userInDb.canvasDomain}${endpoint}`
            : `https://${userInDb.canvasDomain}${endpoint}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${canvasToken}`,
                'Content-Type': 'application/json'
            },
            body: req ? JSON.stringify(req) : null
        });

        if (!response.ok) {
            throw new Error(`Canvas API Error ${response.status}`);
        }
        return await response.json();

    } catch (networkError) {
        throw new Error(`Network Error: Cannot connect to Canvas API server.`);
    }
}

async function makeAPIDeleteRequest(contextUserId, endpoint, req) {
    if (!contextUserId || !endpoint) {
        throw new Error(`Missing parameter`);
    }

    const db = mongoose.connection.db;

    const userInDb = await db.collection('users').findOne({ userId: contextUserId });

    if (!userInDb) {
        throw new Error(`User not in database`);
    }

    const encryptedCanvasToken = userInDb.canvasToken;

    if (!encryptedCanvasToken) {
        throw new Error(`Canvas Token not connected`);
    }

    const canvasToken = decryptToken(encryptedCanvasToken);

    let url = endpoint.startsWith('http')
        ? endpoint
        : userInDb.canvasDomain.startsWith('https://')
            ? `${userInDb.canvasDomain}${endpoint}`
            : `https://${userInDb.canvasDomain}${endpoint}`;

    try {
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${canvasToken}`,
                'Content-Type': 'application/json'
            },
            body: req ? JSON.stringify(req) : null
        });
        if (!response.ok) {
            throw new Error(`Canvas API Error ${response.status}`);
        }

        const textData = await response.text();
        return textData ? JSON.parse(textData) : { success: true };

    } catch (networkError) {
        throw new Error(`Network Error: Cannot connect to Canvas API server.`);
    }
}

module.exports = { makeAPIGetRequest, makeAPIPostRequest, makeAPIDeleteRequest, getCanvasDomain };