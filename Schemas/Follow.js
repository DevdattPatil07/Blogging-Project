const mongoose = require("mongoose");

const followSchema = new mongoose.Schema({
    followingUserId: {
        type: String,
        required: true,
    },
    followerUserId: {
        type: String,
        required: true,
    },
    creationDatetime: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model("Follow", followSchema);
