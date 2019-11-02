/*
    assessment.js

    File description: Contains functions related to assessment and navigation of assessment.html
*/

$(document).ready(function(){
    let template_id = 1;

    console.log('In Assessment');
    createTemplateTable(template_id);
    
});

var assessment = {
    /* DOM elements */
    saveButton: $('#btnSaveDocument'),
    /* Data objects*/
    results: {},
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
			let classname = "";
			if ( score == 4 ) {
				classname = "table-success";
			} else if ( score == 3 ) {
				classname = "table-primary";
			} else if ( score == 2 ) {
				classname = "table-warning";
			} else if ( score == 1 ) {
				classname = "table-danger";
            } 
            
			$('td[data-type="' + type + '"]').removeClass();
            $(e.target).addClass(classname);
            
			let tmp = type.split('.')
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
        });
    },
    updateAssessmentScoresUI: function(){
        /* This is only to update the scores in the user interface */
    },
    checkOptions: function() {
		var that = this;
		for (category in assessment.results['groupCriteria'] ) {
			for ( subcate in assessment.results['groupCriteria'][category] ) {
                console.log('Checking: ' + assessment.results['groupCriteria'][category]['criteria'][subcate]);
				if ( assessment.results['groupCriteria'][category]['criteria'][subcate] < 0 ) {
					var tmp = $('tr[data-type="' + category + '.' + subcate + '"]');
					tmp.addClass("table-danger");
					$('body, html').animate({
						scrollTop: tmp.offset().top
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
                header_info['studentName'] = 'Farrah';
                header_info['studentId'] = '09185533';
                header_info['presentationTopic'] = 'The Era of UX Designing';

                let today = new Date();
                let formatted_date = today.getDate() + "-" + today.getMonth() + "-" + today.getFullYear();
                header_info['presentationDate'] = formatted_date;

                console.log('Clicked save button');

                // Calculate total score from results JSON object

                let totalScore = 0;

                for(var group in assessment.results['groupCriteria']){
                    console.log(assessment.results['groupCriteria'][group].groupTotalScore);
                    totalScore += assessment.results['groupCriteria'][group].groupTotalScore;
                }

                let possibleTotalScore = 0;

                for(var group in assessment.results['groupCriteria']){
                    console.log(assessment.results['groupCriteria'][group].groupPossibleTotalScore);
                    possibleTotalScore += assessment.results['groupCriteria'][group].groupPossibleTotalScore;
                }

                results['assessmentTotalScore'] = totalScore;
                results['assessmentPossibleTotalScore'] = possibleTotalScore;

                let scorePercentage = totalScore / possibleTotalScore * 100;
                results['scorePercentage'] = scorePercentage.toFixed(2);

                console.log(results);

                eel.createAssessmentResultDocument(header_info, results, template, false)(function(){
                    console.log('Successfully created document.');
                });
            }
        });
    },
    printAssessmentJSON: function(){
        var that = this;
        console.log(that.results);
    }
};

function createTemplateTable(template_id){

    let templateJSON = eel.getTemplateJSON(template_id)(function (templateJSON){
        /* Organize the JSON object */
        let template = JSON.parse(templateJSON);
       console.log('Creating template...');

        let templateHTML = '<h2>' + template.name + '</h2><br />';
        let group_keys = {}; 

        /* For each group criterion, create a table */
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
                    htmlTable += '<td data-score="' + fields[l].points + '" data-type="' + data_type + '">' 
                    + fields[l].description + '</td>';
                }

                possible_total_score += criteria[i].fields[0].points; // Get highest possible points

                htmlTable += '</tr>';
            }


            temp_keys["groupTotalScore"] = 0;
            temp_keys["groupPossibleTotalScore"] = possible_total_score;
            temp_keys["criteria"] = criteria_keys;
            
            group_keys[data_type_group] = temp_keys;
           
            htmlTable += '</table><br />';

            templateHTML += htmlTable;
        }

        assessment.results['groupCriteria'] = group_keys;

        $('.template-container').html(templateHTML);

        assessment.init();
        assessment.enableSaveButton(assessment.results, template.id);
    });

}