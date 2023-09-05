import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";
import { connection, query } from "./db.js";

const selectSpeakerByUsername = "SELECT * FROM speaker WHERE username = ?";
const userIsNotSpeakerErrorMessage = "User must be a speaker in order to be authenticated";

const secretManagerClient = new SecretsManagerClient({ region: process.env.REGION });

export const handler = (event, context, callback) => {

    console.log("Pre Auth");
    console.log("event = ", event);
    console.log("context = ", context);

    const userStatus = event.request.userAttributes['cognito:user_status'];
    context.callbackWaitsForEmptyEventLoop = false;

    if (userStatus !== "CONFIRMED") {
        return callback(null, event);
    }

    const username = event.userName;

    const getSecretValueCommand = new GetSecretValueCommand({ SecretId: process.env.SECRET_NAME });

    secretManagerClient.send(getSecretValueCommand).then(secretResponse => {
        const dbSecret = JSON.parse(secretResponse.SecretString);

        connection(dbSecret);
        query(selectSpeakerByUsername, [username], (err, results) => {
            if (err) {
                return callback(err);
            }
            if(results.length === 0) {
                return callback(new Error(userIsNotSpeakerErrorMessage));
            }
            callback(null, event);
        });
    }, err => {
        console.log(err);
        return callback(err);
    });
};
