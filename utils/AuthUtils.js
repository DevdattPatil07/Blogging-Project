const validator = require("validator");

function authCleanUpAndValidate({
    email,
    username,
    name,
    password,
    phoneNumber,
}) {
    return new Promise((resolve, reject) => {
        if (!password || !email || !username) {
            return reject("Missing credentials");
        }
        if (typeof email !== "string") {
            return reject("Email is not string");
        }
        if (!validator.isEmail(email)) {
            return reject("Invalid email format");
        }

        if (typeof username !== "string") {
            return reject("Username is not string");
        }
        if (typeof password !== "string") {
            return reject("Password is not string");
        }
        if (username.length < 3 || username.length > 30) {
            return reject(
                "The length of username should be between 3-30 characters"
            );
        }

        if (password && !validator.isAlphanumeric(password, "en-US")) {
            return reject("Password should contain alphabet and numbers");
        }

        if (phoneNumber && phoneNumber.length < 10) {
            return reject("Please enter valid phone number");
        }

        if (name && (name.length < 3 || name.length > 30)) {
            return reject(
                "The length of name should be between 3-30 characters"
            );
        }

        // console.log("AuthUtils", email, password, phoneNumber);
        return resolve();
    });
}

module.exports = authCleanUpAndValidate;
