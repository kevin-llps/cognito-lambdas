const index = require('../index');
const db = require('../db');
const fs = require('fs');
const mockClient = require("aws-sdk-client-mock");
const secretManager = require('@aws-sdk/client-secrets-manager');
require("aws-sdk-client-mock-jest");

const mockedSecretManagerClient = mockClient.mockClient(secretManager.SecretsManagerClient);

process.env.SECRET_NAME = "secretName";

const eventRequest = fs.readFileSync('eventRequest.json');
const expectedSqlQuery = "SELECT * FROM speaker WHERE username = ?";
const params = ["kevin.llps"];
const results = [{ id: 1, username: 'kevin.llps' }];
const expectedErrorMessage = "User must be a speaker in order to be authenticated";
const secretResponse = { SecretString: {
    host: "host",
    user: "username",
    password:"password",
    port: "port",
    dbname: "dbname"
}};

describe('Handler', () => {
    beforeEach(() => {
        mockedSecretManagerClient.reset();
    });

    it('given event should run handler successfully', async () => {
        const event = JSON.parse(eventRequest);
        const context = { callbackWaitsForEmptyEventLoop : true };
        
        const connection = jest.spyOn(db, 'connection').mockImplementation((secret) => jest.fn());
        const query = jest.spyOn(db, 'query').mockImplementation((sqlQuery, params, processErrOrResults) => processErrOrResults(null, results));
        const callback = jest.fn((err, event) => event);

        mockedSecretManagerClient.on(secretManager.GetSecretValueCommand, {
            SecretId: process.env.SECRET_NAME
        }).resolves(secretResponse);

        await index.handler(event, context, callback);

        expect(context.callbackWaitsForEmptyEventLoop).toBeFalsy();
        expect(mockedSecretManagerClient).toHaveReceivedCommandTimes(secretManager.GetSecretValueCommand, 1);
        expect(connection).toBeCalledWith(secretResponse.SecretString);
        expect(query).toBeCalledWith(expectedSqlQuery, params, expect.any(Function));
        expect(callback).toBeCalledWith(null, event);
    });

    it('should pass error to lambda callback when sql query return error', async () => {
        const event = JSON.parse(eventRequest);
        const context = { callbackWaitsForEmptyEventLoop : true };
        const expectedError = new Error("Timeout");
        
        const connection = jest.spyOn(db, 'connection').mockImplementation((secret) => jest.fn());
        const query = jest.spyOn(db, 'query').mockImplementation((sqlQuery, params, processErrOrResults) => processErrOrResults(expectedError));
        const callback = jest.fn((err) => err);

        mockedSecretManagerClient.on(secretManager.GetSecretValueCommand, {
            SecretId: process.env.SECRET_NAME
        }).resolves(secretResponse);

        await index.handler(event, context, callback);

        expect(context.callbackWaitsForEmptyEventLoop).toBeFalsy();
        expect(mockedSecretManagerClient).toHaveReceivedCommandTimes(secretManager.GetSecretValueCommand, 1);
        expect(connection).toBeCalledWith(secretResponse.SecretString);
        expect(query).toBeCalledWith(expectedSqlQuery, params, expect.any(Function));
        expect(callback).toBeCalledWith(expectedError);
    });

    it('should pass error to lambda callback when user is not a speaker', async () => {        
        const event = JSON.parse(eventRequest);
        const context = { callbackWaitsForEmptyEventLoop : true };
        const expectedError = new Error(expectedErrorMessage);
        
        const connection = jest.spyOn(db, 'connection').mockImplementation((secret) => jest.fn());
        const query = jest.spyOn(db, 'query').mockImplementation((sqlQuery, params, processErrOrResults) => processErrOrResults(null, []));
        const callback = jest.fn((err) => err);

        mockedSecretManagerClient.on(secretManager.GetSecretValueCommand, {
            SecretId: process.env.SECRET_NAME
        }).resolves(secretResponse);

        await index.handler(event, context, callback);

        expect(context.callbackWaitsForEmptyEventLoop).toBeFalsy();
        expect(mockedSecretManagerClient).toHaveReceivedCommandTimes(secretManager.GetSecretValueCommand, 1);
        expect(connection).toBeCalledWith(secretResponse.SecretString);
        expect(query).toBeCalledWith(expectedSqlQuery, params, expect.any(Function));
        expect(callback).toBeCalledWith(expectedError);
    });

    it('should pass error to lambda callback when secret manager call fail', async () => {
        const event = JSON.parse(eventRequest);
        const context = { callbackWaitsForEmptyEventLoop : true };
        const expectedError = new Error("error");

        const connection = jest.spyOn(db, 'connection');
        const query = jest.spyOn(db, 'query');
        const callback = jest.fn((err) => err);

        mockedSecretManagerClient.on(secretManager.GetSecretValueCommand, {
            SecretId: process.env.SECRET_NAME
        }).rejects(expectedError);

        await index.handler(event, context, callback);

        expect(context.callbackWaitsForEmptyEventLoop).toBeFalsy();
        expect(mockedSecretManagerClient).toHaveReceivedCommandTimes(secretManager.GetSecretValueCommand, 1);
        expect(connection).not.toHaveBeenCalled();
        expect(query).not.toHaveBeenCalled();
        expect(callback).toBeCalledWith(expectedError);
    });

    it('given user not confirmed should not verify speaker', () => {
        const event = JSON.parse(eventRequest);
        event.request.userAttributes['cognito:user_status'] = "FORCE_CHANGE_PASSWORD";

        const context = { callbackWaitsForEmptyEventLoop : true };

        const connection = jest.spyOn(db, 'connection');
        const query = jest.spyOn(db, 'query');
        const callback = jest.fn((err, event) => event);

        index.handler(event, context, callback);

        expect(context.callbackWaitsForEmptyEventLoop).toBeFalsy();
        expect(mockedSecretManagerClient).not.toHaveReceivedCommand(secretManager.GetSecretValueCommand);
        expect(connection).not.toHaveBeenCalled();
        expect(query).not.toHaveBeenCalled();
        expect(callback).toBeCalledWith(null, event);
    });
});
