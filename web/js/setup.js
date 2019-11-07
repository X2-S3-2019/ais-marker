/*
    setup.js

    File description: Contains functions related to managing courses, presentations and students through 
    courses.html, presentations.html and students.html
*/

$(document).ready(function () {

    let sPath = window.location.pathname;
    let sPage = sPath.substring(sPath.lastIndexOf('/') + 1);

    if (sPage == "courses.html") {
        console.log('In Courses page..');
        initializeCoursesPage();
    }
    else if (sPage == "students.html") {
        console.log('In Students page..');
        initializeStudentsPage();
    } else if (sPage == "presentations.html") {
        console.log('In Presentations page..');
        initializePresentationsPage();
    }

});

function initializePresentationsPage() {
    // Set default value of date to today's
    var today = new Date();
    var dd = ("0" + (today.getDate())).slice(-2);
    var mm = ("0" + (today.getMonth() + 1)).slice(-2);
    var yyyy = today.getFullYear();
    today = yyyy + '-' + mm + '-' + dd;
    $("#datePresentation").attr("value", today);

    populateCoursesDropdown();
    displayAllPresentations();

    $('#btnAddPresentation').click(function () {
        addPresentation();
    });

    // When a course is selected from the dropdown
    $('#ddlCourses').change(function () {
        let selectedValue = $('#ddlCourses').find(':selected').val();
        console.log('Dropdown changed..');
        console.log('Selected value: ' + selectedValue);

        displayAllPresentations(selectedValue);
    });

}

function initializeCoursesPage() {
    displayAllCourses();

    $('#btnAddCourse').click(function () {
        addCourse();
    });

}

function initializeStudentsPage() {
    displayAllStudents();

    $('#btnAddStudent').click(function () {
        addStudent();
    });

}

function displayAllCourses() {
    $('#tblCourses tbody').empty()

    courses = eel.getCourses()(function (courses) {
        courses.forEach(function (row) {
            $('#tblCourses tbody').append(
                '<tr>' +
                '<th scope="row">' + row[1] + '</th>' +
                '<td>' + row[2] + '</td>' +
                '<td style="text-align: center"> <button class="link btn btn-danger"> <i class="fa fa-trash"></i> </button>' +
                ' <button class="link btn btn-primary"> <i class="fa fa-edit"></i> </button></td>' +
                '</tr');
        });
    });
}

function displayAllStudents() {
    $('#tblStudents tbody').empty()

    students = eel.getStudents()(function (students) {
        students.forEach(function (row) {
            $('#tblStudents tbody').append(
                '<tr>' +
                '<th scope="row">' + row[0] + '</th>' +
                '<td>' + row[1] + '</td>' +
                '<td style="text-align: center"> <button class="link btn btn-danger"> <i class="fa fa-trash"></i> </button>' +
                ' <button class="link btn btn-primary"> <i class="fa fa-edit"></i> </button></td>' +
                '</tr');
        });
    });
}

function displayAllPresentations(filter = 'None') {
    $('#tblPresentations tbody').empty()

    if (filter == 'None') {   // Display ALL presentations
        eel.getPresentations()(function (presentations) {
            presentations.forEach(function (row) {
                $('#tblPresentations tbody').append(
                    '<tr>' +
                    '<th scope="row">' + row[2] + '</th>' +
                    '<td>' + row[3] + '</td>' +
                    '<td style="text-align: center"> <button class="link btn btn-danger"> <i class="fa fa-trash"></i> </button>' +
                    ' <button class="link btn btn-primary"> <i class="fa fa-edit"></i> </button></td>' +
                    '</tr');
            });
        });
    } else {   // filter is the course_id
        eel.getAllPresentationsOfCourse(filter)(function (presentations) {
            presentations.forEach(function (row) {
                $('#tblPresentations tbody').append(
                    '<tr>' +
                    '<th scope="row">' + row[2] + '</th>' +
                    '<td>' + row[3] + '</td>' +
                    '<td style="text-align: center"> <button class="link btn btn-danger"> <i class="fa fa-trash"></i> </button>' +
                    ' <button class="link btn btn-primary"> <i class="fa fa-edit"></i> </button></td>' +
                    '</tr');
            });
        });
    }

}

function populateCoursesDropdown() {
    console.log('Populating courses dropdown');

    eel.getCourses()(function (courses) {
        $('#ddlCourses').append('<option value="None">Select a course..</option>');
        courses.forEach(function (row) {
            $('#ddlCourses').append('<option value="' + row[0] + '">' + row[1] + '(' + row[2] + ')</option>');
        });
    });
}

function addCourse() {

    let course_code, course_name;

    $('input').removeClass('is-invalid');
    course_code = $('#txtCourseCode').val();
    course_name = $('#txtCourseName').val();

    console.log("Clicked Add Course button");

    valid = true;
    if (course_code.length == 0) {
        $('#txtCourseCode').addClass('is-invalid')
        valid = false;
    }
    if (course_name.length == 0) {
        $('#txtCourseName').addClass('is-invalid')
        valid = false;
    }
    if (!valid) {
        return false;
    } else {
        console.log('Adding ' + course_code + 'with name ' + course_name);
        eel.addCourse(course_code, course_name);
        this.displayAllCourses();
        // Clear input fields
        $('#txtCourseCode').val('');
        $('#txtCourseName').val('');
    }
}

function addStudent() {
    let student_id, student_name;

    $('input').removeClass('is-invalid');
    student_id = $('#txtStudentID').val();
    student_name = $('#txtStudentName').val();

    console.log("Clicked Add Student button");

    valid = true;
    if (student_id.length == 0) {
        $('#txtStudentID').addClass('is-invalid')
        valid = false;
    }
    if (student_name.length == 0) {
        $('#txtStudentName').addClass('is-invalid')
        valid = false;
    }
    if (!valid) {
        return false;
    } else {
        console.log('Adding ' + student_id + 'with name ' + student_name);
        eel.addStudent(student_id, student_name);
        this.displayAllStudents();
        // Clear input fields
        $('#txtStudentID').val('');
        $('#txtStudentName').val('');
    }
}

function addPresentation() {
    let presentation_date, presentation_name;

    $('input').removeClass('is-invalid');
    course_id = $('#ddlCourses').find(":selected").val();
    presentation_date = $('#datePresentation').val();
    presentation_name = $('#txtPresentationName').val();

    console.log("Clicked Add Presentation button");

    valid = true;
    if (presentation_date.length == 0) {
        $('#datePresentation').addClass('is-invalid')
        valid = false;
    }
    if (presentation_name.length == 0) {
        $('#txtPresentationName').addClass('is-invalid')
        valid = false;
    }
    if (course_id == 'None') {
        $('#ddlCourses').addClass('is-invalid')
        valid = false;
    }

    if (!valid) {
        return false;
    } else {
        console.log('Adding ' + presentation_name);
        eel.addPresentation(course_id, presentation_name, presentation_date);
        this.displayAllPresentations(course_id);
        // Clear input fields
        $('#datePresentation').val('');
        $('#txtPresentationName').val('');
    }
}