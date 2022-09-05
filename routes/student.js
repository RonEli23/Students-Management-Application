const express = require('express');
const student_model = require('../models/student');
const router = express.Router();

// GET - student         
router.get('/', async (req, res) => {
        try {
                // The next lines build the requested filter
                const { toar, city, avg } = req.query;
                const filter = {
                        $expr: { $and: [] }
                };

                if (toar && toar != "all") {
                        filter['$expr']["$and"].push({ "$eq": ["$toar", toar] });
                }

                if (city && city.trim() != '') {
                        filter['$expr']["$and"].push({ "$eq": ["$city", city] });
                }

                if (avg && avg.trim() != '') {
                        let avg_num = avg * 1;
                        filter['$expr']["$and"].push({
                                "$gte": [{ "$avg": "$courses.grade" }, avg_num]
                        });
                }
                let students = await student_model.find(filter).exec();
                let message = '';
                let flag = false; // This variable will determain whether the filter button was activated or not

                // Check if filter button was activated && no results were returned from the db
                if (Object.keys(req.query).length !== 0 && students.length === 0) {
                        message = "No results were received";
                }
                // Filter button was not activated
                else if (Object.keys(req.query).length === 0) {
                        // If the button wasn't activated (the user just entered the page) the page won't show message or empty table
                        flag = true;
                }

                if (global.runmode == "HTML") {
                        res.render('index', { message, flag, baseUrl: req.baseUrl, students, toar, city, avg });
                }
                // JSON mode
                else {
                        if (students.length === 0) {
                                res.json("No results were received");
                        }
                        else {
                                // Create an empty array of studentsId and than fill it with forEach loop (iterates over the students array which returned from the DB)
                                const studentsId = [];
                                students.forEach((student) => {
                                        studentsId.push(student._id);
                                });
                                res.json(studentsId);
                        }
                }
        }
        catch {
                if (global.runmode == "HTML") {
                        res.send("FAILED");
                }
                // JSON mode
                else {
                        res.json("FAILED");
                }
        }
});

// GET - student/add => ADD!         
router.get('/add', (req, res) => {
        res.render('addStudent');
});

// POST - student/add => ADD!         
router.post('/add', async (req, res) => {
        const { id, name, city, toar } = req.body;
        const student = new student_model(req.body);
        const error = student.validateSync();
        let flag = false; // This variable will determain whether one of the fields is empty
        if (!id || !name || !city || !toar) {
                flag = true;
        }

        if (error || flag) {
                if (global.runmode == "HTML") {
                        res.render('addStudent', { id, name, city, toar, text: "Failed to add student" });
                        return;
                }
                // JSON mode
                else {
                        res.json("FAILED");
                        return;
                }
        }

        try {
                await student.save();
                console.log('Successfully stored student');
                if (global.runmode == "HTML") {
                        res.render('addStudent', { id, name, city, toar, text: `${name} was added successfully` });
                }
                // JSON mode
                else {
                        res.json(student);
                }

        } catch {
                console.log("Error when try to add student");
                if (global.runmode == "HTML") {
                        res.sendStatus(404); // Not Found
                }
                // JSON mode
                else {
                        res.json("FAILED");
                }
        }
});

// GET - student/update/:id => UPDATE!         
router.get('/update/:id', async (req, res) => {
        try {
                const id = req.params.id; //mongo id
                //Finds a single document by its _id field and returned the requsted object.
                const student = await student_model.findById(id);
                if (student) {
                        res.render('updateStudent', { student, baseUrl: req.baseUrl });
                }
                else {
                        res.send("Could not find the requested student");
                }
        }
        catch {
                res.send("Could not find the requested student");
        }
});

// POST - student/update/:id => UPDATE!         
router.post('/update/:id', async (req, res) => {
        try {
                const id = req.params.id; //mongo id
                const { name, city, toar } = req.body;
                const opts = { runValidators: true, new: true }; //'new: true' - return the updated object (and not the old one)
                const result = await student_model.findOneAndUpdate(
                        { _id: id },
                        { $set: { name, city, toar } },
                        opts);

                if (result) {
                        console.log("Student was updated successfully");
                        if (global.runmode == "HTML") {
                                res.redirect(`${req.baseUrl}/update/${id}`);
                        }
                        // JSON mode
                        else {
                                res.json(result);
                        }
                }
                //If UPDATE action did not returned the updated object, something went wrong
                else {
                        console.log("Update action went wrong");
                        if (global.runmode == "HTML") {
                                res.send("Add course failed");
                        }
                        // JSON mode
                        else {
                                res.json("FAILED");
                        }
                }
        }
        catch {
                console.log("Update action went wrong");
                if (global.runmode == "HTML") {
                        res.send("Update failed");
                }
                // JSON mode
                else {
                        res.json("FAILED");
                }
        }
});

// POST - student/update/:id/addcourse => UPDATE!         
router.post('/update/:id/addcourse', async (req, res) => {
        try {
                const id = req.params.id; //mongo id
                const { cid, grade } = req.body;
                const opts = { runValidators: true, new: true };
                const result = await student_model.findOneAndUpdate(
                        { _id: id },
                        { $push: { courses: [{ cid, grade }] } },
                        opts);
                if (result) {
                        console.log("Course was added successfully");
                        if (global.runmode == "HTML") {
                                res.redirect(`${req.baseUrl}/update/${id}`)
                        }
                        // JSON mode
                        else {
                                res.json(result);
                        }
                }
                // If UPDATE action did not returned the updated object, something went wrong
                else {
                        console.log("Add course action went wrong");
                        if (global.runmode == "HTML") {
                                res.send("Add course failed");
                        }
                        // JSON mode
                        else {
                                res.json("FAILED");
                        }
                }
        }
        catch {
                console.log("Add course action went wrong");
                if (global.runmode == "HTML") {
                        res.send("Add course failed");
                }
                // JSON mode
                else {
                        res.json("FAILED");
                }
        }
});

// POST - student/delete/:id => DELETE!         
router.post('/delete/:id', async (req, res) => {
        try {
                const id = req.params.id; //mongo id
                const deleteResult = await student_model.deleteOne({ _id: id });
                if (deleteResult.deletedCount == 1) {
                        console.log("Deletion succeed");
                        if (global.runmode == "HTML") {
                                res.redirect(`${req.baseUrl}`);
                        }
                        // JSON mode
                        else {
                                res.json(deleteResult.deletedCount); // 1
                        }
                }
                else {
                        console.log("Deletion went wrong");
                        if (global.runmode == "HTML") {
                                res.send("Could not delete student");
                        }
                        // JSON mode
                        else {
                                res.json(deleteResult.deletedCount); // 0
                        }
                }
        }
        catch {
                console.log("Deletion went wrong");
                if (global.runmode == "HTML") {
                        res.send("Could not delete student");
                }
                // JSON mode
                else {
                        res.json(0); // 0
                        // res.json(deleteResult.deletedCount); // 0
                }
        }
});

// POST - student/deleteall => DELETE!         
router.post('/deleteall', async (req, res) => {
        try {
                await student_model.deleteMany();
                console.log("Deletion succeed");
                if (global.runmode == "HTML") {
                        res.redirect(`${req.baseUrl}`);
                }
                // JSON mode
                else {
                        res.json("OK");
                }
        }
        catch {
                console.log("Deletion went wrong");
                if (global.runmode == "HTML") {
                        res.send("Failed to delete all students");
                }
                // JSON mode
                else {
                        res.json("FAILED");
                }
        }
});

module.exports = { student_router: router };