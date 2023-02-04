const followSchema = require("../Schemas/Follow");
const ObjectId = require("mongodb").ObjectId;
const userSchema = require("../Schemas/User");
const constants = require("../constants");

function followUser({ followerUserId, followingUserId }) {
    return new Promise(async (resolve, reject) => {
        try {
            //check if they follow prevously
            const followObj = await followSchema.findOne({
                followingUserId,
                followerUserId,
            });
            // console.log(followObj);
            if (followObj) {
                return reject("Already Follwed");
            }

            const follow = new followSchema({
                followerUserId,
                followingUserId,
                creationDatetime: new Date(),
            });
            try {
                const followDb = follow.save();
                return resolve(followDb);
            } catch (err) {
                return reject(err);
            }
        } catch (err) {
            return reject(err);
        }
    });
}

function followingUserList({ followerUserId, offset }) {
    return new Promise(async (resolve, reject) => {
        try {
            const followDb = await followSchema.aggregate([
                { $match: { followerUserId: String(followerUserId) } },
                { $sort: { creationDatetime: -1 } },
                {
                    $facet: {
                        data: [
                            { $skip: parseInt(offset) },
                            { $limit: constants.BLOGSLIMIT },
                        ],
                    },
                },
            ]);

            // .find({ followerUserId });

            console.log(followDb[0].data);
            let followingUserIds = followDb[0].data.map((followObj) => {
                return ObjectId(followObj.followingUserId);
            });

            const followingUserDetails = await userSchema.aggregate([
                {
                    $match: {
                        _id: { $in: followingUserIds },
                    },
                },
            ]);
            return resolve(followingUserDetails);
        } catch (err) {
            return reject(err);
        }
    });
}

function followersUserList({ followingUserId, offset }) {
    return new Promise(async (resolve, reject) => {
        try {
            const followDb = await followSchema.aggregate([
                { $match: { followingUserId: String(followingUserId) } },
                { $sort: { creationDatetime: -1 } },
                {
                    $facet: {
                        data: [
                            { $skip: parseInt(offset) },
                            { $limit: constants.BLOGSLIMIT },
                        ],
                    },
                },
            ]);

            // .find({ followingUserId });

            console.log(followDb[0].data);
            let followerUserIds = followDb[0].data.map((followObj) => {
                return ObjectId(followObj.followerUserId);
            });

            const followersUserDetails = await userSchema.aggregate([
                {
                    $match: {
                        _id: { $in: followerUserIds },
                    },
                },
            ]);
            return resolve(followersUserDetails);
        } catch (err) {
            return reject(err);
        }
    });
}

function unfollowUser({ followerUserId, followingUserId }) {
    return new Promise(async (resolve, reject) => {
        try {
            //check if they follow prevously
            const unfollowObj = await followSchema.findOne({
                followingUserId,
                followerUserId,
            });

            if (!unfollowObj) {
                return reject("You dont follow this user/ Already unfollwed");
            }

            try {
                const unfollow = await followSchema.findOneAndDelete({
                    _id: ObjectId(unfollowObj.id),
                });
                return resolve(unfollow);
            } catch (err) {
                return reject(err);
            }
        } catch (err) {
            return reject(err);
        }
    });
}

module.exports = {
    followUser,
    followingUserList,
    followersUserList,
    unfollowUser,
};
