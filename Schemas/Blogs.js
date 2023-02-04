const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    textBody: {
        type: String,
        required: true,
    },
    creationDatetime: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
    },
    deleted: {
        type: Boolean,
        required: false,
    },
    deletionDatetime: {
        type: String,
        required: false,
    },
});

module.exports = mongoose.model("Blogs", blogSchema);
