var groupUser = {
	presentTationElm: $(".tablePresentation"),
	presentTationData: "",
	groupTable: $("#MembersOfGroup"),
	groupData: {"number": "", members: [{"id": 1, "studentId": "", "studentName": ""}]},
	groupNumber: $("#tableGroupNumber"),
	addBtn: $("#new-student-line"),
	startBtn: $("#start-envaluation"),
	delBtns: $("button[data-action=del-student-line]"),
	isediting: true,
	init: function() {
		if ( this.groupNumber.length == 0 ) {
			return;
		}
		var that = this;
		this.addBtn.click(function(){
			that.addStudentLine();
		});
		this.registerDelStudentLine();
		this.startBtn.click(function(){
			if ( that.isediting == true ) {
				that.finishGroupEditing();
			} else {
				that.unlockGroup();
			}
		});
	},
	getNextStudentID: function() {
		return this.groupData.members.length + 1;
	},
	addStudentLine: function() {
		var nextId = this.getNextStudentID();
		if (nextId > 10) {
			alert("the maximum group member is 10");
			return;
		}
		this.hideDelBtn()
		this.groupTable.find("tbody").append("<br />");
		var html = 
		'<tr data-student-id=' + nextId + '>' +
            '<td>' +
                'Stuent ' + nextId + ' ID:'+
                '<input type="text" class="header-input border-bottom-only tableStudentID" maxlength=10 />' +
            '</td>' +
            '<td>' +
                'Stuent ' + nextId + ' Name:' +
                '<input type="text" class="header-input border-bottom-only tableStudentName" maxlength=40 />' +
            '</td>' +
            '<td><button class="btn btn-danger" data-action="del-student-line">Del</button></td>' +
        '</tr>';
        this.groupTable.find("tbody").append(html);
        this.groupData.members.push({"id": nextId, "studentId": "", "studentName": ""});
        this.registerDelStudentLine();
	},
	registerDelStudentLine: function() {
		var that = this;
		$("button[data-action=del-student-line]").unbind();
		$("button[data-action=del-student-line]").click(function() {
			that.delStudentLine();
		});
	},
	delStudentLine: function() {
		this.groupData.members.pop();
		this.groupTable.find("tbody").children("tr:last").remove();
		this.groupTable.find("tbody").children("br:last").remove();
		this.showDelBtn();
	},
	finishGroupEditing: function() {
		this.presentTationData = this.presentTationElm.val();
		var groupNumber = this.groupNumber.val();
		if (groupNumber == "") {
			alert("group number is required");
			this.groupNumber.focus();
			return;
		}
		var members = [];
		var validation = true;
		$("tr[data-student-id]").each(function(index, item) {
			var tr = $(item);
			var id = $(item).attr("data-student-id");
			var studentNameElm = $(item).find(".tableStudentName");
			var studentIdElem = $(item).find(".tableStudentID");
			var studentName = studentNameElm.val();
			var studentId = studentIdElem.val();
			if ( studentId == "" ) {
				alert("student id is required");
				studentIdElem.focus();
				validation = false;
				return false;
			}
			if ( studentName == "" ) {
				alert("student name is required");
				studentNameElm.focus();
				validation = false;
				return false;
			}
			members.push({"id": id, "studentId": studentId, "studentName": studentName});
		});
		if ( !validation ) {
			return false;
		}
		if ( members.length == 0 ) {
			alert("this group is empty");
			return false;
		}
		this.groupData = {};
		this.groupData.number = groupNumber;
		this.groupData.members = members;
		this.lockGroup();
		return true;
	},
	hideDelBtn: function() {
		$("button[data-action=del-student-line]").hide();
	},
	showDelBtn: function() {
		this.groupTable.find("tbody").children("tr:last").find("button[data-action=del-student-line]").show();
	},
	lockGroup: function() {
		this.groupTable.find("tbody input").attr("disabled", true);
		this.addBtn.addClass("disabled");
		this.groupNumber.attr("disabled", true);
		this.addBtn.attr("disabled", true);
		this.startBtn.html("Return to Edit");
		this.hideDelBtn();
		this.isediting = false;
	},
	unlockGroup: function() {
		this.groupTable.find("tbody input").attr("disabled", false);
		this.addBtn.removeClass("disabled");
		this.groupNumber.attr("disabled", false);
		this.addBtn.attr("disabled", false);
		this.startBtn.html("Start Evaluation");
		this.showDelBtn();
		this.isediting = true;
	},
	getGroupData: function() {
		return this.groupData;
	}
};


/*
    assessment.js

    File description: 
    Contains functions related to assessment
    Functions from this file are being used in table-assess.js

*/

var arrStudentIDs = [];
var arrStudentNames = [];
var arrCourses = [];
var arrPresentations = [];
var arrTemplates = [];
var template_id = 1;   // Initialize id; If no default is given, make user choose.

// UI component-related variable (usually from popups)
var linkAdditionalFieldsHasListener = false;

// Walkthrough-related variables
var showSecondWalkthrough = false;
var showThirdWalkthrough = false;
var showFourthWalkthrough = false;

// Timer-related variables
var minutesLabel = $('.timer-minutes');
var secondsLabel = $('.timer-seconds');
var totalSeconds = 0;
var timeLimit;
var informedTimeLimit;  // Checks if the user has been alerted about time limit reached

$(document).ready(function () {

	groupUser.init();
	tableAssessGroup.init();

    let template_info = getTemplateInfo();
    console.log(template_info);
    informedTimeLimit = false;  // Time limit reached message has not been shown

    if (template_info.hasOwnProperty('template_id')) {
        template_id = template_info['template_id'];
    }

    getDataFromDatabase();

    // Menu bar buttons
    // Home button is just a link to index.html
    // Choose Template button
    $('#btnChangeTemplate').click(function () {
        popups.chooseTemplate.init();
    });

    $('#btnEditTemplate').click(function () {
        window.location.replace('edit-assessment.html?template_id=' + assessment.template.id + '&template_name=' + assessment.template.name);
    });

    $('.dropdown_template_menu').mouseleave(function () {
        $(".dropdown_template_menu").css("display", "none");
    });

    // On hover
    $('.dropdown_directory_trigger').mouseenter(function () {
        // Remove other dropdowns
        $(".dropdown_menu").css("display", "none");
        $(".dropdown_directory_menu").css("display", "block");
    });

    // Change Directory
    $('.dropdown_directory_menu').mouseleave(function () {
        $(".dropdown_directory_menu").css("display", "none");
    });

    // On hover
    $('.dropdown_template_trigger').mouseenter(function () {
        // Remove other dropdowns
        $(".dropdown_menu").css("display", "none");
        $(".dropdown_template_menu").css("display", "block");
    });

    // Timer button
    // Timer button
    $('.dropdown_timer_menu').mouseleave(function () {
        $(".dropdown_timer_menu").css("display", "none");
    });

    // On hover
    $('.dropdown_timer_trigger').mouseenter(function () {
        // Remove other dropdowns
        $(".dropdown_menu").css("display", "none");
        $(".dropdown_timer_menu").css("display", "block");
    });

    $('.btnStopTimer').click(function () {
        timer.stop();
        $('.btnPlayPauseTimer').removeClass('pause');
        $('.btnPlayPauseTimer').addClass('play');
        $('.btnPlayPauseTimer').html('<i class="fas fa-play"></i>');
    });

    $('.btnPlayPauseTimer').click(function () {
        if ($(this).hasClass('pause')) {
            timer.pause();
            $(this).removeClass('pause');
            $(this).addClass('play');
            $(this).html('<i class="fas fa-play"></i>');
        } else if ($(this).hasClass('play')) {
            timer.resume();
            $(this).removeClass('play');
            $(this).addClass('pause');
            $(this).html('<i class="fas fa-pause"></i>');
        }
    });

    $('#btnEditTimeLimit').click(function () {
        popups.adjustTimeLimit.init();
    });

    // Calculate Score button
    $('.dropdown_calculate_menu').mouseleave(function () {
        $(".dropdown_calculate_menu").css("display", "none");
    });

    // On hover
    $('.dropdown_calculate_trigger').mouseenter(function () {
        // Remove other dropdowns
        $(".dropdown_menu").css("display", "none");
        $(".dropdown_calculate_menu").css("display", "block");
    });

    $('#checkNormalizeScore').bind('change', function(){
        $('#txtNormalizedScore').prop('disabled', false);
    });


    // TODO: Move this to successfulSave popup variable
    // When user wants to open recently created document
    $('#linkOpenDocument').click(function () {
        console.log('Link to open document is clicked');
        eel.openDocument(assessment.documentName)(function () {
            console.log('Document opened');
        });
    });

    $('#btnNextStudent').click(function () {
        console.log('Next Student');
        if (showFourthWalkthrough) {
            showFourthWalkthrough = false;
            setTimeout(walkthrough.fourthWalkthrough, 1000);
        }

        window.location.reload();

        $('#popupSuccessfulSave').modal('toggle');
    });
}); /* End of document.ready() */

// Once data from database has been store to arrays, initialize assessment.
function initializeAssessment() {
    // If there's only one template (the Default AIS template), don't show the template popup
    // Check if user doesn't want to see the popup for choosing templates
    if (arrTemplates.length > 1) {
        // TODO: Implement enabling default template (?)
        if (template_id == -1) {    // Using default value is disabled
            initializeChooseTemplatePopup();
        } else {
            // initializeEvaluationPopup();
            popups.evaluationInfo.init();
            console.log('Creating table with id: ' + template_id);
            tableAssessGroup.createTemplateTable(template_id); // Use the given template

            $('.templateName').html(getCurrentTemplateName());
        }
    } else {
        //initializeEvaluationPopup();
        popups.evaluationInfo.init();
        // Use the default template
        tableAssessGroup.createTemplateTable(template_id); // Use the given template

        $('.templateName').html(getCurrentTemplateName());
    }

    console.log('Template name: ' + getCurrentTemplateName());
    restrictKeyboardInput();
}

/* Timer functions */

var timer = {
    currentTime: 0,
    timerID: 0,
    start: function () {
        this.currentTime = 0;
        this.timerID = setInterval(this.setTime, 1000);
    },
    stop: function () {
        window.clearTimeout(this.timerID);
        this.currentTime = 0;
        secondsLabel.html('00');
        minutesLabel.html('00');
        delete this.timerID;
    },
    pause: function () {
        console.log('Pause');
        clearInterval(this.timerID);
    },
    resume: function () {
        console.log('Resume');
        this.timerID = setInterval(this.setTime, 1000);

    },
    setTime: function () {
        let minutesSpent = parseInt(timer.currentTime / 60);

        ++timer.currentTime;
        secondsLabel.html(pad(timer.currentTime % 60));
        minutesLabel.html(pad(minutesSpent));

        if (minutesSpent == timeLimit) {
            if ($('#checkAlertTimeLimit').is(':checked') && !informedTimeLimit) {
                // Alert user
                $('#popupMessage').find('.modal-title').text('Time Limit Reached');
                $('#popupMessage').find('.modal-body').text('The presentation has reached the time limit. Please inform the presentor.');
                $('#popupMessage').modal('show');
                informedTimeLimit = true;
            }
        }
    }
}; /* End of Timer functions */

/* Miscellaneous functions */
/* These are functions that are used in various aspects of the application */
/* Or simply a tool function */

// This functions pads a zero on a one-digit time value (e.g. 00:01)
function pad(val) {
    var valString = val + '';
    if (valString.length < 2) {
        return '0' + valString;
    } else {
        return valString;
    }
}

/* Pop up functions */
/* Contains the different popups and their functions used during assessment */
var popups = {
    evaluationInfo: {
        popup: $('#popupAddStudent'),
        btnEvaluate: '#btnEvaluate',
        linkAdditionalFields: '#linkShowAdditionalFields',
        hiddenFieldContainer: $('.hidden-fields-container'),
        txtStudentID: '#txtStudentID',
        txtStudentName: '#txtStudentName',
        txtCourse: '#txtCourse',
        txtPresentation: '#txtPresentation',
        txtTimeLimit: '#txtTimeLimit',
        init: function () {
            // Prevents the modal from being dismissed when user clicks anywhere else
            this.popup.modal({ backdrop: 'static', keyboard: false });
            // Initialize autocomplete for student ID and course fields
            autocomplete(document.getElementById("txtStudentID"), arrStudentIDs);
            autocomplete(document.getElementById("txtCourse"), arrCourses);

            // Add listener to evaluate button
            $(btnEvaluate).click(function () {
                // Check if student ID was inputted
                // Only the student ID is required
                console.log('Evaluat button clicked');
                if ($(txtStudentID).val() === '') {
                    $(txtStudentID).css({ 'border-bottom': '1px solid red' });
                    $(txtStudentID).next().css('color', 'red');
                    $(txtStudentID).text('Student ID (Required)');
                    $(txtStudentID).focus();
                } else {
                    $(txtStudentID).removeClass('is-invalid');

                    getStudentName();

                    let student_id = $(txtStudentID).val();
                    let student_name = $(txtStudentName).val();
                    let course = $(txtCourse).val();
                    let presentation = $(txtPresentation).val();

                    addHeaderDocument(student_id, student_name, course, presentation);

                    // Set time limit
                    console.log('Time limit is ' + $(txtTimeLimit).val() + ' minutes');
                    timeLimit = parseInt($(txtTimeLimit).val());

                    popups.evaluationInfo.popup.modal('toggle');

                    // Start timer presentation
                    $('.lblTimeLimit').html(timeLimit);
                    timer.start();
                    // TODO: This code seems out of place. 
                    $('.btnPlayPauseTimer').removeClass('play');
                    $('.btnPlayPauseTimer').addClass('pause');
                    $('.btnPlayPauseTimer').html('<i class="fas fa-pause"></i>');
                }
            });

            // TODO: Allow user to start evaluation with pressing Enter
            $('body').on('keypress', function (e) {
                if (e.which == 13) {
                    console.log('You pressed enter');
                }
            });

            // Bring label from placeholder position to top
            $('.labeled-input-group input').blur(function () {
                if ($('.labeled-input-group input').val() != '') {
                    $(this).next().css({ 'top': '-10px', 'color': 'black', 'font-size': '12px' });
                }
            });

            $(txtStudentID).on('input', function () {
                if ($(txtStudentID).val() != '') {
                    $(txtStudentID).css({ 'border-bottom': '1px solid grey' });
                    $(txtStudentID).next().css('color', 'black');
                    $(txtStudentID).next().text('Student ID');
                }
            });

            // If student ID exists in the database, add the student name automatically
            $(txtStudentID).blur(function () {
                getStudentName();
            });

            // When Show Additional Fields is clicked
            if (!linkAdditionalFieldsHasListener) { // Only add the listener once
                // 'this' is referring to evaluationInfo
                this.linkAdditionalFieldsHasListener = true;
                $(this.linkAdditionalFields).click(function () {
                    console.log('Showing additional fields..');
                    // 'this' is refering the linkAdditionalFields object
                    if ($(this).hasClass('hidden')) {
                        toggleAdditionalFields('Hidden');
                    } else if ($(this).hasClass('shown')) {
                        toggleAdditionalFields('Shown');
                    }
                });
            }

            // Show popup
            this.popup.modal('show');
            // Focus on student ID
            $(txtStudentID).focus();
        },
        toggleAdditionalFields: function (status) {
            if (status === 'Hidden') {
                $(linkAdditionalFields).text("Hide additional fields");
                $(linkAdditionalFields).removeClass('hidden');
                $(linkAdditionalFields).addClass('shown');

                $(hiddenFieldContainer).show(500);
            } else if (status === 'Shown') {
                $(linkAdditionalFields).text("Show additional fields");
                $(linkAdditionalFields).removeClass('shown');
                $(linkAdditionalFields).addClass('hidden');

                $(hiddenFieldContainer).hide(500);
            }
        }
    },
    chooseTemplate: {
        popup: $('#popupChooseTemplate'),
        ddlTemplates: '#ddlTemplates',
        btnApplyTemplate: '#btnApplyTemplate',
        lblTemplateDescription: '#lblTemplateDescription',
        init: function () {
            this.populateDropdownTemplates();

            $(ddlTemplates).change(function () {
                let selectedValue = $(ddlTemplates).find(':selected').val();

                if (selectedValue != "None") {
                    template_id = selectedValue;

                    // Look for the corresponding description through the array of templates
                    arrTemplates.forEach(function (template) {
                        if (template.id == selectedValue) {
                            if (template.description != '') {
                                $(lblTemplateDescription).html(template.description);
                            } else {
                                $(lblTemplateDescription).html('No description available.');
                            }
                            return;
                        }
                    });
                } else {
                    $(ddlTemplates).addClass('is-invalid');
                }
            });

            $(btnApplyTemplate).click(function () {
                window.location.replace('assessment.html?template_id=' + template_id);
            });

            this.popup.modal('show');
        },
        populateDropdownTemplates: function () {
            let dropdownHTML = '';
            console.log('Populating template dropdown..');
            $(ddlTemplates).append('<option value="None">Choose a template..</option>');
            arrTemplates.forEach(function (template) {
                console.log('Adding ' + template.name + ' to dropdown');
                $(ddlTemplates).append('<option value="' + template['id'] + '">' + template['name'] + '</option>');
            });
        }
    },
    adjustTimeLimit: {
        popup: $('#popupAdjustTimeLimit'),
        txtTimeLimit: '.txtTimeLimit',
        btnApplyNewTimeLimit: '#btnApplyNewTimeLimit',
        init: function () {
            // Set value to current time limit
            $(txtTimeLimit).val(timeLimit);

            $('#btnApplyNewTimeLimit').click(function () {
                console.log('Apply new time limit');
                timeLimit = $(txtTimeLimit).val();
                popups.adjustTimeLimit.popup.modal('toggle');
            });

            this.popup.modal('show');
        },
    },
    successfulDocumentSave: {
        init: function () {
            $('#popupSuccessfulSave').show();
        }
    },
    saveNewInfo: {},
    errorMessage: {}
};


function getDataFromDatabase() {
    eel.getTemplates()(function (templates) {
        templates.forEach(function (row) {
            let temp_template = {};
            temp_template['id'] = row[0];
            temp_template['name'] = row[1];
            temp_template['description'] = row[2];
            arrTemplates.push(temp_template);
        });
        initializeAssessment();
    });

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
                    console.log('Number of Presentations: ' + presentations.length);
                    presentations.forEach(function (row) {
                        console.log(row[3]);
                        temp['presentations'].push(row[3]);
                    });
                });

                arrPresentations.push(temp);
            });
        });
    });
}

function getTemplateInfo() {
    var params = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        params[key] = value;
    });

    return params;
}

// TODO: Check if this can be DELETED
function initializeEvaluationPopup() {
    autocomplete(document.getElementById("txtStudentID"), arrStudentIDs);
    autocomplete(document.getElementById("txtCourse"), arrCourses);
    // TODO: Autocomplete for table fields doesn't work
    // Add autocomplete for table fields
    autocomplete(document.getElementsByClassName('tableStudentID')[0], arrStudentIDs);
    autocomplete(document.getElementsByClassName('tableCourse')[0], arrCourses);

    // Show popup, only when no need to show walkthrough
    var isShowedIntroEvaluation = Cookies.get("isShowedIntroEvaluation");
    if (isShowedIntroEvaluation) {
        $('#popupAddStudent').modal('show');
    }

    // When Show Additional Fields is clicked
    if (!linkAdditionalFieldsHasListener) {
        linkAdditionalFieldsHasListener = true;
        $('#linkShowAdditionalFields').click(function () {
            console.log('Showing additiona fields..');
            if ($('#linkShowAdditionalFields').hasClass('hidden')) {
                toggleAdditionalFields('Hidden');
            } else if ($('#linkShowAdditionalFields').hasClass('shown')) {
                toggleAdditionalFields('Shown');
            }
        });
    }


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
        getStudentName();
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

            getStudentName();

            let student_id = $('#txtStudentID').val();
            let student_name = $('#txtStudentName').val();
            let course = $('#txtCourse').val();
            let presentation = $('#txtPresentation').val();

            addHeaderDocument(student_id, student_name, course, presentation);

            // Set time limit
            console.log($('.txtTimeLimit').val());
            timeLimit = parseInt($('.txtTimeLimit').val());

            $('#popupAddStudent').modal('toggle');

            if (showSecondWalkthrough) {
                showSecondWalkthrough = false;
                setTimeout(walkthrough.secondWalkthrough, 500);
                showThirdWalkthrough = true;
            }


            // Start timer presentation
            timer.start();
        }
    });
}

function getStudentName() {
    // Find student name only if the ID is not empty and the student name has not been filled.
    if ($('#txtStudentID').val() != '' && $('#txtStudentName').val() == '') {
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
}

function getCurrentTemplateName() {
    let template_index = 0;

    for (i = 0; i < arrTemplates.length; i++) {
        if (template_id == arrTemplates[i]['id']) {
            console.log('getCurrentTemplateName template_index: ' + i);
            template_index = i;
            break;
        }
    }
    console.log('getCurrentTemplateName: ' + arrTemplates[template_index]['name']);

    return arrTemplates[template_index]['name'];
}

function normalizeScore(studentScore) {
    // Get perfect marks
    let perfectScore = $('.lblPerfectMarks').text();
    // Get intended normalized score
    let normalizedPerfectScore;
    let normalizer;
    let normalizedScore;

    if ($('#txtNormalizedScore').val() != '') {
        normalizedPerfectScore = $('#txtNormalizedScore').val();
    }

    normalizer = (perfectScore / normalizedPerfectScore).toFixed(2);

    console.log('Normalizer: ' + normalizer);

    normalizedScore = (studentScore / normalizer).toFixed(2);

    console.log('Normalized score: ' + normalizedScore);

    return normalizedScore;
}

function restrictKeyboardInput() {
    // Only number input for student ID input
    $("#txtStudentID, .tableStudentID").keypress(function (e) {
        var keyCode = e.which;
        /*
          8 - (backspace)
          32 - (space)
          48-57 - (0-9)Numbers
        */

        if ((keyCode != 8 || keyCode == 32) && (keyCode < 48 || keyCode > 57)) {
            return false;
        }
    });

    $("#txtStudentName, .tableStudentName").keypress(function (event) {
        var inputValue = event.which;
        // allow letters and whitespaces only.
        console.log(inputValue);
        if (!(inputValue >= 65 && inputValue <= 122) && (inputValue != 32 && inputValue != 0)) {
            event.preventDefault();
        }
    });
}

// TODO: Check if this can be DELETED
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
    $('.tableCourse').val(course);
    // Add the course code which is hidden
    $('.document-header .tableCourseCode').val(course);


}

var walkthrough = {
    firstWalkthrough: function () {
        var intro = introJs();
        intro.setOptions({
            steps: [
                {
                    intro: "Welcome to the assessment page!"
                },
                {
                    intro: "This is where you'll make your evaluations."
                },
                {
                    element: document.querySelector('.firstGuide.stepOne'),
                    intro: "You only need the student ID to start."
                },
                {
                    element: document.querySelectorAll('.firstGuide.stepTwo')[0],
                    intro: "If you want to add more fields, click here.",
                    position: 'right'
                },
                {
                    element: document.querySelectorAll('.firstGuide.stepThree')[0],
                    intro: "When you're ready to evaluate, click this button." +
                        "<br /><span class='small text-info text-center'>Note: This will start the timer.</span>",
                    position: 'right'
                },
            ],
            showStepNumbers: false,
            hidePrev: true,
            hideNext: true,
            skipLabel: 'Skip',
            exitOnOverlayClick: false,
            doneLabel: 'Got it'
        });
        intro.start();
    },
    secondWalkthrough: function () {
        var intro = introJs();
        intro.setOptions({
            steps: [
                {
                    intro: "Before you evaluate, let's get to know the menu buttons first."
                },
                {
                    element: document.querySelector('.secondGuide.stepOne'),
                    intro: "This brings you back to the main page."
                },
                {
                    element: document.querySelectorAll('.secondGuide.stepTwo')[0],
                    intro: "If you want to change the template, click this.",
                    position: 'right'
                },
                {
                    intro: "We'll get to templates later."
                },
                {
                    element: document.querySelectorAll('.secondGuide.timerStep')[0],
                    intro: "This shows the timer's settings.",
                    position: 'bottom-middle-aligned'
                },
                {
                    element: document.querySelectorAll('.secondGuide.stepThree')[0],
                    intro: "This is the score board.",
                    position: 'bottom-middle-aligned'
                },
                {
                    element: document.querySelectorAll('.secondGuide.stepThree')[0],
                    intro: "This is an on-the-go calculation of your evaluation scores.",
                    position: 'bottom-middle-aligned'
                },
                {
                    element: document.querySelectorAll('.secondGuide.stepFour')[0],
                    intro: "This is your document header. This will appear at the top-most of your Word document",
                    position: 'right'
                },
                {
                    element: document.querySelectorAll('.secondGuide.stepFour')[0],
                    intro: "<em>Hint: You can change the values if you need to.</em>",
                    position: 'right'
                },
                {
                    intro: "Click on a description cell to give a score for a criterion."
                }
            ],
            showStepNumbers: false,
            hidePrev: true,
            hideNext: true,
            skipLabel: 'Skip',
            exitOnOverlayClick: false,
            doneLabel: 'Got it'
        });
        intro.start();
        introJs.fn.oncomplete(function () {
            // Set localStorage so that walkthrough only appears once
            localStorage.setItem('finishedWalkthrough', true);
        });
    },
    thirdWalkthrough: function () {
        var intro = introJs();
        intro.setOptions({
            steps: [
                {
                    intro: "You've added new school records!"
                },
                {
                    element: document.querySelectorAll('.thirdGuide.stepOne')[0],
                    intro: "These will be saved in the database and can be accessed in the future.",
                    position: 'right'
                },
                {
                    element: document.querySelectorAll('.thirdGuide.stepTwo')[0],
                    intro: "To save the new information, click this."
                },
                {
                    element: document.querySelectorAll('.thirdGuide.stepThree')[0],
                    intro: "If you're sure you won't need this information, click this."
                },
            ],
            showStepNumbers: false,
            hidePrev: true,
            hideNext: true,
            skipLabel: 'Skip',
            exitOnOverlayClick: false,
            doneLabel: 'Got it'
        });
        intro.start();
    },
    // FIX: This isn't showing since the btnNextStudent reloads the page and by that time it has registered that the user is done with the walkthrough
    fourthWalkthrough: function () {
        var intro = introJs();
        intro.setOptions({
            steps: [
                {
                    intro: "Congratulations on finishing your first evaluation!"
                },
                {
                    intro: "It's time to learn about Templates!"
                },
                {
                    element: document.querySelectorAll('.fourthGuide.stepOne')[0],
                    intro: "Click this button to get started.",
                    position: 'left'
                }
            ],
            showStepNumbers: false,
            hidePrev: true,
            hideNext: true,
            skipLabel: 'Skip',
            exitOnOverlayClick: false
        });
        intro.start();
    }
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
        tableAssessGroup.init();
    },
    enableSaveButton: function (results, template) {
        this.saveButton.click(function (e) {
            console.log('Clicked save button');
            var that = this;

            // Check if all fields are checked before generating a document 
            let allAssessmentChecked;

            allAssessmentChecked = tableAssessGroup.checkOptions();

            if (allAssessmentChecked) {

                let newInfo = assessment.checkForNewInformation();
                assessment.addHeaderInfo();
                assessment.calculateScores();

                if (jQuery.isEmptyObject(newInfo)) {
                    // Proceed to creating document
                    console.log('newInfo is empty');
                    assessment.createAssessmentDocument();
                } else {

                    if (newInfo.hasOwnProperty('error')) {
                        console.log(newInfo['error']);
                        return;
                    }

                    let newInfoHTML = '<p>You have inputted new information. Would you like to save these info to the database?</p>';
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

                    if (showThirdWalkthrough) {
                        showThirdWalkthrough = false;
                        walkthrough.thirdWalkthrough();
                        showFourthWalkthrough = true;
                    }

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
                        console.log('Discard button clicked');
                        console.log(assessment.template);
                        $('#popupSaveNewInfo').modal('toggle');
                        assessment.createAssessmentDocument();
                    });
                }

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

        let minuteDuration = parseInt($('#lblMinutes').text());
        let secondDuration = parseInt($('#lblSeconds').text());
        let durationText = '';

        console.log('Minute duration: ' + parseInt($('#lblMinutes').text()));
        console.log('Minute duration: ' + parseInt($('#lblSeconds').text()));

        if (minuteDuration > 0) {
            if (minuteDuration == 1) {
                durationText += minuteDuration + ' minute';
            } else {
                durationText += minuteDuration + ' minutes';
            }
        }

        if (minuteDuration > 0 && secondDuration > 0) {
            durationText += ' and ';
        }

        if (secondDuration > 0) {
            if (secondDuration == 1) {
                durationText += secondDuration + ' second';
            } else {
                durationText += secondDuration + ' seconds';
            }
        }

        assessment.header_info['presentationDuration'] = durationText;
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

        let header_info = assessment.header_info;
        // Stop timer
        timer.stop();

        // Check if user checked Normalize scores
        if ($('#checkNormalizeScore').prop('checked')) {
            console.log('Normalize scores enabled');
            assessment.results['normalizedScore'] = normalizeScore(parseInt(assessment.results['assessmentTotalScore']));
            assessment.results['normalizedPerfectScore'] = $('#txtNormalizedScore').val();
        } else {
            assessment.results['normalizedScore'] = ''
        }

        console.log(header_info);
        eel.createAssessmentResultDocument(header_info, assessment.results, template_id, false)().then(function () {
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
            .catch(function (error) {
                console.log(error)
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
            return { 'error': 'Student ID is missing' };
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

    // Set the perfect marks in the Calculate Menu button
    $('.lblPerfectMarks').html(assessment.scoreCriteria['totalPossibleScore']);

    headerScoreContainer.html(scoreCardsHTML);
}


function autocomplete(inp, arr) {
    /*the autocomplete function takes two arguments,
    the text field element and an array of possible autocompleted values:*/
    var currentFocus;
    if (!inp ) {
        return;
    }
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
    /*execute a function when someone clicks in the document:*/
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
}