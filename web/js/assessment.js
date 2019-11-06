/*
    assessment.js

    File description: Contains functions related to assessment and navigation of assessment.html

    TODO:
    In initiliazeSelect, values are hard-coded. Make this dynamic.
    Create a way to store course, presentation and student information directly to database from the assessment page.
*/

$(document).ready(function(){
    let template_id = 2;

    console.log('In Assessment');

    // Show popup
    $('#popupAddStudent').modal('show');

    // When Show Additional Fields is clicked
    $('#linkShowAdditionalFields').click(function(){
        if($('#linkShowAdditionalFields').hasClass('hidden')){
            toggleAdditionalFields('Hidden');
        } else if($('#linkShowAdditionalFields').hasClass('shown')){
            toggleAdditionalFields('Shown');
        }
    });

    // When Evaluate button from popup is clicked
    $('#btnEvaluate').click(function(){
        
        // Check if student ID was inputted
        // Only the student ID is required
        if($('#txtStudentID').val() === ''){
            $('#txtStudentID').css({'border-bottom': '1px solid red'});
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

    $('.labeled-input-group input').blur(function(){
        if($('.labeled-input-group input').val() != ''){

            $(this).next().css({'top':'-18px', 'color':'black', 'font-size':'12px'});
        }
    });


    // Student ID input event
    $('#txtStudentID').on('change', function(){
        console.log('Changed');
        if($('#txtStudentID').val() === ''){
            $('#txtStudentID').css({'border-bottom': '1px solid grey'});
            $(this).next.css('color', 'black');
            $(this).next().text('Student ID');
        }
    });

    // When user wants to open recently created document
    $('#linkOpenDocument').click(function(){
        console.log('Link to open document is clicked');
        eel.openDocument(assessment.documentName)(function(){
            console.log('Document opened');
        });
    });

        //TODO: Store values for adding to database


    createTemplateTable(template_id);
});


function toggleAdditionalFields(status){
    if(status === 'Hidden'){
        $('#linkShowAdditionalFields').text("Hide additional fields");
        $('#linkShowAdditionalFields').removeClass('hidden');
        $('#linkShowAdditionalFields').addClass('shown');

        $('.hidden-fields-container').show(500);
    } else if (status === 'Shown'){
        $('#linkShowAdditionalFields').text("Show additional fields");
        $('#linkShowAdditionalFields').removeClass('shown');
        $('#linkShowAdditionalFields').addClass('hidden');

        $('.hidden-fields-container').hide(500);
    }
}

function addHeaderDocument(student_id, student_name, course, presentation){
    console.log('Adding header document...');

    /* Add the document header containing student and assessment information */

    $('.tableStudentID').val(student_id);
    $('.tableStudentName').val(student_name);
    $('.tablePresentation').val(presentation);
}

var assessment = {
    /* DOM elements */
    saveButton: $('.btnSaveDocument'),
    /* Data objects*/
    results: {},
    scoreCriteria: {},  // { groupCriteria: [{ name, possibleScore, iconClass }, ...], totalPossibleScore: }
    documentName: '',
    template: {},
    /* Functions */
    init: function(){
        this.initializeSelect()
    },
    initializeSelect: function(){
        let that = this;

		$('td').click(function(e){
            
			$(e.target).parent().removeClass("table-danger");
			let score = $(e.target).attr('data-score');
            let type = $(e.target).attr('data-type');
            let value = $(e.target).attr('data-value');
            let classname = "";
            let tmp = type.split('.')
            
            if( value == 'Excellent'){
                classname = "table-success";
            } else if ( value == 'Good'){
                classname = "table-primary";
            } else if( value == 'Fair'){
                classname = "table-warning";
            } else if( value == 'Poor'){
                classname = "table-danger";
            }
            
			$('td[data-type="' + type + '"]').removeClass();
            $(e.target).addClass(classname);
            
			assessment.results['groupCriteria'][tmp[0]]["criteria"][tmp[1]] = score;

            // Update assessment scores
            let groupTotalScore = 0;
            let criteria = assessment.results['groupCriteria'][tmp[0]]["criteria"];

            for(var key in criteria){
                /* Checks if the field has been selected. Else, ignore. */
                if(criteria[key] >= 0){
                    groupTotalScore += parseInt(criteria[key]);
                }
            }
                        
             that.results['groupCriteria'][tmp[0]]['groupTotalScore'] = groupTotalScore;
            // let currentAssessmentTotalScore = parseInt(that.results['assessmentTotalScore']);

            // that.printAssessmentJSON();

            assessment.updateAssessmentScoresUI(tmp[0], groupTotalScore);
        });
    },
    updateAssessmentScoresUI: function(type, score){
        /* This is only to update the scores in the user interface */
        
        // Updating the individual score cards
        $('.' + type).text(score);

        // Update score card color based on percentage
        // 50% below is red, 50% and above but below 74% is yellow, 75% above is green
        let scorePercentage;

        if(score > 0){
            scorePercentage = score / assessment.scoreCriteria["groupCriteria"][type]["possibleTotalScore"] * 100;
        }

        if(scorePercentage < 50){
            $('.' + type).parent('.small-score-card').css({'background': '#ff8686', 'color': '#a90000'});
        } else if(scorePercentage >= 50 && scorePercentage < 74){
            $('.' + type).parent('.small-score-card').css({'background': '#fff086', 'color': '#a9a400'}); 
        } else if(scorePercentage >= 75){
            $('.' + type).parent('.small-score-card').css({'background': '#88ff86', 'color': '#00a90d'});
        }
        

        // Update the total of score cards
        let totalScore = 0;
        let groupCriteria = assessment.results.groupCriteria;

        for(var key in groupCriteria){
            totalScore += groupCriteria[key]["groupTotalScore"];
        }

        $('.total_score').text(totalScore);

        if(totalScore > 0) // Prevent dividing by zero
        {
            scorePercentage = totalScore / assessment.scoreCriteria["totalPossibleScore"] * 100;
        }

        if(scorePercentage < 50){
            $('.total_score').parent('.small-score-card').css({'background': '#ff8686', 'color': '#a90000'});
        } else if(scorePercentage >= 50 && scorePercentage < 74){
            $('.total_score').parent('.small-score-card').css({'background': '#fff086', 'color': '#a9a400'}); 
        } else if(scorePercentage >= 75){
            $('.total_score').parent('.small-score-card').css({'background': '#88ff86', 'color': '#00a90d'});
        }
    },
    checkOptions: function() {
        var that = this;
        
        console.log('Checking if criteria are selected...');

		for (category in assessment.results['groupCriteria'] ) {
			for ( subcate in assessment.results['groupCriteria'][category]['criteria'] ) {
				if ( assessment.results['groupCriteria'][category]['criteria'][subcate] < 0 ) {
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
    enableSaveButton: function(results, template){
        this.saveButton.click(function(e){
            var that = this;

            // Check if all fields are checked before generating a document 
            let allAssessmentChecked = assessment.checkOptions();

            if(allAssessmentChecked){

                let header_info = {};
                header_info['studentName'] = $('.tableStudentName').val();;
                header_info['studentId'] = $('.tableStudentID').val();
                header_info['presentationTopic'] = $('.tablePresentation').val();

                console.log('Header Info: ' + header_info);

                let today = new Date();
                let formatted_date = today.getDate() + "-" + today.getMonth() + "-" + today.getFullYear();
                header_info['presentationDate'] = formatted_date;

                console.log('Clicked save button');

                // Calculate total score from results JSON object

                let totalScore = 0;

                for(var group in assessment.results['groupCriteria']){
                    totalScore += assessment.results['groupCriteria'][group].groupTotalScore;
                }

                let possibleTotalScore = 0;

                for(var group in assessment.results['groupCriteria']){
                    possibleTotalScore += assessment.results['groupCriteria'][group].groupPossibleTotalScore;
                }

                results['assessmentTotalScore'] = totalScore;
                results['assessmentPossibleTotalScore'] = possibleTotalScore;

                let scorePercentage = totalScore / possibleTotalScore * 100;
                results['scorePercentage'] = scorePercentage.toFixed(2);

                console.log(results);

                eel.createAssessmentResultDocument(header_info, results, template, false)().then(function(){
                    // Show popup
                    $('#popupSuccessfulSave').modal('show');
                    
                    // Store document name
                    // TODO: This code is redundant to the one in main.py. Optimise this.
                    if(header_info['studentName'] === ''){
                        assessment.documentName = header_info['studentId'] + ' (' + header_info['presentationDate'] + ')';
                    } else {
                        assessment.documentName = header_info['studentName'] + ' - ' + header_info['studentId'] + ' (' + header_info['presentationDate'] + ')';
                    }
                
                    console.log('Successfully created document.');
                })
                .catch(function(){

                });
            }
        });
    },
    printAssessmentJSON: function(){
        var that = this;
        console.log(that.results);
    }
};

function createScoreCards(){
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

function createTemplateTable(template_id){

    eel.getTemplateJSON(template_id)().then(function(templateJSON){
        /* Organize the JSON object */
        let template = JSON.parse(templateJSON);
       console.log('Creating template...');

        let templateHTML = '';
        let group_keys = {}; 
        let group_score_keys = {};
        
        let totalPossibleScore = 0;

        /* For each group criterion, create a table */
        /* Developer's Notes: i is for groupCriteria, j is for first criterion fields, k is for criteria */
        for(var i = 0; i < template.groupCriteria.length; i++){
            let groupCriteria = template.groupCriteria;

            let htmlTable = '<table class="table">';
            /* Table Headers containing group criterion's name */
            htmlTable += '<thead><tr>';
            htmlTable += '<th scope="col" width="12%">' + groupCriteria[i].name + '</th>';

            let first_criterion_fields = groupCriteria[i].criteria[0].fields;

            /* Add value and points in header */
            for(var j = 0; j < first_criterion_fields.length; j++){
                htmlTable += '<th scope="col" width="22%">' + first_criterion_fields[j].points 
                + " - " + first_criterion_fields[j].value + '</th>';
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

            for(var k = 0; k < groupCriteria[i].criteria.length; k++){

                let criteria = groupCriteria[i].criteria;
                
                /* Take the first word of criterion, add _ and then the criterion's id */
                temp_words = criteria[k].name.split(" ");
                let data_type_criterion = temp_words[0].toLowerCase() + "_" + criteria[k].id;

                criteria_keys[data_type_criterion] = -1; /* Initialize results. */

                let data_type = data_type_group + '.' + data_type_criterion;

                htmlTable += '<tr data-type="' + data_type + '"><th>' + criteria[k].name + '</th>';

                /* Add fields' descriptions */
                for(var l = 0; l < criteria[i].fields.length; l++){
                    let fields = criteria[k].fields;
                    htmlTable += '<td data-score="' + fields[l].points + '" data-type="' + data_type + '" data-value="' + fields[l].value + '">' 
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