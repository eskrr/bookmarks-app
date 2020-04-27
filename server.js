const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const uuid = require('uuid');

const app = express();
const jsonParser = bodyParser.json();

var validator = require('./middleware/validateToken.js');

const fields = ['title', 'description', 'url', 'rating']; 

app.use(morgan('dev'));
app.use(validator);

let listOfBookmarks = [
    {
        id: uuid.v4(),
        title: 'Don Quijote de la Mancha',
        description:  'Aenean velit felis, lobortis a libero suscipit, ullamcorper tempor lacus. Donec pharetra libero et ante sollicitudin, nec tincidunt ipsum auctor. In tempor mauris ut lorem sagittis faucibus.',
        url: 'https://es.wikipedia.org/wiki/Don_Quijote_de_la_Mancha',
        rating: 5
    },
    {
        id: uuid.v4(),
        title: 'La Ilíada',
        description: 'Proin posuere iaculis sapien, a maximus odio semper vitae. Vestibulum condimentum urna ac dignissim fermentum.',
        url: 'https://es.wikipedia.org/wiki/Il%C3%ADada',
        rating: 4
    },
    {
        id: uuid.v4(),
        title: 'Hamlet',
        description: 'Praesent ut risus vitae augue egestas viverra. Duis volutpat rhoncus nunc nec ullamcorper. In ullamcorper tristique fringilla. Cras eget nisl vel metus dignissim pellentesque.',
        url: 'https://es.wikipedia.org/wiki/Hamlet',
        rating: 3
    },
];


// GET endpoint : http://localhost:8080/bookmarks

app.get('/bookmarks', (req, res) => {
    console.log('Getting all bookmarks.');
    return res.status(200).json(listOfBookmarks);
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

    let results = listOfBookmarks.filter(student => {
        if (student.title === title)
            return student;
    });

    if (results.length === 0) {
        errMsg = 'Given title does not match any bookmark in our records';
        console.log(errMsg);
        res.statusMessage = errMsg;
        return res.status(404).end();
    }

    return res.status(200).json(results);
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
    console.log('Bookmark creation successful');
    listOfBookmarks.push(bookmark);
    return res.status(201).json(bookmark);
});

// DELETE : http://localhost:8080/bookmarks/:id

app.delete('/bookmark/:id', (req, res) => {
    console.log('Deleting bookmark ...');
    console.log(req.params);

    let id = req.params.id;
    let bookmark_index = listOfBookmarks.findIndex(bookmark => bookmark.id === id);

    if (bookmark_index < 0) {
        errMsg = 'Bookmark was not found.';
        console.log(errMsg);
        res.statusMessage = errMsg;
        return res.status(404).end();
    }

    console.log('Deletion successful');
    listOfBookmarks.splice(bookmark_index, 1 );
    return res.status(200).end();
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

    let bookmark_index = listOfBookmarks.findIndex(bookmark => bookmark.id === id);

    if (bookmark_index < 0) {
        errMsg = 'Bookmark was not found.';
        console.log(errMsg);
        res.statusMessage = errMsg;
        return res.status(404).end();
    }

    fields.forEach(field => {
        if (req.body[field]) {
            if (field == 'rating' && typeof(req.body[field]) !== 'number') {
                errMsg = 'The rating MUST be a number.';
                console.log(errMsg);
                res.statusMessage = errMsg;
                return res.status(409).end();
            }
            listOfBookmarks[bookmark_index][field] = req.body[field];
        }
    });

    console.log('Update successful');
    return res.status(202).json(listOfBookmarks[bookmark_index]);
});

// Base URL : http://localhost:8080/

app.listen(8080, () => {
    console.log('This server is running on port 8080');
});


// Base URL : http://localhost:8080/
// GET endpoint : http://localhost:8080/bookmarks
// GET by id in query : http://localhost:8080/api/studentById?id=123
// GET by id in param : http://localhost:8080/api/getStudentById/123