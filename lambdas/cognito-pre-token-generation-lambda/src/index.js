const customClaims = require('./customClaims');
const crypto = require('crypto');

exports.handler = (event, context, callback) => {

    console.log("Pre Token");
    console.log("event = ", event);
    console.log("context = ", context);

    customClaims.add(event, crypto.randomUUID());

    console.log("updated event = ", JSON.stringify(event));

    callback(null, event);
};
