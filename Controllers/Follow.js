const express = require("express");
const {
    followUser,
    followingUserList,
    followersUserList,
    unfollowUser,
} = require("../Models/Follow");
const FollowRouter = express.Router();
const User = require("../Models/User");

FollowRouter.post("/follow-user", async (req, res) => {
    const followerUserId = req.session.user.userId;
    const followingUserId = req.body.followingUserId;
    // console.log(followerUserId, followingUserId);

    //verify follower and follwing userId
    if (followerUserId.equals(followingUserId)) {
        return res.send({
            status: 400,
            message: "Same follower and following Id",
        });
    }
    try {
        await User.verifyUserId({ userId: followerUserId });
    } catch (err) {
        return res.send({
            status: 400,
            message: "Invalid Follower userId",
            error: err,
        });
    }

    try {
        await User.verifyUserId({ userId: followingUserId });
    } catch (err) {
        return res.send({
            status: 400,
            message: "Invalid Following userId",
            error: err,
        });
    }

    //create a follow request
    try {
        const followDb = await followUser({ followerUserId, followingUserId });
        // console.log(followDb);
        return res.send({
            status: 200,
            message: "Followed successfully",
            data: followDb,
        });
    } catch (err) {
        return res.send({
            status: 400,
            message: "Request invalid",
            error: err,
        });
    }
});

FollowRouter.post("/following-list", async (req, res) => {
    const followerUserId = req.session.user.userId;
    const offset = req.query.offset || 0;
    try {
        await User.verifyUserId({ userId: followerUserId });
    } catch (err) {
        return res.send({
            status: 400,
            message: "Invalid Follower userId",
            error: err,
        });
    }
    try {
        const follow = await followingUserList({ followerUserId, offset });
        return res.send({
            status: 200,
            message: "Following List",
            data: follow,
        });
    } catch (error) {}
});

FollowRouter.post("/followers-list", async (req, res) => {
    const followingUserId = req.session.user.userId;
    const offset = req.query.offset || 0;
    try {
        await User.verifyUserId({ userId: followingUserId });
    } catch (err) {
        return res.send({
            status: 400,
            message: "Invalid Following userId",
            error: err,
        });
    }
    try {
        const follow = await followersUserList({ followingUserId, offset });
        return res.send({
            status: 200,
            message: "Following List",
            data: follow,
        });
    } catch (error) {}
});

FollowRouter.post("/unfollow-user", async (req, res) => {
    const followerUserId = req.session.user.userId;
    const followingUserId = req.body.followingUserId;

    if (followerUserId.equals(followingUserId)) {
        return res.send({
            status: 400,
            message: "Same follower and following Id",
        });
    }
    try {
        await User.verifyUserId({ userId: followerUserId });
    } catch (err) {
        return res.send({
            status: 400,
            message: "Invalid Follower userId",
            error: err,
        });
    }

    try {
        await User.verifyUserId({ userId: followingUserId });
    } catch (err) {
        return res.send({
            status: 400,
            message: "Invalid Following userId",
            error: err,
        });
    }

    try {
        const unfollowDb = await unfollowUser({
            followerUserId,
            followingUserId,
        });
        // console.log(unfollowDb);
        return res.send({
            status: 200,
            message: "Unollowed successfully",
            data: unfollowDb,
        });
    } catch (err) {
        return res.send({
            status: 400,
            message: "Request invalid",
            error: err,
        });
    }
});

module.exports = FollowRouter;
