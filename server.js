const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

const uri_academy = process.env.MONGODB_ACADEMY_LOCAL;
const uri_log = process.env.MONGODB_LOG_LOCAL;
const port = process.env.PORT || 8080;

global.conn1 = mongoose.createConnection(uri_academy); //connection for academy DB usage
global.conn2 = mongoose.createConnection(uri_log); //connection for academylog DB usage
const { student_router } = require('./routes/student');
const log_model = require('./models/log');


// Check the existed run mode
global.runmode = process.argv[2] == "[--json]" ? "JSON" : "HTML";

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(express.static('public'));

app.set('view engine', 'pug');

// The next function will document user's logging 
const my_log = async (req, res, next) => {
        const method = req.method;
        const path = req.path;
        const runmode = global.runmode;
        const log = new log_model({ method, path, runmode });
        await log.save(); // Fill the academylog DB
        next();
}

// my_log function will be relevent for every path
app.use(my_log);

// student_router mounts on '/student' path
app.use('/student', student_router);

app.use((req, res) => {
        if (global.runmode == "HTML") {
                //res.status(404).send('Illegal path');

                // insted of regular message (send("")) we concatenate render('404') to res.status(404)
                res.status(404).render('404');

        }
        // JSON mode
        else {
                res.status(404).json("FAILED");
                // res.status(404).json({ error: 'FAILED' });
        }
});

const connection = async () => {
        app.listen(port, () => console.log(`Listen on port ${port}`))
}
connection().catch(err => console.log(err.message));