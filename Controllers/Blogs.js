const express = require("express");
const Blogs = require("../Models/Blogs");
const blogCleanUpAndValidate = require("../utils/BlogUtils");
const BlogsRouter = express.Router();
const User = require("../Models/User");
const Follow = require("../Models/Follow");
const ObjectId = require("mongodb").ObjectId;

BlogsRouter.post("/create-blog", async (req, res) => {
    const title = req.body.title;
    const textBody = req.body.textBody;
    const userId = req.session.user.userId;
    const creationDatetime = new Date();

    // console.log(req.session.user);

    await blogCleanUpAndValidate({ title, textBody, userId })
        .then(async () => {
            try {
                await User.verifyUserId({ userId });
            } catch (err) {
                return reject(err);
            }

            const blog = new Blogs({
                title,
                textBody,
                userId,
                creationDatetime,
            });
            // console.log("here");
            try {
                const blogDb = await blog.createBlog();
                return res.send({
                    status: 2001,
                    message: "Blog created successfully",
                    data: blogDb,
                });
            } catch (err) {
                return res.send({
                    status: 400,
                    message: "Error occured",
                    error: err,
                });
            }
        })
        .catch((err) => {
            console.log(err);
            return res.send({
                status: 401,
                message: "Error occured",
                error: err,
            });
        });
});

BlogsRouter.post("/get-blogs", async (req, res) => {
    const offset = req.query.offset || 0;
    console.log(offset, typeof offset);
    const userId = req.session.user.userId;
    //read blogs from db
    try {
        const followingUserList = await Follow.followingUserList({
            followerUserId: ObjectId(userId),
            offset,
        });
        // console.log(followingUserList);

        let userIds = followingUserList.map((user) => {
            return user._id;
        });
        console.log("72", userIds);

        const blogs = await Blogs.getBlogs({ offset, userIds });
        return res.send({
            status: 200,
            message: "Read successful",
            data: blogs,
        });
    } catch (err) {
        console.log(err);
        return res.send({
            status: 400,
            message: "Read unsuccessful",
            error: err,
        });
    }
});

BlogsRouter.post("/my-blogs", async (req, res) => {
    const userId = req.session.user.userId;
    const offset = req.query.offset || 0;
    //read blogs from db
    try {
        const blogs = await Blogs.myBlogs({ userId, offset });

        return res.send({
            status: 200,
            message: "Read successful",
            data: blogs,
        });
    } catch (err) {
        return res.send({
            status: 401,
            message: "Read unsuccessful",
            error: err,
        });
    }
});

BlogsRouter.post("/edit-blog", async (req, res) => {
    const { title, textBody } = req.body.data;
    const blogId = req.body.blogId;
    const userId = req.session.user.userId;

    //data checking
    if (!title && !textBody) {
        return res.send({
            status: 400,
            message: "Invalid data format",
            error: err,
        });
    }
    try {
        //get the blog with blogId
        // const blog = new Blogs({ blogId, title, textBody });
        const blogDb = await Blogs.getDataofBlogfromId({ blogId });

        //validate the blog owner with editor
        // if (blogDb.userId.toString() !== userId.toString()) {
        if (!blogDb.userId.equals(userId)) {
            return res.send({
                status: 402,
                message: "Not allowed to edit",
                Error: "Blog belongs to other user",
            });
        }

        //put the check to allow only to edit within 30min
        const currDateTime = Date.now();
        const creationDatetime = new Date(blogDb.creationDatetime);
        // console.log(creationDatetime);

        const diff = (currDateTime - creationDatetime.getTime()) / (1000 * 60);
        // console.log(diff);

        if (diff > 3000) {
            return res.send({
                status: 405,
                message: "Edit unsuccessful",
                error: "Cannot edit after 30 mins of creation",
            });
        }

        //everything is fine update the blog
        try {
            const oldBlogDb = await Blogs.updateBlog({ title, textBody });
            return res.send({
                status: 200,
                message: "Updation Successful",
                data: oldBlogDb,
            });
        } catch (err) {
            console.log(err);
            return res.send({
                status: 401,
                message: "Updation failed",
                error: err,
            });
        }
    } catch (err) {
        console.log(err);
        return res.send({
            status: 400,
            message: "Updation failed",
            error: err,
        });
    }
});

BlogsRouter.post("/delete-blog", async (req, res) => {
    const blogId = req.body.blogId;
    const userId = req.session.user.userId;

    //verify the userId
    try {
        await User.verifyUserId({ userId });
    } catch (err) {
        return res.send({
            status: 401,
            message: "Error occured",
            error: err,
        });
    }

    try {
        await Blogs.verifyBlogId({ blogId });
    } catch (err) {
        // console.log(err);
        return res.send({
            status: 401,
            message: "Error occured",
            error: err,
        });
    }

    try {
        const blogDb = await Blogs.getDataofBlogfromId({ blogId });

        //validate the ownership
        if (!blogDb.userId.equals(userId)) {
            return res.send({
                status: 402,
                message: "Not allowed to Delete",
                Error: "Blog belongs to other user",
            });
        }

        //delete the blog
        const blogData = await Blogs.deleteBlog({ blogId });

        return res.send({
            status: 200,
            message: "Deletion Successful",
            data: blogData,
        });
    } catch (err) {
        return res.send({
            status: 401,
            message: "Deletion failed",
            error: err,
        });
    }
});

module.exports = BlogsRouter;
