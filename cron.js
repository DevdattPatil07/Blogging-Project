const cron = require("node-cron");
const ObjectId = require("mongodb").ObjectId;
const blogSchema = require("./Schemas/Blogs");

function cleanUpBin() {
    cron.schedule(
        "* * * * *",
        async () => {
            //get all blogs with deleted true
            const blogsDb = await blogSchema.aggregate([
                { $match: { deleted: true } },
            ]);

            //check if 30 days old
            blogsDb.map(async (blog) => {
                const deletionDatetime = new Date(
                    blog.deletionDatetime
                ).getTime();
                const currDateTime = Date.now();

                const diff =
                    (currDateTime - deletionDatetime) / (1000 * 60 * 60 * 24);
                console.log(diff);

                if (diff >= 30) {
                    await blogSchema.findOneAndDelete({
                        _id: ObjectId(blog._id),
                    });
                    console.log(`Deleted blog:${blog._id}`);
                }
            });

            console.log(blogsDb);
        },
        {
            scheduled: true,
            timezone: "Asia/kolkata",
        }
    );
}

module.exports = { cleanUpBin };
