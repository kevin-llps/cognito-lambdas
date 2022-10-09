const customClaims = require('../customClaims');
const fs = require('fs');

describe('CustomClaims', () => {
    it('given event and sessionId should add custom claim', () => {
        const event = {};
        const sessionId = "42c5669a-729c-4d41-8297-6da4ab106492";
        const eventResponse = fs.readFileSync('eventResponse.json');
        const expectedEventResponse = JSON.parse(eventResponse);
        
        customClaims.add(event, sessionId);

        expect(event).toEqual(expectedEventResponse);
    });
});