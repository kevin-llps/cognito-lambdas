const index = require('../index');
const db = require('../db');
const fs = require('fs');

const eventRequest = fs.readFileSync('eventRequest.json');
const expectedSqlQuery = "SELECT * FROM speaker WHERE username = ?";
const params = ["kevin.llps"];
const results = [{ id: 1, username: 'kevin.llps' }];
const expectedErrorMessage = "User must be a speaker in order to be authenticated";

describe('Handler', () => {
    it('given event should run handler successfully', () => {
        const event = JSON.parse(eventRequest);
        const context = { callbackWaitsForEmptyEventLoop : true };
        
        const connection = jest.spyOn(db, 'connection').mockImplementation(() => jest.fn());
        const query = jest.spyOn(db, 'query').mockImplementation((sqlQuery, params, processErrOrResults) => processErrOrResults(null, results));
        const callback = jest.fn((err, event) => event);

        index.handler(event, context, callback);

        expect(context.callbackWaitsForEmptyEventLoop).toBeFalsy();
        expect(connection).toHaveBeenCalled();
        expect(query).toBeCalledWith(expectedSqlQuery, params, expect.any(Function));
        expect(callback).toBeCalledWith(null, event);
    });

    it('should pass error to lambda callback when sql query return error', () => {
        const event = JSON.parse(eventRequest);
        const context = { callbackWaitsForEmptyEventLoop : true };
        const expectedError = new Error("Timeout");
        
        const connection = jest.spyOn(db, 'connection').mockImplementation(() => jest.fn());
        const query = jest.spyOn(db, 'query').mockImplementation((sqlQuery, params, processErrOrResults) => processErrOrResults(expectedError));
        const callback = jest.fn((err) => err);

        index.handler(event, context, callback);

        expect(context.callbackWaitsForEmptyEventLoop).toBeFalsy();
        expect(connection).toHaveBeenCalled();
        expect(query).toBeCalledWith(expectedSqlQuery, params, expect.any(Function));
        expect(callback).toBeCalledWith(expectedError);
    });

    it('should pass error to lambda callback when user is not a speaker', () => {
        const event = JSON.parse(eventRequest);
        const context = { callbackWaitsForEmptyEventLoop : true };
        const expectedError = new Error(expectedErrorMessage);
        
        const connection = jest.spyOn(db, 'connection').mockImplementation(() => jest.fn());
        const query = jest.spyOn(db, 'query').mockImplementation((sqlQuery, params, processErrOrResults) => processErrOrResults(null, []));
        const callback = jest.fn((err) => err);

        index.handler(event, context, callback);

        expect(context.callbackWaitsForEmptyEventLoop).toBeFalsy();
        expect(connection).toHaveBeenCalled();
        expect(query).toBeCalledWith(expectedSqlQuery, params, expect.any(Function));
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
        expect(connection).not.toHaveBeenCalled();
        expect(query).not.toHaveBeenCalled();
        expect(callback).toBeCalledWith(null, event);
    });
});
