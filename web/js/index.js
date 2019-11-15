/*
    index.js

    File description: Contains functions for navigating in Main Menu
*/

$(document).ready(function(){
    $(window).on("load",function(){
        $(".loader-wrapper").fadeOut("slow");
   });

    $('#btnSkip, #btnFinish').click(function(){
        localStorage.setItem('finishedOnboarding', true);
        $('.onboarding-wrapper').fadeOut(500);
    });

    $('#btnEnableWalkthrough').click(function(){
        localStorage.removeItem('finishedMainPageWalkthrough');
        localStorage.removeItem('finishedWalkthrough');
        localStorage.removeItem('finishedTemplateWalkthrough');
        window.location.reload();
    });
    
    $('#btnQuickStart').click(function(){
        // Check if user wants the default template to be used
        // if(localStorange.getItem('loadDefaultItem'))

        // When user clicks Quick Start for the first time:
        localStorage.setItem('finishedMainPageWalkthrough', true);

        eel.getDefaultTemplateID()().then(function(default_template_id){
            console.log('Template ID: ' + default_template_id);
            window.location.replace('assessment.html?template_id=' + default_template_id);
        });

        //window.location.replace('assessment.html');
    });
});
