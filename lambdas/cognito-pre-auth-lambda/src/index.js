const db = require('./db');

const selectSpeakerByUsername = "SELECT * FROM speaker WHERE username = ?";
const userIsNotSpeakerErrorMessage = "User must be a speaker in order to be authenticated";

exports.handler = (event, context, callback) => {

    console.log("Pre Auth");
    console.log("event = ", event);
    console.log("context = ", context);

    const userStatus = event.request.userAttributes['cognito:user_status'];
    context.callbackWaitsForEmptyEventLoop = false;

    if (userStatus !== "CONFIRMED") {
        return callback(null, event);
    }

    const username = event.userName;

    db.connection();
    db.query(selectSpeakerByUsername, [username], (err, results) => {
        if (err) {
            return callback(err);
        }
        if(results.length === 0) {
            return callback(new Error(userIsNotSpeakerErrorMessage));
        }
        callback(null, event); 
    });
};
