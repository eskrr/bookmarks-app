const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const uuid = require('uuid');
const { Bookmarks } = require('./models/bookmarkModel');

const app = express();
const jsonParser = bodyParser.json();

var validator = require('./middleware/validateToken.js');

const fields = ['title', 'description', 'url', 'rating']; 

app.use(morgan('dev'));
app.use(validator);

// GET endpoint : http://localhost:8080/bookmarks
app.get('/bookmarks', (req, res) => {
    console.log('Getting all bookmarks.');
    Bookmarks
        .getAllBookmarks()
        .then(result => {
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = 'Something is wrong with the Database. Try again later.';
            return res.status( 500 ).end();
        })
});

// GET by title in query : http://localhost:8080/bookmark?title=123
app.get('/bookmark', (req, res) => {
    console.log('Getting bookmark by title.');
    console.log(req.query);

    let title = req.query.title;

    if (!title) {
        errMsg = 'Title not present in query parameters. E.g. /bookmark?title=<TITLE>';
        console.log(errMsg);
        res.statusMessage = errMsg;
        return res.status(406).end()
    }

    Bookmarks
        .findBookmarks(title)
        .then(result => {
           if (result.length === 0) {
                errMsg = 'Given title does not match any bookmark in our records';
                console.log(errMsg);
                res.statusMessage = errMsg;
                return res.status(404).end();
            }
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = 'Something is wrong with the Database. Try again later.';
        });
});

// POST : http://localhost:8080/bookmarks
app.post('/bookmarks', jsonParser, (req, res) => {
    console.log('Creating bookmark ...');
    console.log(req.body);

    let missing_fields = [];
    let bookmark = {};

    fields.forEach(field => {
        if (req.body[field])
            bookmark[field] = req.body[field];
        else
            missing_fields.push(field);
    });

    if (missing_fields.length > 0) {
        errMsg = `The following fields are missing: [${missing_fields.join(', ')}].`;
        console.log(errMsg);
        res.statusMessage = errMsg;
        return res.status(406).end();
    }

    if (typeof(bookmark.rating) !== 'number') {
        errMsg = 'The rating MUST be a number.';
        console.log(errMsg);
        res.statusMessage = errMsg;
        return res.status(409).end();
    }

    bookmark.id = uuid.v4();

    Bookmarks
        .createBookmark(bookmark)
        .then(result => {
            console.log('Bookmark creation successful');
            return res.status(201).json(result);
        })
        .catch(err => {
            res.statusMessage = 'Something is wrong with the Database. Try again later.';
            return res.status(500).end();
        })
});

// DELETE : http://localhost:8080/bookmarks/:id
app.delete('/bookmark/:id', (req, res) => {
    console.log('Deleting bookmark ...');
    console.log(req.params);

    let id = req.params.id;

    Bookmarks
        .deleteBookmark(id)
        .then(result => {
            console.log('Bookmark deletion successful');
            return res.status(200).json(result);
        })
        .catch(err => {
            res.statusMessage = 'Something is wrong with the Database. Try again later.';
            return res.status(500).end();
        })
});

// PATCH : http://localhost:8080/bookmarks/:id
app.patch('/bookmark/:id', jsonParser, (req, res) => {
    console.log('Updating bookmark ...');
    console.log(req.params)
    console.log(req.body);

    let id = req.params.id;
    let body_id = req.body.id;

    if (!body_id) {
        errMsg = 'Please set id of bookmark to delete in the request body.';
        console.log(errMsg);
        res.statusMessage = errMsg;
        return res.status(406).end();
    }

    if (id != body_id) {
        errMsg = 'Bookmark id mismatch between body and path parameter.';
        console.log(errMsg);
        res.statusMessage = errMsg;
        return res.status(409).end();
    }

    let params = {};
    fields.forEach(field => {
        if (req.body[field])
            params[field] = req.body[field];
    });

    if (typeof(params.rating) !== 'number') {
        errMsg = 'The rating MUST be a number.';
        console.log(errMsg);
        res.statusMessage = errMsg;
        return res.status(409).end();
    }

    Bookmarks
        .updateBookmark(id, params)
        .then(result => {
            console.log('Bookmark update successful');
            return res.status(202).json(result);
        })
        .catch(err => {
            res.statusMessage = 'Something is wrong with the Database. Try again later.';
            return res.status(500).end();
        })
});

// Base URL : http://localhost:8080/
app.listen(8080, () => {
    console.log('This server is running on port 8080');

    new Promise((resolve, reject) => {
        const settings = {
            useNewUrlParser: true, 
            useUnifiedTopology: true, 
            useCreateIndex: true
        };
        mongoose.connect('mongodb://localhost/bookmarksdb', settings, (err) => {
            if(err){
                return reject(err);
            }
            else{
                console.log('Database connected successfully.');
                return resolve();
            }
        })
    })
    .catch(err => {
        console.log(err);
    });
});
