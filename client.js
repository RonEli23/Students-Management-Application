const fs = require('fs');
const readline = require('readline');
const httpJSONRequest = require('./httpJSONRequest');
const internal_storage = {};
const port = process.env.PORT || 8080;
// We will receive the name of the file using argv[2] and pass it into the function processLineByLine()
const fileName = process.argv[2];

const processLineByLine = async (file_name) => {
        const rs = fs.createReadStream(file_name);
        // Note: we use the crlfDelay option to recognize all instances of CR LF
        // ('\r\n') in input.txt as a single line break.
        const rl = readline.createInterface({
                input: rs,
                crlfDelay: Infinity
        });
        for await (const raw_line of rl) {
                let line = raw_line.trim();
                if (!line || line.startsWith('//')) {
                        continue;
                }
                // Ok, we have a non-empty non-comment line, let's see what command it is.
                // We split the line into an array of string tokens (parts of the line).
                const params = line.split(/[ \t]+/);
                // The first token must be the command name
                switch (params[0]) {
                        // Handle adding a student
                        case 'add_student':
                                const [add_student, add_data, saveas, saveasname] = params;
                                // Check if add_data exist and if it's a JSON object
                                if (add_data && JSON.parse(add_data)) {
                                        const method = 'post';
                                        const url = `http://localhost:${port}/student/add`;

                                        // Activate the path that responsible to add a student
                                        // res - represent the server response
                                        const res = await httpJSONRequest(method, url, add_data);
                                        if (res == "FAILED") {
                                                console.log("***something went wrong");
                                        }
                                        // Save student inside the internal storage
                                        else if (saveas == "saveas" && saveasname) {
                                                internal_storage[saveasname] = res;
                                                console.log("student saved successfully");
                                        }
                                        // Saved only inside the db
                                        else {
                                                console.log("***student saved at the server\nBut internal storage wasn't updated due to missing command");
                                        }
                                        break;
                                }
                                else {
                                        // If the command did not contain student object 
                                        if (!add_data) {
                                                console.log("***no data was received");
                                        }
                                        // If the command did not contain a currect json object 
                                        else if (!JSON.parse(add_data)) {
                                                console.log("***wrong JSON object");
                                        }
                                        break;
                                }
                        case 'get_students':
                                const [get_students_command, JSON_filter, var1, var2] = params;

                                // Check if JSON_filter exist and if it's a JSON object
                                if (JSON_filter && JSON.parse(JSON_filter)) {
                                        const method = 'get';
                                        // The next lines construct the query that will be part of the url address
                                        let query = '';
                                        const get_data = JSON.parse(JSON_filter);
                                        Object.keys(get_data).forEach(key => {
                                                if (query) {
                                                        query += "&" + key + "=" + get_data[key];
                                                }
                                                else {
                                                        query += key + "=" + get_data[key];
                                                }
                                        });

                                        const url = `http://localhost:${port}/student?${query}`;
                                        const res = await httpJSONRequest(method, url);
                                        if (res == "FAILED") {
                                                console.log("***something went wrong");
                                                break;
                                        }
                                        else {
                                                // In this section the objects that were retreived by the server will compare to the client's objects list 
                                                if (var1 == "expected_saveas_names" && var2) {
                                                        // var2 in its regular shape (example) - ["st1","st2"]
                                                        // Becuase the variable var2 is a const variable we need to create a duplicate object in order to parse it to JS object
                                                        let var2Arr = var2; // Creating a duplicate object. 
                                                        var2Arr = JSON.parse(var2Arr); // Now we parse it to JS object
                                                        // Check if the the server's objects list has the same length as the client's list
                                                        if (res.length === var2Arr.length) {
                                                                for (let i = 0; i < res.length; i++) {
                                                                        // Check if every item in the server list has an equal item in the client list
                                                                        // The object details (of the client) retrieve from the internal_storage
                                                                        let result = res.find(item => item == internal_storage[var2Arr[i]]._id);
                                                                        if (result) {
                                                                                continue;
                                                                        }
                                                                        // If no object was found finish the loop
                                                                        break;
                                                                }
                                                                console.log("success");
                                                                console.log(res);
                                                        }
                                                        else {
                                                                console.log("***one of the ids found wrong");
                                                        }
                                                        break;
                                                }
                                                // In this section the number of objects that were retreived by the server will compare to the client expected number of docuemnts  
                                                else if (var1 === "expected_num_docuemnts" && !isNaN(var2)) {

                                                        // Check if the the server's objects list has the same length as the client's number (number of expected documents)
                                                        if (res.length == var2) {
                                                                console.log("success");
                                                                console.log(res);
                                                        }
                                                        else {
                                                                console.log("***wrong ids number was received");
                                                        }

                                                        break;
                                                }
                                                // Final option - empty object ({}) means that the client just interests in retrieving all documents
                                                else if (JSON_filter === "{}") {
                                                        console.log(res);
                                                }
                                                // None of the previous options were appered
                                                else {
                                                        console.log("***wrong command");
                                                }
                                        }
                                }
                                break;
                        case 'update_student':
                                const [update_command, name, JSON_student_data] = params;
                                if (name && internal_storage[name] && JSON_student_data && JSON.parse(JSON_student_data)) {
                                        const the_doc_id = internal_storage[name]._id; // Retrieve document _id from the internal storage
                                        const method = 'post';
                                        const url = `http://localhost:${port}/student/update/${the_doc_id}`;
                                        const res = await httpJSONRequest(method, url, JSON_student_data);
                                        if (res == "FAILED") {
                                                console.log("***something went wrong");
                                                break;
                                        }
                                        else {
                                                // Update the internal storage
                                                internal_storage[name] = res;
                                                console.log("student updated successfully");
                                                console.log(res);
                                        }
                                }
                                else {
                                        console.log("***one of the tokens is missing or wrong");
                                }
                                break;
                        case 'add_course':
                                const [add_course, studentName, JSON_course_data] = params;
                                if (studentName && internal_storage[studentName] && JSON_course_data && JSON.parse(JSON_course_data)) {
                                        const the_doc_id = internal_storage[studentName]._id; // Retrieve document _id from the internal storage
                                        const method = 'post';
                                        const url = `http://localhost:${port}/student/update/${the_doc_id}/addcourse/`;
                                        const res = await httpJSONRequest(method, url, JSON_course_data);
                                        if (res == "FAILED") {
                                                console.log("***something went wrong");
                                                break;
                                        }
                                        else {
                                                // Update the internal storage
                                                internal_storage[studentName] = res;
                                                console.log("course was added successfully");
                                                // Return the student object
                                                console.log(res);
                                        }
                                }
                                else {
                                        console.log("***one of the tokens is missing or wrong");
                                }
                                break;
                        case 'del_student':
                                const [del_student, stuName] = params;
                                if (stuName && internal_storage[stuName]) {
                                        const the_doc_id = internal_storage[stuName]._id; // Retrieve document _id from the internal storage
                                        const method = 'post';
                                        const url = `http://localhost:${port}/student/delete/${the_doc_id}`;
                                        const res = await httpJSONRequest(method, url);
                                        res === 1 ? console.log(res, "deletion succeed") : console.log(res, "***deletion failed");
                                }
                                else {
                                        console.log("***one of the tokens is missing or wrong");
                                }
                                break;
                        case 'del_all':
                                const [del_all] = params;
                                const method = 'post';
                                const url = `http://localhost:${port}/student/deleteall`;
                                const res = await httpJSONRequest(method, url);
                                console.log("deletion succeed");
                                console.log(res);
                                break;
                        default:
                                console.log("Unrecognized command (ignored):", line);
                }
        }
}

// For this app. to work, here you should call processLineByLine(..)
// and give it the name of the input file
processLineByLine(fileName);