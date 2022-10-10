const mysql = require('mysql2');

const db = {

    connection() {
        return mysql.createConnection({
            host: process.env.RDS_HOSTNAME,
            user: process.env.RDS_USERNAME,
            password: process.env.RDS_PASSWORD,
            port: process.env.RDS_PORT,
            database: process.env.RDS_DATABASE
        });
    },

    verifySpeakerUsername(connection, username) {
        connection.query("SELECT * FROM speakers WHERE username = ?", [username], (err, results, fields) => {
            if (err) {
                throw err;
            }
            if(results.length === 0) {
                throw new Error("Authentication failed");
            } 
        });
    }

};

module.exports = db;
