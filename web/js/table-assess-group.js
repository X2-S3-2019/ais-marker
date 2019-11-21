/*
    table-assess.js

    File description: Contains functions related manipulating UI components in table assess
*/

var tableAssessGroup = {
    selectUserModal: $("#popupSelectStudent"),
    modalSelect: $("#saveSelectStudent"),
    modalCancel: $("#canelSelectStudent"),
    modalContent: $("#studentsOptions"),
    groupData: {},
    scoreData: {}, // {"1": result } ,
    currentCell: null,
    init: function(){
        var that = this;
        this.modalCancel.click(function() {
            that.selectUserModal.modal("hide");
        });
        this.modalSelect.click(function() {
            var selectedIds = [];
            that.modalContent.find("input[type=checkbox]:checked").each(function(index, item) {
                selectedIds.push($(item).val());
            });
            that.updateAssessmentScoreObject(selectedIds, that.currentCell);
        });
        this.initializeSelect();
    },
    generateModalContent: function(e) {
        var that = this;
        var groupData = groupUser.getGroupData();
        var members = groupData.members;
        if ( members.length === 0 ) {
            return;
        }
        this.groupData = groupData;
        let score = $(e.target).attr('data-score');
        let type = $(e.target).attr('data-type');
        let value = $(e.target).attr('data-value');
        let tmp = type.split('.')
        this.modalContent.html("");
        for ( key in members ) {
            var student = members[key];
            var html = '<p>' + 
                '<input type="checkbox" name="students" value=' + student.id + ' ';
            if ( that.scoreData[student.id] && that.scoreData[student.id]["groupCriteria"][tmp[0]] && that.scoreData[student.id]["groupCriteria"][tmp[0]]["criteria"] &&  that.scoreData[student.id]["groupCriteria"][tmp[0]]["criteria"][tmp[1]] == score) {
                html += "checked ";
            }
            html += '>' +
                '&nbsp;&nbsp;(' + student.id + ') StudentID: ' + student.studentId + '; StudentName: ' + student.studentName + ';' +
            '</p>';
            that.modalContent.append(html);
        }
        this.selectUserModal.modal('show');
    },
    createTemplateTable: function(template_id) {
        // Remove emoji-specific styles 
        $('body').removeClass('emoji');

        // Add MS word feel
        $('.template-container').addClass('ms-word-style');

        eel.getTemplateJSON(template_id)().then(function (templateJSON) {
            /* Organize the JSON object */
            let template = JSON.parse(templateJSON);
            console.log('Creating template...');
            console.log(template);
    
            let templateHTML = '';
            let group_keys = {};
            let group_score_keys = {};
    
            let totalPossibleScore = 0;
    
            /* For each group criterion, create a table */
            /* Developer's Notes: i is for groupCriteria, j is for first criterion fields, k is for criteria, l is for fields */
            for (var i = 0; i < template.groupCriteria.length; i++) {
                let groupCriteria = template.groupCriteria;
    
                $('.assessment-container').data('id', template.id);
                $('.assessment-container').data('name', template.name);
    
                let htmlTable = '<table class="table disabled-highlight-table">';
                /* Table Headers containing group criterion's name */
                htmlTable += '<thead><tr>';
                htmlTable += '<th scope="col" width="12%" data-name="' + groupCriteria[i].name.replace(/["]/g, '') + '" data-id="' + groupCriteria[i].id + '">' + groupCriteria[i].name + '</th>';
    
                let first_criterion_fields = groupCriteria[i].criteria[0].fields;
    
                /* Add value and points in header */
                for (var j = 0; j < first_criterion_fields.length; j++) {
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
    
                    // console.log('Index: ' + k + ' - ' + criteria[k].fields.length);
                    /* Add fields' descriptions */
                    for (var l = 0; l < criteria[k].fields.length; l++) {
                        let fields = criteria[k].fields;
    
    
                        htmlTable += '<td data-score="' + fields[l].points + '" data-type="' + data_type + '" data-value="'
                            + fields[l].value + '" data-id="' + fields[l].id + '" data-name="' + fields[l].name + '">'
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
            console.log('Value of walkthrough ' + localStorage.getItem('finishedWalkthrough'));
            if (localStorage.getItem('finishedWalkthrough') == null) {
                walkthrough.firstWalkthrough();
                showSecondWalkthrough = true;
            }
        });
    },
    initializeSelect: function(){   // Initializes the selection of table cells
        let that = this;
        $('.template-container').find("td[data-score]").mousedown(function (e) {
            var status = groupUser.finishGroupEditing();
            if ( status === true ) {
                that.generateModalContent(e);
                that.currentCell = e;
            }
        });
    },
    updateAssessmentScoreObject: function (selectedIds, e) {
        $(e.target).parent().removeClass("table-active");
        let score = $(e.target).attr('data-score');
        let type = $(e.target).attr('data-type');
        let value = $(e.target).attr('data-value');
        let classname = "";
        if ( !score || !type || !value) {
            return;
        }
        let tmp = type.split('.')
        for ( var k =0; k < selectedIds.length; k ++) {
            var id = selectedIds[k];
            var results = this.scoreData[id];
            if ( !results ) {
                results = $.extend(true, {}, assessment.results);
            }
            results['groupCriteria'][tmp[0]]["criteria"][tmp[1]] = score;
            let groupTotalScore = 0;
            let criteria = results['groupCriteria'][tmp[0]]["criteria"];
            for (var key in criteria) {
                /* Checks if the field has been selected. Else, ignore. */
                if (criteria[key] >= 0) {
                    groupTotalScore += parseInt(criteria[key]);
                }
            }
            results['groupCriteria'][tmp[0]]['groupTotalScore'] = groupTotalScore;
            this.scoreData[id] = results;

            // change text of the cell.
            $(e.target).parent().children().each(function(index, item) {
                let text = $(item).text();
                text = text.replace("("+id+")", "");
                $(item).text(text);
            });
            let text = $(e.target).text() + "("+id+")";
            $(e.target).text(text);
        }
        // console.log('====', selectedIds, '====');
        // console.log('====', this.currentCell, '====');
        // console.log('====', this.scoreData, '====');
        // this.updateAssessmentScoresUI(tmp[0], groupTotalScore);
        this.selectUserModal.modal("hide");


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

        // if (scorePercentage < 50) {
        //     $('.' + type).parent('.small-score-card').css({ 'background': '#ff8686', 'color': '#a90000' });
        // } else if (scorePercentage >= 50 && scorePercentage < 74) {
        //     $('.' + type).parent('.small-score-card').css({ 'background': '#fff086', 'color': '#a9a400' });
        // } else if (scorePercentage >= 75) {
        //     $('.' + type).parent('.small-score-card').css({ 'background': '#88ff86', 'color': '#00a90d' });
        // }

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
        var groupResuts = tableAssessGroup.scoreData;
        var groupData = groupUser.getGroupData();
        if ( groupData.members.length > groupResuts.length ) {
            alert('At least one of the student\'s evaluation is not finished yet.');
            return false;
        }
        for ( id in groupResuts ) {
            for (category in groupResuts[id]['groupCriteria']) {
                console.log(category);
                for (subcate in groupResuts[id]['groupCriteria'][category]['criteria']) {
                    console.log(groupResuts[id], category, subcate);
                    console.log(groupResuts[id]['groupCriteria'][category]['criteria'][subcate]);
                    if (groupResuts[id]['groupCriteria'][category]['criteria'][subcate] < 0) {
                        var tmp = $('tr[data-type="' + category + '.' + subcate + '"]');
                        tmp.addClass('table-active');
                        let offset = tmp.offset().top - 55;
                        $('body, html').animate({
                            scrollTop: offset
                        });
                        return false;
                    }
                }
            }
        }
        return true;
    },
};