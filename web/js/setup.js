/*
    setup.js

    File description: Contains functions related to managing courses, presentations and students through 
    courses.html, presentations.html and students.html
*/

var hasListeners = false;

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
            // row -> [0] = id, [1] = course_code, [2] = course_name
            addActionButtons('tblCourses', row[0], row[1], row[2]);
        });
    });

    if (!hasListeners) {
        addClickListeners('Course');
    }

}

function displayAllStudents() {
    $('#tblStudents tbody').empty()

    students = eel.getStudents()(function (students) {
        students.forEach(function (row) {
            // row -> [0] = student_id, [1] = student_name
            addActionButtons('tblStudents', row[0], row[0], row[1]);
        });
    });

    if (!hasListeners) {
        addClickListeners('Student');
    }

}

function displayAllPresentations(filter = 'None') {
    $('#tblPresentations tbody').empty()
    console.log('Displaying presentations');

    if (filter == 'None') {   // Display ALL presentations
        eel.getPresentations()(function (presentations) {
            console.log('Displaying ' + presentations.length + ' presentations');
            presentations.forEach(function (row) {
                console.log('Displaying id ' + row[0]);
                // row -> [0]=id, [1]=fk_course_id, [2]=date, [3]=name
                addActionButtons('tblPresentations', row[0], row[2], row[3]);
            });
        });
    } else {   // filter is the course_id
        eel.getAllPresentationsOfCourse(filter)(function (presentations) {
            presentations.forEach(function (row) {
                // row -> [0]=id, [1]=fk_course_id, [2]=date, [3]=name
                addActionButtons('tblPresentations', row[0], row[2], row[3]);
            });
        });
    }

    if (!hasListeners) {
        addClickListeners('Presentation');
    }
}

function addActionButtons(table_id, row_id, row_head, row_name) {
    let editBtnClass = '';
    let deleteBtnClass = '';
    switch (table_id) {
        case 'tblPresentations': editBtnClass = 'btnEditPresentation'; deleteBtnClass = 'btnDeletePresentation'; break;
        case 'tblStudents': editBtnClass = 'btnEditStudent'; deleteBtnClass = 'btnDeleteStudent'; break;
        case 'tblCourses': editBtnClass = 'btnEditCourse'; deleteBtnClass = 'btnDeleteCourse'; break;
    }

    $('#' + table_id + ' tbody').append(
        '<tr data-id="' + row_id + '">' +
        '<th scope="row">' + row_head + '</th>' +
        '<td class="name">' + row_name + '</td>' +
        '<td style="text-align: center"><div class="btn-group" style="padding-bottom: 10px">' +
        '<button class="link btn btn-primary ' + editBtnClass + ' edit-default"> <i class="fa fa-edit"></i> </button>' +
        '<button class="link btn btn-danger ' + deleteBtnClass + ' delete-default"><i class="fa fa-trash"></i></button></div>' +
        '<p><button class="link btn btn-sm btn-success d-none btnSave">Save</button>' +
        '<button class="link btn btn-sm btn-danger d-none btnConfirm">Confirm</button></p>' +
        '</td>' +
        '</tr>');

}

function addClickListeners(type) {
    let current_head, current_name; // Used to revert to old values when user clicks cancel
    hasListeners = true;
    console.log('Listeners attached: ' + hasListeners);

    $('body').on('click', '.btnEdit' + type, function (e) {
        let btn = $(this);
        let row = btn.parents('tr');
        let name = row.children('td.name').html();
        let head = row.children('th').html();

        if (btn.hasClass('edit-default')) {
            current_head = head;
            current_name = name;

            // Change text to input
            if (type == 'Presentation') {
                row.children('th').html('<input type="date" class="form-control" value="' + head + '" />');
            } else if (type == 'Course') {
                row.children('th').html('<input type="text" class="form-control" value="' + head + '" />');
            }

            row.children('td.name').html('<input type="text" class="form-control" value="' + name + '" />');

            btn.html('<i class="fa fa-times"></i>');
            btn.removeClass('edit-default');
            btn.addClass('edit-cancel');
            row.find('.btnSave').removeClass('d-none');
            // Disable delete button
            row.find('.btnDelete' + type).attr('disabled', true);
        } else if (btn.hasClass('edit-cancel')) {
            row.children('th').html(current_head);
            row.children('td.name').html(current_name);
            btn.html('<i class="fa fa-edit"></i>');
            btn.removeClass('edit-cancel');
            btn.addClass('edit-default');
            row.find('.btnSave').addClass('d-none');
            // Enable delete button
            row.find('.btnDelete' + type).attr('disabled', false);
        }
    });

    $('body').on('click', '.btnSave', function (e) {
        let btn = $(this);
        let row = btn.parents('tr');
        let id = row.attr('data-id');
        let new_name = row.find('td.name input').val();
        let new_head = row.find('th input').val();

        console.log('Saving ' + new_name)

        switch (type) {
            case 'Presentation':
                // Save presentation to database
                console.log('Saving presentation to database...');
                eel.updatePresentation(id, new_name, new_head)(function () {
                    // Upon successful save, change input to text
                    row.children('th').html(new_head);
                    row.children('td.name').html(new_name);
                    // Enable delete button
                    row.find('.btnDelete' + type).attr('disabled', false);

                    row.find('.btnSave').addClass('d-none');
                    row.find('.btnEdit' + type).html('<i class="fa fa-edit"></i>');
                });
                break;
            case 'Student':
                // Save student to database
                console.log('Saving student to database...');
                eel.updateStudent(id, new_name)(function () {
                    console.log('Student saved to database...');
                    // Upon successful save, change input to text
                    row.children('th').html(new_head);
                    row.children('td.name').html(new_name);
                    // Enable delete button
                    row.find('.btnDelete' + type).attr('disabled', false);

                    row.find('.btnSave').addClass('d-none');
                    row.find('.btnEdit' + type).html('<i class="fa fa-edit"></i>');
                });
                break;
            case 'Course':
                // Save presentation to database
                console.log('Saving course to database...');
                eel.updateCourse(id, new_head, new_name)(function () {
                    // Upon successful save, change input to text
                    console.log('Saving course to database...');
                    row.children('th').html(new_head);
                    row.children('td.name').html(new_name);
                    // Enable delete button
                    row.find('.btnDelete' + type).attr('disabled', false);

                    row.find('.btnSave').addClass('d-none');
                    row.find('.btnEdit' + type).html('<i class="fa fa-edit"></i>');
                });
                break;
        }

    });

    // Add listener to delete
    $('body').on('click', '.btnDelete' + type, function (e) {
        console.log('Confirm delete');
        let btn = $(this);
        let row = btn.parents('tr');
        let name = row.children('td.name').html();
        let date = row.children('th').html();

        if (btn.hasClass('delete-default')) {
            console.log('delete-default added');
            btn.html('<i class="fa fa-times"></i>');
            btn.removeClass('delete-default');
            btn.addClass('delete-cancel');
            row.find('.btnConfirm').removeClass('d-none');
            // Disable edit button
            row.find('.btnEdit' + type).attr('disabled', true);
        } else if (btn.hasClass('delete-cancel')) {
            console.log('delete-cancel added');
            btn.html('<i class="fa fa-trash"></i>');
            btn.removeClass('delete-cancel');
            btn.addClass('delete-default');
            row.find('.btnConfirm').addClass('d-none');
            // Enable edit button
            row.find('.btnEdit' + type).attr('disabled', false);
        }
    });

    $('body').on('click', '.btnConfirm', function (e) {
        let row = $(this).parents('tr');
        let id = row.attr('data-id');
        console.log('Deleting record with id ' + id);

        switch (type) {
            case 'Presentation':
                eel.deletePresentation(id)(function (course_id) {
                    console.log('Successfully deleted..');
                    // Enable edit button
                    row.find('.btnEdit' + type).attr('disabled', false);

                    row.find('.btnConfirm').addClass('d-none');
                    row.find('.btnDelete' + type).html('<i class="fa fa-trash"></i>');

                    location.reload();
                })
                break;
            case 'Course':
                eel.deleteCourse(id)(function () {
                    console.log('Successfully deleted..');
                    // Enable edit button
                    row.find('.btnEdit' + type).attr('disabled', false);

                    row.find('.btnConfirm').addClass('d-none');
                    row.find('.btnDelete' + type).html('<i class="fa fa-trash"></i>');

                    location.reload();
                })
                break;
            case 'Student':
                eel.deleteStudent(id)(function () {
                    console.log('Successfully deleted..');
                    // Enable edit button
                    row.find('.btnEdit' + type).attr('disabled', false);

                    row.find('.btnConfirm').addClass('d-none');
                    row.find('.btnDelete' + type).html('<i class="fa fa-trash"></i>');

                    location.reload();
                })
                break;
        }
    });
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
        eel.addCourse(course_code, course_name)(function () {
            console.log('Course added');
            displayAllCourses();
        });

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
        console.log('Adding ' + student_id + ' with name ' + student_name);
        eel.addStudent(student_id, student_name)(function () {
            displayAllStudents();
        });

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
        eel.addPresentation(course_id, presentation_name, presentation_date)(function () {
            displayAllPresentations(course_id);
        });

        // Clear input fields
        $('#datePresentation').val('');
        $('#txtPresentationName').val('');
    }
}