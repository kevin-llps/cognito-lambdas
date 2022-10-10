const index = require('../index');
const db = require('../db');
const fs = require('fs');

describe('Handler', () => {
    it('given event should run handler successfully', () => {
        const eventRequest = fs.readFileSync('eventRequest.json');
        const event = JSON.parse(eventRequest);
        const username = 'kevin.llps';
        
        const mockConnection = jest.fn();
        const connection = jest.spyOn(db, 'connection').mockImplementation(() => mockConnection);
        const verifySpeakerInDb = jest.spyOn(db, 'verifySpeakerUsername').mockImplementation(() => jest.fn());

        const callback = jest.fn(() => event);

        index.handler(event, null, callback);

        expect(callback).toBeCalledWith(null, event);
        expect(connection).toHaveBeenCalled();
        expect(verifySpeakerInDb).toBeCalledWith(mockConnection, username);
    });
});
