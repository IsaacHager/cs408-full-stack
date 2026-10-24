const mongoose = require('mongoose');
const { connectTestDb, clearTestDb, closeTestDb } = require('./setupDb');

const TestSchema = new mongoose.Schema({
    name: String,
    value: Number,
});

const TestModel = mongoose.model('Test', TestSchema);

describe('Database Operations', () => {

    beforeAll(async () => await connectTestDb());

    afterEach(async () => await clearTestDb());

    afterAll(async () => await closeTestDb());

    test('can connect to the test database', async () => {
        const connectionState = mongoose.connection.readyState;
        expect(connectionState).toBe(1); // 1 means connected
    });

    test('should create and retrieve a document', async () => {
        const testDoc = new TestModel({ name: 'Test Document', value: 42 });
        await testDoc.save();

        const foundDoc = await TestModel.findOne({ name: 'Test Document' });
        expect(foundDoc).not.toBeNull();
        expect(foundDoc.value).toBe(42);
    });

    test('should update a document', async () => {
        const testDoc = new TestModel({ name: 'Update Test', value: 10 });
        await testDoc.save();

        await TestModel.updateOne({ name: 'Update Test' }, { value: 20 });
        const updatedDoc = await TestModel.findOne({ name: 'Update Test' });
        expect(updatedDoc.value).toBe(20);
    });

    test('should delete a document', async () => {
        const testDoc = new TestModel({ name: 'Delete Test', value: 100 });
        await testDoc.save();

        await TestModel.deleteOne({ name: 'Delete Test' });
        const deletedDoc = await TestModel.findOne({ name: 'Delete Test' });
        expect(deletedDoc).toBeNull();
    });
});
