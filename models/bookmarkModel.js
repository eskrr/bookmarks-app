const mongoose = require( 'mongoose' );

const bookmarksSchema = mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    rating : {
        type : Number,
        required : true
    }
});

const bookmarksCollection = mongoose.model('bookmarks', bookmarksSchema);

const Bookmarks = {
    createBookmark: function(newBookmark) {
        return bookmarksCollection
                .create(newBookmark)
                .then(createdBookmark => {
                    return createdBookmark;
                })
                .catch(err => {
                    throw new Error(err);
                });
    },
    findBookmarks: function(title) {
        return bookmarksCollection
                .find({title: title})
                .then(foundBookmarks => {
                    return foundBookmarks;
                })
                .catch(err => {
                    throw new Error(err);
                })
    },
    getAllBookmarks: function() {
        return bookmarksCollection
                .find()
                .then(allBookmarks => {
                    return allBookmarks;
                })
                .catch(err => {
                    return err;
                });
    },
    deleteBookmark: function(id) {
        return bookmarksCollection
                .deleteOne({id: id})
                .then(result => {
                    return result;
                })
                .catch(err => {
                    throw new Error(err);
                });
    },
    updateBookmark: function(id, params) {
        return bookmarksCollection
                .updateOne({id: id}, params)
                .then(updatedBookmark => {
                    return updatedBookmark;
                })
                .catch(err => {
                    throw new Error(err);
                });
    }
}

module.exports = { Bookmarks };
