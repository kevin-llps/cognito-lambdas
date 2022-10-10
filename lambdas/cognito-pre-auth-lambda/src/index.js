const db = require('./db');

exports.handler = (event, context, callback) => {

    console.log("Pre Auth");
    console.log("event = ", event);
    console.log("context = ", context);

    const username = event.userName;

    const connection = db.connection();
    db.verifySpeakerUsername(connection, username);

    callback(null, event);
};
