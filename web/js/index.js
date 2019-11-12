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
    
    $('#btnQuickStart').click(function(){
        // Check if user wants the default template to be used
        // if(localStorange.getItem('loadDefaultItem'))
        eel.getDefaultTemplateID()().then(function(default_template_id){
            console.log('Template ID: ' + default_template_id);
            window.location.replace('assessment.html?template_id=' + default_template_id);
        });

        //window.location.replace('assessment.html');
    });
});
