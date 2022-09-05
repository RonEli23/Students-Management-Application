const mongoose = require('mongoose');

const log_schema = new mongoose.Schema({
        method: {
                type: String,
                enum: {
                        values: ["GET", "POST"],
                        message: '{VALUE} is not supported'
                }
        },
        when: {
                type: Date,
                default: Date.now()
        },
        path: {
                type: String,
        },
        runmode: {
                type: String,
                enum: {
                        values: ["HTML", "JSON"],
                        message: '{VALUE} is not supported'
                }
        }
});

const logs = global.conn2.model('log', log_schema);
module.exports = logs;