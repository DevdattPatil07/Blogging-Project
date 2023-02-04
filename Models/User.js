const userSchema = require("../Schemas/User");
const validator = require("validator");
const bcrypt = require("bcrypt");
const ObjectId = require("mongodb").ObjectId;

const User = class {
    username;
    email;
    name;
    password;
    phoneNumber;

    constructor({ username, email, name, password, phoneNumber }) {
        this.email = email;
        this.name = name;
        this.username = username;
        this.phoneNumber = phoneNumber;
        this.password = password;
    }

    static verifyUsernameAndEmailExists({ username, email }) {
        return new Promise(async (resolve, reject) => {
            try {
                // console.log(username, email);
                const userDb = await userSchema.findOne({
                    $or: [{ username }, { email }],
                });

                if (userDb && userDb.email === email) {
                    return reject("Email already exists");
                }
                if (userDb && userDb.username === username) {
                    return reject("Username already taken");
                }
                return resolve();
            } catch (err) {
                return reject(err);
            }
        });
    }

    registerUser() {
        return new Promise(async (resolve, reject) => {
            const hashedPassword = await bcrypt.hash(
                this.password,
                parseInt(process.env.SALT)
            );

            const user = userSchema({
                username: this.username,
                email: this.email,
                name: this.name,
                password: hashedPassword,
                phoneNumber: this.phoneNumber,
            });
            try {
                const userDb = await user.save();
                return resolve(userDb);
            } catch (err) {
                return reject(err);
            }
        });
    }

    static loginUser({ loginId, password }) {
        return new Promise(async (resolve, reject) => {
            let userDb = {};
            if (validator.isEmail(loginId)) {
                userDb = await userSchema.findOne({ email: loginId });
            } else {
                userDb = await userSchema.findOne({ username: loginId });
            }

            if (!userDb) {
                return reject("No user found");
            }

            //match password
            const isMatch = await bcrypt.compare(password, userDb.password);

            if (!isMatch) {
                return reject("Password did not match");
            }

            return resolve(userDb);
        });
    }

    static verifyUserId({ userId }) {
        // console.log(userId);
        return new Promise(async (resolve, reject) => {
            try {
                if (!ObjectId.isValid(userId)) {
                    return reject("Invalid UserId");
                }

                const userDb = await userSchema.findOne({
                    _id: ObjectId(userId),
                });
                if (!userDb) {
                    return reject("No user found");
                }

                return resolve(userDb);
            } catch (err) {
                return reject(err);
            }
        });
    }
};

module.exports = User;
