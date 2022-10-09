exports.handler = (event, context, callback) => {

    console.log("Post Auth");
    console.log("event = ", event);
    console.log("context = ", context);

    callback(null, event);
};
