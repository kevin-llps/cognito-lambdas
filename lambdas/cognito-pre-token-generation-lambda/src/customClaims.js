const customClaims = {

    add(event, sessionId) {
        event.response = {
            "claimsOverrideDetails": {
                "claimsToAddOrOverride": {
                    "sessionId": sessionId
                }
            }
        };

    }

};

module.exports = customClaims;