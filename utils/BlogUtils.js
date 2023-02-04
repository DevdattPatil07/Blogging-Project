function blogCleanUpAndValidate({ title, textBody, userId }) {
    return new Promise(async (resolve, reject) => {
        if (!userId) {
            return reject("Invalid UserId");
        }
        if (
            !title ||
            !textBody ||
            typeof title !== "string" ||
            typeof textBody !== "string"
        ) {
            return reject("Invalid Data");
        }

        if (title.length > 50) {
            return reject("Blog title too long. (Limit-50 alphabets)");
        }

        if (textBody.length > 1000) {
            return reject("Blog title too long. (Limit-1000 alphabets)");
        }
        //verify userId reject if not present

        return resolve();
    });
}

module.exports = blogCleanUpAndValidate;
