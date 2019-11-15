var template_info;
var template_id;
var btnEditScoreBtnHack = false;
var showSecondWalkthrough = false;
var showThirdWalkthrough = false;

$(document).ready(function () {
    template_info = getTemplateInfo();

    $('.header-template-name').html(decodeURI(template_info['template_name']));

    createTemplateTable(template_info['template_id'])

    // Bring label from placeholder position to top when there's value
    $('.labeled-input-group input').blur(function () {
        if ($('.labeled-input-group input').val() != '') {
            $(this).next().css({ 'top': '-18px', 'color': 'black', 'font-size': '12px' });
        }
    });

    // Edit button for editing score system is clicked
    $('body').on('click', 'thead .tabledit-toolbar-column button', function () {
        // Hack to force introJS to exit when button is clicked
        if(btnEditScoreBtnHack){
            introJs().exit();
            btnEditScoreBtnHack = false;
            showSecondWalkthrough = true;
        }
        console.log('Edit header clicked');
        let name = $(this).parents('table').attr('id');
        $('#popupEditScoreSystem').modal('show');
        $('#txtGroupCriterionID').val(name);
        console.log('Group Criterion: ' + name);
        // Set values of popupEditScoreSystem
        let selectedScoreSystem = JSON.parse(localStorage.getItem('selectedScoreSystem'));
        console.log(selectedScoreSystem);
        
        if(showSecondWalkthrough){
            showSecondWalkthrough = false;
            setTimeout(editWalkthrough.secondWalkthrough, 500);
        }

        
    });

    $('.radio-dropdown').change(function () {

        $('.div-dropdown').slideUp();
        if ($(this).is(':checked')) {
            $(this).parent().next().slideToggle("normal");
        }
        calculateNewScores();
    });

    $('#btnApply').on('click', function () {
        var selectedSystem = {};
        selectedSystem['radioID'] = $('input[name=rdoGroupScoreSystem]:checked').attr('id');
        if (selectedSystem['radioID'] === "rdoCalculated") {
            console.log('Calculated score');

            // Check if user wants to apply scoring system to all criteria
            console.log('checkApplyAll is ' + $('#checkApplyAllScores').prop('checked'));
            if($('#checkApplyAllScores').prop('checked')){
                console.log('Checked apply to all');
                applyScoresToTable(true);
            } else {
                applyScoresToTable(false);
            }
        } else {
            // Check validity of custom scores
            let excellentScore = parseInt($('.preview-text.excellentScore').html());
            let goodScore = parseInt($('.preview-text.goodScore').html());
            let fairScore = parseInt($('.preview-text.fairScore').html());
            let poorScore = parseInt($('.preview-text.poorScore').html());
            let valid = true;

            $('.score-error').hide();
            console.log(excellentScore + ' < ' + goodScore + ' < ' + fairScore + ' < ' + poorScore);

            if (excellentScore <= goodScore) {
                $('.score-error.excellentScore').show();
                valid = false;
            }
            if (goodScore <= fairScore) {
                $('.score-error.goodScore').show();
                valid = false;
            }
            if (fairScore <= poorScore) {
                $('.score-error.fairScore').show();
                valid = false;
            }

            if (valid) {
                console.log('Checkbox is checked: ' + $('#checkApplyAllScores').prop('checked'));
                // Check if user wants to apply scoring system to all criteria
                if($('#checkApplyAllScores').is(':checked')){
                    applyScoresToTable(true);
                } else {
                    applyScoresToTable(false);
                }
                
                // Summon the third and final walkthrough
                if(showThirdWalkthrough){
                    showThirdWalkthrough = false;
                    setTimeout(editWalkthrough.thirdWalkthrough, 500);
                }
            }
        }

        localStorage.setItem('selectedScoreSystem', JSON.stringify(selectedSystem));
    });

    $('input[type="number"]').change(function () {

        let calculated = false;
        if ($('#rdoCalculated').is(':checked')) {
            calculated = true;
        }
        calculateNewScores(calculated);
    });

    $('#btnUseTemplate').click(function () {
        window.location.replace('assessment.html?template_id=' + template_id);
    });
});

var editWalkthrough = {
    firstWalkthrough: function () {
        btnEditScoreBtnHack = true;
        var intro = introJs();
        intro.setOptions({
            steps: [
                {
                    intro: "Welcome to Editing Mode!"
                },
                {
                    intro: "You can edit templates to modify scoring system or change the criteria."
                },
                {
                    element: document.querySelectorAll('.firstGuide.stepOne')[0],
                    intro: "To change the scoring system, click this button.",
                }
            ],
            showStepNumbers: false,
            hidePrev: true,
            hideNext: true,
            skipLabel: 'Skip',
            exitOnOverlayClick: true,
            doneLabel: 'Got it'
        });
        intro.start();
    },
    secondWalkthrough: function () {
        var intro = introJs();
        intro.setOptions({
            steps: [
                {
                    element: document.querySelectorAll('.secondGuide.stepOne')[0],
                    intro: "You can choose to use calculated scores."
                },
                {
                    element: document.querySelectorAll('.secondGuide.stepTwo')[0],
                    intro: "Or customize your own scores."
                },
                {
                    element: document.querySelectorAll('.secondGuide.stepThree')[0],
                    intro: "The preview allows you to check your scores.",
                },
                {
                    element: document.querySelectorAll('.secondGuide.stepFour')[0],
                    intro: "If you want this scoring system to be applied to all criteria, tick the checkbox.",
                },
                {
                    element: document.querySelectorAll('.secondGuide.stepFive')[0],
                    intro: "When you're happy with the new scoring system, click Apply.",
                }
            ],
            showStepNumbers: false,
            hidePrev: true,
            hideNext: true,
            skipLabel: 'Skip',
            doneLabel: 'Got it'
        });
        intro.start();
        showThirdWalkthrough = true;
    },
    thirdWalkthrough: function () {
        var intro = introJs();
        intro.setOptions({
            steps: [
                {
                    element: document.querySelectorAll('.thirdGuide.stepOne')[0],
                    intro: "Click this button to edit the criterion's name."
                },
                {
                    element: document.querySelectorAll('.thirdGuide.stepTwo')[0],
                    intro: "Click this to edit the fields."
                },
                {
                    element: document.querySelectorAll('.thirdGuide.stepThree')[0],
                    intro: "Click this to delete the criterion."
                },
                {
                    element: document.querySelectorAll('.thirdGuide.stepFour')[0],
                    intro: "Click this to add a new criterion."
                },
                {
                    element: document.querySelectorAll('.thirdGuide.stepFive')[0],
                    intro: "Once you've finished editing the template, click this."
                },
                {
                    intro: "<div class='text-center'><h5>Congratulations!</h5>You've reached the end of the tutorial.<br /><b>Happy evaluating!</b></div>"
                }
            ],
            showStepNumbers: false,
            hidePrev: true,
            hideNext: true,
            skipLabel: 'Skip',
            scrollToElement: true,
            doneLabel: 'Yay!'
        });
        intro.start();
        introJs.fn.oncomplete(function() {
            // Set localStorage so that walkthrough only appears once
            localStorage.setItem('finishedTemplateWalkthrough', true);
        });
    }
};

function applyScoresToTable(applyToAll = false) {
    let groupCriterion = $('#txtGroupCriterionID').val();
    let tableSelection = '';
    console.log('ApplyToAll is ' + applyToAll);

    if(applyToAll){
        tableSelection = 'table'
    } else {
        tableSelection = '#' + groupCriterion;
    }

    // Append score to header
    $(tableSelection + ' thead tr th .tabledit-span').each(function (index) {
        console.log(tableSelection);
        // console.log($(this).parent().attr('data-point-name') + ' with score ' + $(this).parent().attr('data-points') + ' index: ' + index);
        let data_point_name = $(this).parent().attr('data-point-name');
        let score = $('.preview-text.' + data_point_name.toLowerCase() + 'Score').html();
        // Change the data values
        $(this).parent().attr('data-points', score);
        // Change the text
        $(this).html(score + ' - ' + data_point_name);
    });

    // Append score to table body (fields)
    let excellentScore = $('.preview-text.excellentScore').html();
    let goodScore = $('.preview-text.goodScore').html();
    let fairScore = $('.preview-text.fairScore').html();
    let poorScore = $('.preview-text.poorScore').html();

    // Update Excellent score
    $(tableSelection + ' tbody tr td[data-value="Excellent"]').each(function (index) {
        $(this).attr('data-score', excellentScore);
    });
    // Update Good score
    $(tableSelection + ' tbody tr td[data-value="Good"]').each(function (index) {
        $(this).attr('data-score', goodScore);
    });
    // Update Fair score
    $(tableSelection + ' tbody tr td[data-value="Fair"]').each(function (index) {
        $(this).attr('data-score', fairScore);
    });
    // Update Poor score
    $(tableSelection + ' tbody tr td[data-value="Poor"]').each(function (index) {
        $(this).attr('data-score', poorScore);
    });

    $('#popupEditScoreSystem').modal('toggle');
}

function calculateNewScores(calculated) {
    if (calculated) { // User has chosen the Calculated option for scoring
        let temp_scores = [];
        let lowestScore = $('#txtLowestScore').val();
        let multiplier = $('#txtMultiplier').val();

        for (i = 0; i < 4; i++) { // 4 since there are four fields. WARNING STATIC VALUE.
            temp_scores[i] = lowestScore * multiplier;
            lowestScore++;
        }

        $('.preview-text.excellentScore').html(temp_scores[3]);
        $('.preview-text.goodScore').html(temp_scores[2]);
        $('.preview-text.fairScore').html(temp_scores[1]);
        $('.preview-text.poorScore').html(temp_scores[0]);

        console.log(temp_scores);
    } else {
        // Check if validity
        $('.preview-text.excellentScore').html($('#txtExcellentScore').val());
        $('.preview-text.goodScore').html($('#txtGoodScore').val());
        $('.preview-text.fairScore').html($('#txtFairScore').val());
        $('.preview-text.poorScore').html($('#txtPoorScore').val());
    }
}

function getTemplateInfo() {
    var params = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        params[key] = value;
    });

    console.log(params);

    return params;
}

function initializeEditOrCopyPopup() {

    $('#popupUpdateOrCopy').modal('show');
    console.log('Template name: ' + template_info['template_name']);
    $('#btnNewCopy').on('click', function () {
        $('#popupUpdateOrCopy').modal('toggle');
        $('#popupSaveTemplate').modal('show');
        tableEdit.initializeSaveTemplatePopup();
    });
}


var tableEdit = {

    tables: [],
    init: function (tables) {
        console.log('Editing table');
        this.tables = tables;
        tables.each(function (index, value) {
            let cols = tableEdit.getColumns($(value));

            $(value).Tabledit({
                //url: 'example.php,
                eventType: 'dblclick',
                editButton: true,
                deleteButton: true,
                columns: {
                    identifier: [0, 'id'],
                    editable: cols
                },
                buttons: {
                    edit: {
                        class: 'btn btn-sm btn-default',
                        html: '<span class="link btn btn-primary"> <i class="fa fa-edit"></i> </span>',
                        action: 'edit'
                    },
                    delete: {
                        class: 'btn btn-sm',
                        html: '<span class="link btn btn-danger"> <i class="fa fa-trash"></i> </span>',
                        action: 'delete'
                    }
                }
            });
        });
        tableEdit.addTableMgmtButtons(tables);
    },

    getColumns: function (table) {
        columns = [];
        table.find('th').each(function (index, value) {
            columns.push([index, $(value).text()]);
        })

        return columns;
    },

    addTableMgmtButtons: function (table) {

        let self = this;

        table.after(
            '<div class="text-right align-middle"><button class="btn btn-success table-add-row"><span class="far fa-plus-square fa-2x" ></span>' +
            ' <span class="d-inline-block align-top font-weight-bold ml-3 mt-1">Add a Criterion</span></button></div>');

        $(document).on('click', '.table-add-row', function (item) {

            let table = $(this).parent().prev();
            newRow = table.find('tr:last').clone();
            newRow.find('th .tabledit-span').text('New Criteria');
            newRow.find('th .tabledit-input').val('New Criteria');
            newRow.data('id', -1);
            newRow.find('td').data('id', -1);
            newRow.find('td .tabledit-span').empty();
            newRow.find('td .tabledit-input').val('');
            table.append(newRow);
        })

        $(document).on('click', '.btnInitializeSave', function (item) {
            console.log('Initialize saving of template');
            // As of the moment, users can't create their own template so this popup will always show up.
            // TODO: Change accordingly when users can create templates

            //initializeEditOrCopyPopup();
            if (!tableEdit.validateTemplateTables(tableEdit.tables)) {
                return false;
            }

            $('#popupSaveTemplate').modal('show');
            tableEdit.initializeSaveTemplatePopup();
        })

    },
    validateTemplateTables: function (tables) {
        let validationResult = true;
        tables.each(function (index, table) {

            var result = tableEdit.validateTemplateTable($(table));

            if (result !== true) {
                tableEdit.markInvalidRow($(table), result.rowIndex, result.cellIndex);
                tableEdit.showValidationError(result.message);
                validationResult = false;
            };
        })
        return validationResult;
    },
    validateTemplateTable: function (table) {
        rowNames = [];
        var invalidItem = {}
        table.find('tbody tr').each(function (rowIndex, element) {

            var tr = $(element);
            if (tr.find('th .tabledit-span').text().trim().length == 0) {
                invalidItem.rowIndex = rowIndex;
                invalidItem.cellIndex = 0;
                invalidItem.message = "Template has an empty criteria name";
            }

            if (rowNames.find(function (arrayItem) { return arrayItem == tr.data('name') })) {
                invalidItem.rowIndex = rowIndex;
                invalidItem.cellIndex = 0;
                invalidItem.message = "Template has duplicated criteria names";
            }

            if (invalidItem.hasOwnProperty('rowIndex')) {
                return false;
            }

            tr.find('td .tabledit-span').each(function (cellIndex, cell) {

                if ($(cell).text().trim().length == 0) {
                    invalidItem.rowIndex = rowIndex;
                    invalidItem.cellIndex = cellIndex + 1;
                    invalidItem.message = "Template has an empty criteria mark";
                }
            });

            rowNames.push($(element).data('name'));
        });

        if (invalidItem.hasOwnProperty('rowIndex')) {
            return invalidItem;
        } else {
            return true;
        }

    },
    markInvalidRow: function (table, rowIndex, columnIndex) {
        if (columnIndex == 0) {
            table.find('tr').eq(rowIndex + 1).find('th').eq(columnIndex).addClass('danger');
        } else {
            table.find('tr').eq(rowIndex + 1).find('td').eq(columnIndex - 1).addClass('table-danger');
        }

        $('body, html').animate({
            scrollTop: table.find('.table-danger, .danger').offset().top - 100
        }, { easing: "swing", duration: 500 });
        return false;

    },
    showValidationError: function (message) {
        $('#popupMessage .modal-body').html('<p>' + message + '</p>');
        $('#popupMessage').modal('show');
    },
    generateJSON: function (tables) {
        let template = {};
        template.id = $('.assessment-container').data('id');
        template.name = $('.assessment-container').data('name');
        console.log('Template description: ' + $('#txtTemplateDescription').val());
        template.description = $('#txtTemplateDescription').val();
        template.groupCriteria = [];
        tables.each(function (index, table) {
            template.groupCriteria.push(tableEdit.generateCriteriaGroup($(table)));
        })

        console.log(template);

        return template;
    },

    generateCriteriaGroup: function (table) {

        let groupCriteria = {};

        groupCriteria.id = table.find('thead tr th').data('id') ? table.find('thead tr th').data('id') : 0;
        groupCriteria.name = table.find('thead tr th').data('name') ? table.find('thead tr th').data('name') : 'no name';
        groupCriteria.icon = '';
        groupCriteria.criteria = [];

        table.find('tbody tr').each(function (index, element) {
            var criteria = {}

            criteria.id = $(element).data('id');
            criteria.name = $(element).data('name');
            criteria.description = '';
            criteria.icon = 'fas fa-books';
            console.log('From generateCriteriaGroup: ' + criteria.id + ' with name ' + criteria.name);

            criteria.fields = []
            $(element).find('td[data-score]').each(function (index, td) {
                var field = {};
                field.id = $(td).data('id');
                field.name = $(td).data('name')
                field.value = $(td).data('value')
                field.description = $(td).find('.tabledit-span').text();
                field.points = $(td).data('score')
                criteria.fields.push(field);
            });

            groupCriteria.criteria.push(criteria);
        });
        return groupCriteria;
    },
    initializeSaveTemplatePopup: function () {

        let template = tableEdit.generateJSON(tableEdit.tables);
        console.log('In Save template popup: ' + template['name']);
        $('#btnSaveTemplate').on('click', function () {
            // Check if name is valid
            if ($('#txtTemplateName').val() != '' && $('#txtTemplateName').val() != template['name']) {
                template.name = $('#txtTemplateName').val();
                template.description = $('#txtTemplateDescription').val();
                console.log('Saving template to database...');
                eel.saveJSONTemplateToDatabase(template)(function (new_template_id) {
                    console.log('Created new template with ID: ' + new_template_id);
                    template_id = new_template_id;
                    $('#popupSaveTemplate').modal('toggle');
                    $('#popupSuccessfulSave').modal('show');
                });
            }
        });
    }

}

function createTemplateTable(template_id) {

    // TODO: Add loader here

    eel.getTemplateJSON(template_id)().then(function (templateJSON) {
        /* Organize the JSON object */
        let template = JSON.parse(templateJSON);
        console.log('Creating template into table...');

        let templateHTML = '';
        let group_keys = {};
        let group_score_keys = {};

        /* For each group criterion, create a table */
        /* Developer's Notes: i is for groupCriteria, j is for first criterion fields, k is for criteria */
        for (var i = 0; i < template.groupCriteria.length; i++) {
            let groupCriteria = template.groupCriteria;

            /* Take the first word of group criterion, add _ and then the group criterion's id */
            let temp_words = groupCriteria[i].name.split(" ");
            let data_type_group = temp_words[0].toLowerCase() + "_" + groupCriteria[i].id;

            $('.assessment-container').data('id', template.id);
            $('.assessment-container').data('name', template.name);

            let htmlTable = '<table class="table" id="groupCriterion_' + groupCriteria[i].id + '">';
            /* Table Headers containing group criterion's name */
            htmlTable += '<thead><tr data-type="' + data_type_group + '">';
            htmlTable += '<th scope="col" width="12%" data-name="' + groupCriteria[i].name.replace(/["]/g, '') + '" data-id="' + groupCriteria[i].id + '">' + groupCriteria[i].name + '</th>';

            let first_criterion_fields = groupCriteria[i].criteria[0].fields;

            /* Add value and points in header */
            for (var j = 0; j < first_criterion_fields.length; j++) {
                htmlTable += '<th scope="col" width="22%" data-points="' + first_criterion_fields[j].points + '" data-point-name="' + first_criterion_fields[j].value + '">' +
                    first_criterion_fields[j].points + " - " + first_criterion_fields[j].value + '</th>';
            }

            htmlTable += '</tr></thead>';
            htmlTable += '<tbody>';



            for (var k = 0; k < groupCriteria[i].criteria.length; k++) {

                let criteria = groupCriteria[i].criteria;

                /* Take the first word of criterion, add _ and then the criterion's id */
                temp_words = criteria[k].name.split(" ");
                let data_type_criterion = temp_words[0].toLowerCase() + "_" + criteria[k].id;

                let data_type = data_type_group + '.' + data_type_criterion;

                htmlTable += '<tr data-type="' + data_type + '" data-id="' + criteria[k].id + '" data-name="' + criteria[k].name + '"><th>' + criteria[k].name + '</th>';

                /* Add fields' descriptions */
                for (var l = 0; l < criteria[k].fields.length; l++) {
                    let fields = criteria[k].fields;

                    htmlTable += '<td data-score="' + fields[l].points + '" data-type="' + data_type + '" data-value="'
                        + fields[l].value + '" data-id="' + fields[l].id + '" data-name="' + fields[l].name + '">'
                        + fields[l].description + '</td>';
                }

                htmlTable += '</tr>';
            }

            htmlTable += '</table><br />';

            templateHTML += htmlTable;
        }

        $('.assessment-container').html(templateHTML);
        tableEdit.init($('table.table'));
        // This is to add the class for walkthrough in the edit score button
        $('table:first-of-type .tabledit-toolbar-column .tabledit-edit-button').addClass('firstGuide');
        $('table:first-of-type .tabledit-toolbar-column .tabledit-edit-button').addClass('stepOne');

        // This is to add the class for walkthrough in edit and delete buttons for criteria
        $('table:first-of-type tbody tr:first-child .tabledit-header-edit').addClass('thirdGuide');
        $('table:first-of-type tbody tr:first-child .tabledit-header-edit').addClass('stepOne');
        $('table:first-of-type tbody tr:first-child .tabledit-toolbar .tabledit-edit-button').addClass('thirdGuide');
        $('table:first-of-type tbody tr:first-child .tabledit-toolbar .tabledit-edit-button').addClass('stepTwo');
        $('table:first-of-type tbody tr:first-child .tabledit-toolbar .tabledit-delete-button').addClass('thirdGuide');
        $('table:first-of-type tbody tr:first-child .tabledit-toolbar .tabledit-delete-button').addClass('stepThree');
        $('table:first-of-type').next().find('.table-add-row').addClass('thirdGuide');
        $('table:first-of-type').next().find('.table-add-row').addClass('stepFour');

        if(localStorage.getItem('finishedTemplateWalkthrough') == null){
            editWalkthrough.firstWalkthrough();
        }
    });
}