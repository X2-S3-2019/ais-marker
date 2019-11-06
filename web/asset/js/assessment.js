$(document).ready(function(){

    $('#popupAddStudent').modal('show');

    $('#btnAssess').click(function (e) {
    e.preventDefault();

  // Check required fields
    var studentID = $('#student_id').val();
    var studentName = $('#student_name').val();
    var course = $('#courses-assess').val();
    var topic = $('#presentations-assess option:selected').text();

    if(isEmptyOrSpaces(studentID)){
        $('#student_id').addClass('is-invalid');
    } else if(isEmptyOrSpaces(studentName)){
        $('#student_name').addClass('is-invalid');
    } else {
        $('.studentNameHolder').html(studentName);
        $('.studentIDHolder').html(studentID);
        $('.courseNameHolder').html(course);
        $('.topicNameHolder').html(topic);
   // Close popup
    $('#popupAddStudent').modal('toggle');
    }
    });

    // Floating Menu Events
    $('.items-wrapper a').click(function(e) {
        $('#popupConfirmExit').modal('show');

        if($(this).attr('title') == "Setup"){
            $('#popupExitButton').click(function (e){
                location.href = "coursesettings.html";
            });
        } else if(($(this).attr('title') == "Main Menu")){
            $('#popupExitButton').click(function (e){
                location.href = "main.html";
            });
        } else if(($(this).attr('title') == "How to Use")){
            $('#popupExitButton').click(function (e){
                location.href = "splash.html";
            });
        }
    });

    // Save Assessment
    $('.btnSaveAssessment').click(function(e){
        // Place student information and assessment results to popup
        var totalPossibleScore = 48;
        var totalScore = $('.totalScore').html();

        var scorePercentage = totalScore / totalPossibleScore * 100;
        // scorePercentage = scorePercentage.toFixed(2);

        var assessmentInfo = "<p>You have assessed: <strong>" + $('.studentNameHolder').html() + " (" + $('.studentIDHolder').html() + ")</strong></p>";
        assessmentInfo += "<p>Presentation Topic: <strong>" + $('.topicNameHolder').html() + "</strong></p>";

        assessmentInfo += "<table class='table table-bordered' style='margin-top: 30px; text-align: center;'>" +
        "<thead>" +
        "<tr>" +
            "<th style='vertical-align: middle; width: 33%'>Content Structure and Ideas</th>" +
            "<th style='vertical-align: middle; width: 33%'>Language and Delivery</th>" +
            "<th style='vertical-align: middle; width: 33%'>Technical</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody>" +
        "<tr>" +
            "<td style='vertical-align: middle'><h4>" + $('.contentScore').html() + "</h4><p>out of 16</p></td>" +
            "<td style='vertical-align: middle'><h4>" + $('.languageScore').html() + "</h4><p>out of 12</p></td>" +
            "<td style='vertical-align: middle'><h4>" + $('.technicalScore').html() + "</h4><p>out of 20</p></td>" +
        "</tr>" +
        "<tr>" +
            "<td colspan='3'>" +
            "Total: <h3>" + totalScore + "</h3><p>out of 48</p>"+
            "<h4>" + scorePercentage.toFixed(2) + "%</h4>" +
            "</td>" +
        "<tr>" +
        "</tbody>" +
        "</table>";

        console.log(assessmentInfo);
        $('#divAssessmentResultBody').html(assessmentInfo);

        $('#popupAssessmentResult').modal('show');
    });

});

function isEmptyOrSpaces(str){
    return str === null || str.match(/^ *$/) !== null;
}