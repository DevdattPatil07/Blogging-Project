const express = require("express");
require("dotenv").config();
const clc = require("cli-color");
const session = require("express-session");
const MongoDBSession = require("connect-mongodb-session")(session);

const app = express();
const PORT = process.env.PORT || 8000;

//file import
const db = require("./db"); //database connection
const { cleanUpBin } = require("./cron");
const AuthRouter = require("./Controllers/Auth");
const BlogsRouter = require("./Controllers/Blogs");
const FollowRouter = require("./Controllers/Follow");
const isAuth = require("./Middlewares/isAuth");

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const store = new MongoDBSession({
    uri: process.env.MONGODB_URL,
    collection: "session",
});
app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);

//routes
app.get("/", (req, res) => {
    res.send("Welcome to blog app");
});

//routing
app.use("/auth", AuthRouter);
app.use("/blog", isAuth, BlogsRouter);
app.use("/follow", isAuth, FollowRouter);

app.listen(PORT, () => {
    console.log(clc.underline(`App is running at`));
    console.log(clc.yellow(`http://localhost:${PORT}`));
    // cleanUpBin();
});
