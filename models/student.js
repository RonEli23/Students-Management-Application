const mongoose = require('mongoose');

const take_course_schema = new mongoose.Schema({
        cid: {
                type: String,
                required: [true, 'Course Id should not be empty'],
                validate: {
                        validator: function (v) {
                                return (v.trim().length == 5)
                        },
                        message: "The id must contains 5 digits!"
                }
        },
        grade: {
                type: Number,
                required: [true, 'Grade should not be empty'],
                min: [0, "Grade can't be less than 0"],
                max: [100, "Grade can't be greater than 100"]
        }
});
const student_schema = new mongoose.Schema({
        id: {
                type: String,
                required: [true, 'Id should not be empty'],
                validate: {
                        validator: function (v) {
                                return (v.trim().length == 9)
                        },
                        message: "The id must contains 9 digits!"
                }
        },
        name: {
                type: String,
                required: [true, 'Name should not be empty'],
                validate: {
                        validator: function (v) {
                                return (v.trim() != '')
                        }
                }
        },
        city: {
                type: String,
                validate: {
                        validator: function (v) {
                                return (v.trim() != '')
                        }
                }
        },
        toar: {
                type: String,
                enum: {
                        values: ["ba", "ma", "phd"],
                        message: '{VALUE} is not supported'
                },
                required: [true, '"Toar" should not be empty']
        },
        courses: [take_course_schema]
});

const student = global.conn1.model('student', student_schema);
module.exports = student;