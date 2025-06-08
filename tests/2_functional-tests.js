const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
const {
    ObjectID
} = require('mongodb');

chai.use(chaiHttp);

suite('Functional Tests', function () {
    let testIssueId;
    test('Create an issue with every field', (done) => {
        chai.request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({
                issue_title: 'Test Issue',
                issue_text: 'This is a test issue',
                created_by: 'Tester',
                assigned_to: 'Dev',
                status_text: 'In Progress'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.issue_title, 'Test Issue');
                assert.equal(res.body.issue_text, 'This is a test issue');
                assert.equal(res.body.created_by, 'Tester');
                assert.equal(res.body.assigned_to, 'Dev');
                assert.equal(res.body.status_text, 'In Progress');
                assert.isTrue(res.body.open);
                assert.isString(res.body._id);
                assert.isString(res.body.created_on);
                assert.isString(res.body.updated_on);
                testIssueId = new ObjectID(res.body._id);
                done();
            });
    })
    test('Create an issue with only required fields', (done) => {
        chai.request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({
                issue_title: 'Test Issue 2',
                issue_text: 'This is another test issue',
                created_by: 'Tester 2'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.issue_title, 'Test Issue 2');
                assert.equal(res.body.issue_text, 'This is another test issue');
                assert.equal(res.body.created_by, 'Tester 2');
                assert.equal(res.body.assigned_to, '');
                assert.equal(res.body.status_text, '');
                assert.isTrue(res.body.open);
                assert.isString(res.body._id);
                assert.isString(res.body.created_on);
                assert.isString(res.body.updated_on);
                done();
            });
    })
    test('Create an issue with missing required fields', (done) => {
        chai.request(server)
            .keepOpen()
            .post('/api/issues/test')
            .send({
                issue_title: 'Test Issue 3',
                issue_text: 'This is a test issue without created_by'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.error, 'required field(s) missing');
                done();
            });
    })
    test('View issues on a project', (done) => {
        chai.request(server)
            .keepOpen()
            .get('/api/issues/test')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                done();
            });
    })
    test('VIew issues on a project with one filter', (done) => {
        chai.request(server)
            .keepOpen()
            .get('/api/issues/test')
            .query({
                issue_title: 'Test Issue'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.equal(res.body[0].issue_title, 'Test Issue');
                done();
            });
    })
    test('View issues on a project with multiple filters', (done) => {
        chai.request(server)
            .keepOpen()
            .get('/api/issues/test')
            .query({
                issue_title: 'Test Issue',
                created_by: 'Tester',
                open: true
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.equal(res.body[0].issue_title, 'Test Issue');
                assert.equal(res.body[0].created_by, 'Tester');
                assert.isTrue(res.body[0].open);
                done();
            });
    })
    test('Update one field on an issue', (done) => {
        chai.request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({
                _id: testIssueId,
                issue_title: 'Updated Test Issue'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, testIssueId);
                done();
            });
    })
    test('Update multiple fields on an issue', (done) => {
        chai.request(server)
        chai.request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({
                _id: testIssueId,
                issue_title: 'Updated Test Issue2',
                issue_text: 'Updated issue text2',
                assigned_to: 'Updated Dev2',
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.result, 'successfully updated');
                assert.equal(res.body._id, testIssueId);
                done();
            });
    })
    test('Update an issue with missing _id', (done) => {
        chai.request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({
                issue_title: 'Test Issue without ID'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    })
    test('Update an issue with no fields to update', (done) => {
        chai.request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({
                _id: testIssueId
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.error, 'no update field(s) sent');
                assert.equal(res.body._id, testIssueId);
                done();
            })
    })
    test('Update an issue with invalid _id', (done) => {
        let invalidId = '12345';
        chai.request(server)
            .keepOpen()
            .put('/api/issues/test')
            .send({
                _id: invalidId,
                issue_title: 'Test Issue with Invalid ID'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.error, 'could not update');
                assert.equal(res.body._id, invalidId);
                done();
            });
    })
    test('Delete an issue', (done) => {
        chai.request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .send({
                _id: testIssueId
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.result, 'successfully deleted');
                assert.equal(res.body._id, testIssueId);
                done();
            });
    })
    test('Delete an issue with invalid _id', (done) => {
        chai.request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .send({
                _id: 'invalid_id'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.error, 'could not delete');
                assert.equal(res.body._id, 'invalid_id');
                done();
            });
    })
    test('Delete an issue with missing _id', (done) => {
        chai.request(server)
            .keepOpen()
            .delete('/api/issues/test')
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.isObject(res.body);
                assert.equal(res.body.error, 'missing _id');
                done();
            });
    })
});