const express = require("express");
const AuthRouter = express.Router();
const authCleanUpAndValidate = require("../utils/AuthUtils");
const User = require("../Models/User");
const isAuth = require("../Middlewares/isAuth");

AuthRouter.post("/register", (req, res) => {
    const { email, username, password, name, phoneNumber } = req.body;
    // console.log(req.body);
    authCleanUpAndValidate(req.body)
        .then(async () => {
            //validate if the user is already registered
            try {
                await User.verifyUsernameAndEmailExists({ username, email });
            } catch (err) {
                return res.send({
                    status: 401,
                    message: "Error occured",
                    error: err,
                });
            }

            //save the user in db
            const user = new User({
                username,
                email,
                name,
                password,
                phoneNumber,
            });

            try {
                const userDb = await user.registerUser();

                return res.send({
                    status: 200,
                    message: "Registration Successful",
                    data: userDb,
                });
            } catch (err) {
                return res.send({
                    status: 401,
                    message: "Error occured",
                    error: err,
                });
            }
        })
        .catch((err) => {
            return res.send({
                status: 400,
                message: "Invalid data",
                error: err,
            });
        });
});

AuthRouter.post("/login", async (req, res) => {
    const { loginId, password } = req.body;

    if (!loginId || !password) {
        return res.send({
            status: 400,
            message: "Missing credentials",
        });
    }
    try {
        const userDb = await User.loginUser({ loginId, password });

        req.session.isAuth = true;
        req.session.user = {
            userId: userDb._id,
            name: userDb.name,
            username: userDb.username,
            email: userDb.email,
        };

        return res.send({
            status: 200,
            message: "Login successful",
            data: userDb,
        });
    } catch (err) {
        return res.send({
            status: 400,
            message: "Error occured",
            error: err,
        });
    }
});

AuthRouter.post("/logout", isAuth, (req, res) => {
    const userData = req.session.user;
    req.session.destroy((err) => {
        if (err) {
            return res.send({
                status: 400,
                message: "Logout Unsuccessful",
                error: err,
            });
        }
        return res.send({
            status: 200,
            message: "Logout successful",
            data: userData,
        });
    });
});

module.exports = AuthRouter;
