const blogSchema = require("../Schemas/Blogs");
const constants = require("../constants");
const ObjectId = require("mongodb").ObjectId;

const Blogs = class {
    title;
    textBody;
    userId;
    creationDatetime;
    blogId;

    constructor({ title, textBody, userId, creationDatetime, blogId }) {
        this.title = title;
        this.textBody = textBody;
        this.creationDatetime = creationDatetime;
        this.userId = userId;
        this.blogId = blogId;
    }

    createBlog() {
        return new Promise(async (resolve, reject) => {
            this.title.trim();
            this.textBody.trim();

            const blog = new blogSchema({
                title: this.title,
                textBody: this.textBody,
                userId: this.userId,
                creationDatetime: this.creationDatetime,
            });

            try {
                const blogDb = await blog.save();
                return resolve(blogDb);
            } catch (err) {
                return reject(err);
            }
        });
    }

    static getBlogs({ offset, userIds }) {
        return new Promise(async (resolve, reject) => {
            try {
                const blogsDb = await blogSchema.aggregate([
                    //sort,pagination
                    {
                        $match: {
                            userId: { $in: userIds },
                            deleted: { $ne: true },
                        },
                    },
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

                // console.log(blogsDb);
                return resolve(blogsDb[0].data);
            } catch (err) {
                return reject(err);
            }
        });
    }

    static myBlogs({ userId, offset }) {
        return new Promise(async (resolve, reject) => {
            try {
                const blogsDb = await blogSchema.aggregate([
                    //sort,pagination
                    {
                        $match: {
                            userId: ObjectId(userId),
                            deleted: { $ne: true },
                        },
                    },
                    { $sort: { creationDatetime: -1 } }, //desc -1 asnd 1
                    {
                        $facet: {
                            data: [
                                { $skip: parseInt(offset) },
                                { $limit: constants.BLOGSLIMIT },
                            ],
                        },
                    },
                ]);
                // console.log(blogsDb[0].data);
                return resolve(blogsDb[0].data);
            } catch (err) {
                return reject(err);
            }
        });
    }

    static getDataofBlogfromId({ blogId }) {
        this.blogId = blogId;

        return new Promise(async (resolve, reject) => {
            try {
                const blog = await blogSchema.findOne({
                    _id: ObjectId(this.blogId),
                });
                return resolve(blog);
            } catch (err) {
                return reject(err);
            }
        });
    }

    static updateBlog({ title, textBody }) {
        this.title = title;
        this.textBody = textBody;
        return new Promise(async (resolve, reject) => {
            try {
                let newBlogdata = {};
                if (this.title) {
                    newBlogdata.title = this.title;
                }
                if (this.textBody) {
                    newBlogdata.textBody = this.textBody;
                }

                const oldDbData = await blogSchema.findOneAndUpdate(
                    { _id: ObjectId(this.blogId) },
                    newBlogdata
                );

                return resolve(oldDbData);
            } catch (err) {
                return reject(err);
            }
        });
    }

    static verifyBlogId({ blogId }) {
        // console.log(blogId);
        return new Promise(async (resolve, reject) => {
            try {
                if (!ObjectId.isValid(blogId)) {
                    return reject("Invalid blogId");
                }

                const blogDb = await blogSchema.findOne({
                    _id: ObjectId(blogId),
                });
                if (!blogDb) {
                    return reject("No blog found");
                }

                return resolve(blogDb);
            } catch (err) {
                return reject(err);
            }
        });
    }

    static deleteBlog({ blogId }) {
        this.blogId = blogId;

        return new Promise(async (resolve, reject) => {
            try {
                // const blog = await blogSchema.findOneAndDelete({
                //     _id: ObjectId(this.blogId),
                // });

                const blog = await blogSchema.findOneAndUpdate(
                    { _id: ObjectId(this.blogId) },
                    { deleted: true, deletionDatetime: new Date() }
                );
                return resolve(blog);
            } catch (err) {
                return reject(err);
            }
        });
    }
};

module.exports = Blogs;
