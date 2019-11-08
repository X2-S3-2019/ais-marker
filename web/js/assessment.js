/*
    assessment.js

    File description: Contains functions related to assessment and navigation of assessment.html

    TODO:
    In initiliazeSelect, values are hard-coded (Excellent, Fair, Good, Poor). Make this dynamic.
    Create a way to store course, presentation and student information directly to database from the assessment page.
*/

var arrStudentIDs = [];
var arrStudentNames = [];
var arrCourses = [];
var arrPresentations = [];
var template_id = 1;    // Default template (Change)

$(document).ready(function () {

    // Get data from back-end and populate arrays for autocomplete
    eel.getStudents()(function (students) {
        students.forEach(function (row) {
            arrStudentIDs.push(row[0]);
            let temp_student = {};
            temp_student['id'] = row[0];
            temp_student['name'] = row[1];
            arrStudentNames.push(temp_student);
        });
    });

    eel.getCourses()(function (courses) {
        courses.forEach(function (row) {
            arrCourses.push(row[1]);

            eel.getCourseID(row[1])(function (course_id) {
                let temp = {};
                temp['course_code'] = row[1];
                temp['presentations'] = [];
                console.log(row[1] + ' has the id ' + course_id);
                eel.getAllPresentationsOfCourse(course_id.toString())(function (presentations) {
                    console.log('Accessed' + presentations.length + ' right?');
                    presentations.forEach(function (row) {
                        console.log(row[3]);
                        temp['presentations'].push(row[3]);
                    });
                });

                arrPresentations.push(temp);
            });
        });
    });

    initializeEvaluationPopup();

    // When user wants to open recently created document
    $('#linkOpenDocument').click(function () {
        console.log('Link to open document is clicked');
        eel.openDocument(assessment.documentName)(function () {
            console.log('Document opened');
        });
    });

    createTemplateTable(template_id);
    initTableEdit()
});

function initializeEvaluationPopup() {
    autocomplete(document.getElementById("txtStudentID"), arrStudentIDs);
    autocomplete(document.getElementById("txtCourse"), arrCourses);

    // Show popup
    $('#popupAddStudent').modal('show');

    // When Show Additional Fields is clicked
    $('#linkShowAdditionalFields').click(function () {
        if ($('#linkShowAdditionalFields').hasClass('hidden')) {
            toggleAdditionalFields('Hidden');
        } else if ($('#linkShowAdditionalFields').hasClass('shown')) {
            toggleAdditionalFields('Shown');
        }
    });

    // Bring label from placeholder position to top
    $('.labeled-input-group input').blur(function () {
        if ($('.labeled-input-group input').val() != '') {
            $(this).next().css({ 'top': '-10px', 'color': 'black', 'font-size': '12px' });
        }
    });

    // Change red warning border when user inputs a character in student ID field
    $('#txtStudentID').on('input', function () {
        if ($('#txtStudentID').val() != '') {
            $('#txtStudentID').css({ 'border-bottom': '1px solid grey' });
            $('#txtStudentID').next().css('color', 'black');
            $('#txtStudentID').next().text('Student ID');
        }
    });

    // If student ID exists in the database, add the student name automatically
    $('#txtStudentID').blur(function () {
        if ($('#txtStudentID').val() != '') {
            let studentID = $('#txtStudentID').val();
            for (i = 0; i < arrStudentNames.length; i++) {
                if (studentID == arrStudentNames[i]['id']) {
                    console.log('Found ' + arrStudentNames[i]['name']);
                    $('#txtStudentName').val(arrStudentNames[i]['name']);
                    // Override style and place label to top
                    $('#txtStudentName').next().css({ 'top': '-10px', 'color': 'black', 'font-size': '12px' });
                }
            }
        }
    });

    // If course exists in the database, trigger autocomplete in Presentation field
    $('#txtCourse').blur(function () {
        if ($('#txtCourse').val() != '') {
            let course_code = $('#txtCourse').val();
            console.log(course_code);
            for (i = 0; i < arrPresentations.length; i++) {
                if (course_code == arrPresentations[i]['course_code']) {
                    console.log('For ' + course_code + ' ' + arrPresentations[i]['presentations'][0]);
                    autocomplete(document.getElementById('txtPresentation'), arrPresentations[i]['presentations']);
                }
            }
        }
    });

    // When checkmark button from popup is clicked
    $('#btnEvaluate').click(function () {
        // Check if student ID was inputted
        // Only the student ID is required
        if ($('#txtStudentID').val() === '') {
            $('#txtStudentID').css({ 'border-bottom': '1px solid red' });
            $('#txtStudentID').next().css('color', 'red');
            $('#txtStudentID').text('Student ID (Required)');
            $('#txtStudentID').focus();
        } else {
            $('#txtStudentID').removeClass('is-invalid');

            let student_id = $('#txtStudentID').val();
            let student_name = $('#txtStudentName').val();
            let course = $('#txtCourse').val();
            let presentation = $('#txtPresentation').val();

            addHeaderDocument(student_id, student_name, course, presentation);

            $('#popupAddStudent').modal('toggle');
        }
    });
}


function toggleAdditionalFields(status) {
    if (status === 'Hidden') {
        $('#linkShowAdditionalFields').text("Hide additional fields");
        $('#linkShowAdditionalFields').removeClass('hidden');
        $('#linkShowAdditionalFields').addClass('shown');

        $('.hidden-fields-container').show(500);
    } else if (status === 'Shown') {
        $('#linkShowAdditionalFields').text("Show additional fields");
        $('#linkShowAdditionalFields').removeClass('shown');
        $('#linkShowAdditionalFields').addClass('hidden');

        $('.hidden-fields-container').hide(500);
    }
}

function addHeaderDocument(student_id, student_name, course, presentation) {
    console.log('Adding header document...');

    /* Add the document header containing student and assessment information */

    $('.tableStudentID').val(student_id);
    $('.tableStudentName').val(student_name);
    $('.tablePresentation').val(presentation);
    // Add the course code which is hidden
    $('.document-header .tableCourseCode').val(course);
}

var assessment = {
    /* DOM elements */
    saveButton: $('.btnSaveDocument'),
    /* Data objects*/
    header_info: {},
    results: {},
    scoreCriteria: {},  // { groupCriteria: [{ name, possibleScore, iconClass }, ...], totalPossibleScore: }
    documentName: '',
    template: {},
    /* Functions */
    init: function () {
        this.initializeSelect()
    },
    initializeSelect: function () {
        let that = this;

        $('td').click(function (e) {

            $(e.target).parent().removeClass("table-danger");
            let score = $(e.target).attr('data-score');
            let type = $(e.target).attr('data-type');
            let value = $(e.target).attr('data-value');
            let classname = "";
            let tmp = type.split('.')

            if (value == 'Excellent') {
                classname = "table-success";
            } else if (value == 'Good') {
                classname = "table-primary";
            } else if (value == 'Fair') {
                classname = "table-warning";
            } else if (value == 'Poor') {
                classname = "table-danger";
            }

            $('td[data-type="' + type + '"]').removeClass();
            $(e.target).addClass(classname);

            assessment.results['groupCriteria'][tmp[0]]["criteria"][tmp[1]] = score;

            // Update assessment scores
            let groupTotalScore = 0;
            let criteria = assessment.results['groupCriteria'][tmp[0]]["criteria"];

            for (var key in criteria) {
                /* Checks if the field has been selected. Else, ignore. */
                if (criteria[key] >= 0) {
                    groupTotalScore += parseInt(criteria[key]);
                }
            }

            that.results['groupCriteria'][tmp[0]]['groupTotalScore'] = groupTotalScore;

            assessment.updateAssessmentScoresUI(tmp[0], groupTotalScore);
        });
    },
    updateAssessmentScoresUI: function (type, score) {
        /* This is only to update the scores in the user interface */

        // Updating the individual score cards
        $('.' + type).text(score);

        // Update score card color based on percentage
        // 50% below is red, 50% and above but below 74% is yellow, 75% above is green
        let scorePercentage;

        if (score > 0) {
            scorePercentage = score / assessment.scoreCriteria["groupCriteria"][type]["possibleTotalScore"] * 100;
        }

        if (scorePercentage < 50) {
            $('.' + type).parent('.small-score-card').css({ 'background': '#ff8686', 'color': '#a90000' });
        } else if (scorePercentage >= 50 && scorePercentage < 74) {
            $('.' + type).parent('.small-score-card').css({ 'background': '#fff086', 'color': '#a9a400' });
        } else if (scorePercentage >= 75) {
            $('.' + type).parent('.small-score-card').css({ 'background': '#88ff86', 'color': '#00a90d' });
        }

        // Update the total of score cards
        let totalScore = 0;
        let groupCriteria = assessment.results.groupCriteria;

        for (var key in groupCriteria) {
            totalScore += groupCriteria[key]["groupTotalScore"];
        }

        $('.total_score').text(totalScore);

        if (totalScore > 0) // Prevent dividing by zero
        {
            scorePercentage = totalScore / assessment.scoreCriteria["totalPossibleScore"] * 100;
        }

        if (scorePercentage < 50) {
            $('.total_score').parent('.small-score-card').css({ 'background': '#ff8686', 'color': '#a90000' });
        } else if (scorePercentage >= 50 && scorePercentage < 74) {
            $('.total_score').parent('.small-score-card').css({ 'background': '#fff086', 'color': '#a9a400' });
        } else if (scorePercentage >= 75) {
            $('.total_score').parent('.small-score-card').css({ 'background': '#88ff86', 'color': '#00a90d' });
        }
    },
    checkOptions: function () {
        var that = this;

        for (category in assessment.results['groupCriteria']) {
            for (subcate in assessment.results['groupCriteria'][category]['criteria']) {
                if (assessment.results['groupCriteria'][category]['criteria'][subcate] < 0) {
                    var tmp = $('tr[data-type="' + category + '.' + subcate + '"]');
                    tmp.addClass("table-danger");
                    let offset = tmp.offset().top - 50;
                    $('body, html').animate({
                        scrollTop: offset
                    });
                    return false;
                }
            }
        }

        return true;
    },
    enableSaveButton: function (results, template) {
        this.saveButton.click(function (e) {
            console.log('Clicked save button');
            var that = this;

            // Check if all fields are checked before generating a document 
            let allAssessmentChecked = assessment.checkOptions();

            if (allAssessmentChecked) {

                let newInfo = assessment.checkForNewInformation();

                if (jQuery.isEmptyObject(newInfo)) {
                    // Proceed to creating document
                    console.log('newInfo is empty');
                    assessment.createAssessmentDocument();
                } else {

                    if(newInfo.hasOwnProperty('error')){
                        console.log(newInfo['error']);
                        return;
                    }

                    let newInfoHTML = '';
                    // Show Save New Info popup
                    if (newInfo.hasOwnProperty('student_id')) {
                        newInfoHTML += '<h3>New Student</h3>';
                        newInfoHTML += '<ul><li> Student ID: ' + newInfo['student_id'];
                        if (newInfo.hasOwnProperty('student_name')) {
                            newInfoHTML += '<li> Student Name: ' + newInfo['student_name'];
                        }
                        newInfoHTML += '</ul>';
                    }

                    if (newInfo.hasOwnProperty('course_code')) {
                        newInfoHTML += '<h3>New Course</h3>';
                        newInfoHTML += '<ul><li>' + newInfo['course_code'] + '</li></ul>';
                    }

                    if (newInfo.hasOwnProperty('presentation')) {
                        newInfoHTML += '<h3>New Presentation Topic</h3>';
                        newInfoHTML += '<ul><li>' + newInfo['presentation'] + '</li></ul>';
                    }
                    $('#modalSaveNewInfo').html(newInfoHTML);

                    $('#popupSaveNewInfo').modal('show');

                    $('#popupSaveNewInfo #btnSaveNewInfo').click(function () {
                        // Add new student
                        if (newInfo.hasOwnProperty('student_id')) {
                            let student_id = newInfo['student_id'];
                            let student_name = '';
                            if (newInfo.hasOwnProperty('student_name')) {
                                student_name = newInfo['student_name'];
                            }

                            eel.addStudent(student_id, student_name)(function () {
                                console.log('Successfully added new student: ' + student_name);
                            });
                        }

                        // TODO: Update student name if student_id exists but no name

                        if (newInfo.hasOwnProperty('course_code')) {
                            let course_code = newInfo['course_code'];

                            eel.addCourse(course_code, '')(function () {
                                console.log('Successfully added new course: ' + course_code);
                            });
                        }

                        if (newInfo.hasOwnProperty('presentation')) {
                            let presentation = newInfo['presentation'];
                            let today = new Date();
                            let dd = ("0" + (today.getDate())).slice(-2);
                            let mm = ("0" + (today.getMonth() + 1)).slice(-2);
                            let yyyy = today.getFullYear();
                            today = yyyy + '-' + mm + '-' + dd;

                            // Get course_id of course_code
                            eel.getCourseID(course_code)(function (course_id) {
                                eel.addPresentation(course_id, presentation, today)(function () {
                                    console.log('Successfully added new presentation ' + presentation);
                                });
                            });
                        }

                        $('#popupSaveNewInfo').modal('toggle');

                        assessment.createAssessmentDocument();
                    });

                    // If user decides not to save the new information, proceed to making the document.
                    $('#btnDiscard').click(function () {
                        assessment.createAssessmentResultDocument();
                    });
                }

                assessment.addHeaderInfo();
                assessment.calculateScores();

            }
        });
    },
    addHeaderInfo: function () {
        assessment.header_info['studentName'] = $('.tableStudentName').val();;
        assessment.header_info['studentId'] = $('.tableStudentID').val();
        assessment.header_info['presentationTopic'] = $('.tablePresentation').val();

        let today = new Date();
        let formatted_date = today.getDate() + "-" + today.getMonth() + "-" + today.getFullYear();
        assessment.header_info['presentationDate'] = formatted_date;
    },
    calculateScores: function () {
        let totalScore = 0;

        for (var group in assessment.results['groupCriteria']) {
            totalScore += assessment.results['groupCriteria'][group].groupTotalScore;
        }

        let possibleTotalScore = 0;

        for (var group in assessment.results['groupCriteria']) {
            possibleTotalScore += assessment.results['groupCriteria'][group].groupPossibleTotalScore;
        }

        assessment.results['assessmentTotalScore'] = totalScore;
        assessment.results['assessmentPossibleTotalScore'] = possibleTotalScore;

        let scorePercentage = totalScore / possibleTotalScore * 100;
        assessment.results['scorePercentage'] = scorePercentage.toFixed(2);

        console.log(assessment.results);
    },
    createAssessmentDocument: function () {
        console.log('Creating document..');
        eel.createAssessmentResultDocument(assessment.header_info, assessment.results, template_id, false)().then(function () {
            // Show popup
            $('#popupSuccessfulSave').modal('show');

            // Store document name
            // TODO: This code is redundant to the one in main.py. Optimise this.
            if (header_info['studentName'] === '') {
                assessment.documentName = header_info['studentId'] + ' (' + header_info['presentationDate'] + ')';
            } else {
                assessment.documentName = header_info['studentName'] + ' - ' + header_info['studentId'] + ' (' + header_info['presentationDate'] + ')';
            }

            console.log('Successfully created document.');
        })
            .catch(function () {

            });
    },
    printAssessmentJSON: function () {
        var that = this;
        console.log(that.results);
    },
    checkForNewInformation: function () {
        // Make sure you are checking from the textboxes in the document
        // New student ID? Add student in database

        let newInfo = {};

        if ($('.tableStudentID').val() != '') {
            let student_id = $('.tableStudentID').val();

            if (arrStudentIDs.includes(student_id)) {
                console.log(student_id + ' in array');

            } else {
                console.log('New ID!');
                newInfo['student_id'] = student_id;
                newInfo['student_name'] = $('.tableStudentName').val();
            }
        } else {
            // Show error popup
            // 'Student ID should not be empty or focus() on tableStudentID
            $('.tableStudentID').focus();
            return {'error': 'Student ID is missing'};
        }
        // New student name? Update student in database
        // New course? Add course to database
        if ($('.document-header .tableCourseCode').val() != '') {
            let course_code = $('.document-header .tableCourseCode').val();

            if (arrCourses.includes(course_code)) {
                console.log(course_code + ' in array');
                // Check if presentation is new
            } else {
                console.log('New course!');
                newInfo['course_code'] = course_code;
            }
        }

        // You can't add presetations on the fly since it's dependent on the course and courses should be added to the database first before adding a presentation.

        console.log('In checkForNewInformation: ');
        console.log(newInfo);

        return newInfo;
    }
};

function createScoreCards() {
    let headerScoreContainer = $('.header-score-container');
    let scoreCardsHTML = '';
    let groupCriteria = assessment.scoreCriteria.groupCriteria;

    // Add the total score cards

    for (var key in groupCriteria) {
        if (groupCriteria.hasOwnProperty(key)) {
            scoreCardsHTML += '<div class="small-score-card" title="' + groupCriteria[key]["name"] + '">' +
                '<i class="' + groupCriteria[key]["icon"] + '"></i>' +
                '<span class="' + key + '"> 0</span>/<span class="score-text">' + groupCriteria[key]["possibleTotalScore"] + '</span>' +
                '</div>';
        }
    }

    scoreCardsHTML += '<div class="small-score-card" title="Total Score">' +
        '<i class="fas fa-equals"></i>' +
        '<span class="total_score"> 0</span>/<span  class="score-text">' + assessment.scoreCriteria['totalPossibleScore'] + '</span>' +
        '</div>';

    headerScoreContainer.html(scoreCardsHTML);
}

function createTemplateTable(template_id) {

    // TODO: Add loader here

    eel.getTemplateJSON(template_id)().then(function (templateJSON) {
        /* Organize the JSON object */
        let template = JSON.parse(templateJSON);
        console.log('Creating template...');

        let templateHTML = '<div class="text-right"><button class="btn btn-danger edit-assesment mb-3">Edit template</button></div>';
        let group_keys = {}; 
        let group_score_keys = {};

        let totalPossibleScore = 0;

        /* For each group criterion, create a table */
        /* Developer's Notes: i is for groupCriteria, j is for first criterion fields, k is for criteria */
        for (var i = 0; i < template.groupCriteria.length; i++) {
            let groupCriteria = template.groupCriteria;

            $('.assessment-container').data('id', template.id);
            $('.assessment-container').data('name', template.name);
                
            let htmlTable = '<table class="table">';
            /* Table Headers containing group criterion's name */
            htmlTable += '<thead><tr>';
            htmlTable += '<th scope="col" width="12%" data-name="' + groupCriteria[i].name.replace(/["]/g, '') + '" data-id="' + groupCriteria[i].id + '">' + groupCriteria[i].name + '</th>';

            let first_criterion_fields = groupCriteria[i].criteria[0].fields;

            /* Add value and points in header */
            for(var j = 0; j < first_criterion_fields.length; j++){
                htmlTable += '<th scope="col" width="22%" data-points="' + first_criterion_fields[j].points + '" data-point-name="' + first_criterion_fields[j].value + '">' +
                     first_criterion_fields[j].points + " - " + first_criterion_fields[j].value + '</th>';
            }

            htmlTable += '</tr></thead>';
            htmlTable += '<tbody>';

            /* Take the first word of group criterion, add _ and then the group criterion's id */
            let temp_words = groupCriteria[i].name.split(" ");
            let data_type_group = temp_words[0].toLowerCase() + "_" + groupCriteria[i].id;

            let temp_score_keys = {};
            temp_score_keys["icon"] = groupCriteria[i].icon;
            temp_score_keys["name"] = groupCriteria[i].name;

            let temp_keys = {};
            let criteria_keys = {}; /* Temporary holder for results object's criteria */
            let possible_total_score = 0;

            for (var k = 0; k < groupCriteria[i].criteria.length; k++) {

                let criteria = groupCriteria[i].criteria;

                /* Take the first word of criterion, add _ and then the criterion's id */
                temp_words = criteria[k].name.split(" ");
                let data_type_criterion = temp_words[0].toLowerCase() + "_" + criteria[k].id;

                criteria_keys[data_type_criterion] = -1; /* Initialize results. */

                let data_type = data_type_group + '.' + data_type_criterion;

                htmlTable += '<tr data-type="' + data_type + '"><th>' + criteria[k].name + '</th>';

                /* Add fields' descriptions */
                for (var l = 0; l < criteria[i].fields.length; l++) {
                    let fields = criteria[k].fields;
                    
                    htmlTable += '<td data-score="' + fields[l].points + '" data-type="' + data_type + '" data-value="'
                        + fields[l].value + '" data-id="' + fields[l].id + '" data-name="' + fields[l].name +'">' 
                    + fields[l].description + '</td>';
                }

                possible_total_score += criteria[k].fields[0].points; // Get highest possible points

                htmlTable += '</tr>';
            }

            // For assessment.results data object
            temp_keys["groupTotalScore"] = 0;
            temp_keys["groupPossibleTotalScore"] = possible_total_score;
            temp_keys["criteria"] = criteria_keys;

            group_keys[data_type_group] = temp_keys;

            // For assessment.scoreCriteria data object
            totalPossibleScore += possible_total_score;
            temp_score_keys["highestFieldScore"] = groupCriteria[i].criteria[0].fields[0].points;
            temp_score_keys["possibleTotalScore"] = possible_total_score;
            group_score_keys[data_type_group] = temp_score_keys;

            htmlTable += '</table><br />';

            templateHTML += htmlTable;
        }

        assessment.scoreCriteria['groupCriteria'] = group_score_keys;
        assessment.scoreCriteria['totalPossibleScore'] = totalPossibleScore;
        assessment.results['groupCriteria'] = group_keys;

        $('.assessment-container').html(templateHTML);

        assessment.init();
        assessment.template = template;
        assessment.enableSaveButton(assessment.results, template.id);

        createScoreCards();
    });

}

function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    /*execute a function when someone writes in the text field:*/
    inp.addEventListener("input", function (e) {
        var a, b, i, val = this.value;
        /*close any already open lists of autocompleted values*/
        closeAllLists();
        if (!val) { return false; }
        currentFocus = -1;
        /*create a DIV element that will contain the items (values):*/
        a = document.createElement("DIV");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");
        /*append the DIV element as a child of the autocomplete container:*/
        this.parentNode.appendChild(a);
        /*for each item in the array...*/
        for (i = 0; i < arr.length; i++) {
            /*check if the item starts with the same letters as the text field value:*/
            if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
                /*create a DIV element for each matching element:*/
                b = document.createElement("DIV");
                /*make the matching letters bold:*/
                b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
                b.innerHTML += arr[i].substr(val.length);
                /*insert a input field that will hold the current array item's value:*/
                b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
                /*execute a function when someone clicks on the item value (DIV element):*/
                b.addEventListener("click", function (e) {
                    /*insert the value for the autocomplete text field:*/
                    inp.value = this.getElementsByTagName("input")[0].value;
                    /*close the list of autocompleted values,
                    (or any other open lists of autocompleted values:*/
                    closeAllLists();
                });
                a.appendChild(b);
            }
        }
    });
    /*execute a function presses a key on the keyboard:*/
    inp.addEventListener("keydown", function (e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
            /*If the arrow DOWN key is pressed,
            increase the currentFocus variable:*/
            currentFocus++;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 38) { //up
            /*If the arrow UP key is pressed,
            decrease the currentFocus variable:*/
            currentFocus--;
            /*and and make the current item more visible:*/
            addActive(x);
        } else if (e.keyCode == 13) {
            /*If the ENTER key is pressed, prevent the form from being submitted,*/
            e.preventDefault();
            if (currentFocus > -1) {
                /*and simulate a click on the "active" item:*/
                if (x) x[currentFocus].click();
            }
        }
    });
    function addActive(x) {
        /*a function to classify an item as "active":*/
        if (!x) return false;
        /*start by removing the "active" class on all items:*/
        removeActive(x);
        if (currentFocus >= x.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (x.length - 1);
        /*add class "autocomplete-active":*/
        x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
        /*a function to remove the "active" class from all autocomplete items:*/
        for (var i = 0; i < x.length; i++) {
            x[i].classList.remove("autocomplete-active");
        }
    }
    function closeAllLists(elmnt) {
        /*close all autocomplete lists in the document,
        except the one passed as an argument:*/
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != inp) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
      }
    }
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
  }

function initTableEdit() {

    $(document).on('click', '.edit-assesment', function () {
        tableEdit.init($('table.table'));
    }) 
}
