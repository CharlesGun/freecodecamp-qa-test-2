'use strict';

const {
  ObjectID
} = require('mongodb');

module.exports = function (app, myDataBase) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;
      let {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.query;

      let query = {
        project,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      }
      if (req.query.open !== undefined && req.query.open !== null && req.query.open !== '') {
        if (req.query.open === 'true') {
          query.open = true;
        } else {
          query.open = false;
        }
      }
      // Remove undefined properties from query
      Object.keys(query).forEach(key => {
        if (query[key] === undefined) {
          delete query[key];
        }
      });

      myDataBase.find(
          query
        )
        .project({
          project: 0
        }) // Exclude project field from results
        .toArray((err, issues) => {
          if (err) {
            return res.status(500).json({
              error: 'Database error'
            });
          }
          res.status(200).json(issues);
        })
    })

    .post(function (req, res) {
      let project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.body;
      const issue = {
        project: project,
        issue_title: issue_title,
        issue_text: issue_text,
        created_by: created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      }

      if (!issue_title || !issue_text || !created_by) {
        return res.status(200).json({
          error: 'required field(s) missing'
        })
      }

      myDataBase.insertOne(issue, (err, result) => {
        if (err) {
          return res.status(500).json({
            error: 'Database error'
          });
        }
        delete result.ops[0].project;
        res.status(200).json(
          result.ops[0]
        );
      })
    })

    .put(function (req, res) {
      let project = req.params.project;
      const {
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open
      } = req.body;
      if (!_id) {
        return res.status(200).json({
          error: 'missing _id'
        });
      }
      if (!ObjectID.isValid(_id)) {
        return res.status(200).json({
          error: "could not update",
          _id
        });
      }
      const updateFields = {};
      issue_title ? updateFields.issue_title = issue_title : null;
      issue_text ? updateFields.issue_text = issue_text : null;
      created_by ? updateFields.created_by = created_by : null;
      assigned_to ? updateFields.assigned_to = assigned_to : null;
      status_text ? updateFields.status_text = status_text : null;
      open !== undefined ? updateFields.open = open : null;

      if (Object.keys(updateFields).length === 0) {
        return res.status(200).json({
          error: 'no update field(s) sent',
          _id
        });
      }
      updateFields.updated_on = new Date();
      myDataBase.updateOne({
          _id: new ObjectID(_id),
          project: project
        }, {
          $set: updateFields
        },
        (err, result) => {
          if (err) {
            return res.status(200).json({
              error: "could not update",
              _id
            });
          }
          res.status(200).json({
            result: 'successfully updated',
            _id: _id,
          });
        }
      );

    })

    .delete(function (req, res) {
      let project = req.params.project;
      const {
        _id
      } = req.body;
      if (!_id) {
        return res.status(200).json({
          error: 'missing _id'
        });
      }
      if (!ObjectID.isValid(_id)) {
        return res.status(200).json({
          error: 'could not delete',
          _id: _id
        });
      }
      myDataBase.deleteOne({
          _id: ObjectID(_id),
          project: project
        },
        (err, result) => {
          if (err) {
            return res.status(200).json({
              error: 'could not delete',
              _id: _id
            });
          }
          res.status(200).json({
            result: 'successfully deleted',
            _id
          });
        }
      );
    });

};