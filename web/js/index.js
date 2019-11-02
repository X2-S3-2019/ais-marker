/*
    index.js

    File description: Contains functions for navigating in Main Menu
*/

$(document).ready(function(){
    $(window).on("load",function(){
        $(".loader-wrapper").fadeOut("slow");
   });

    /* If this is user's first time, load onboarding.html, else stay in index.html */
    /* This is determined whether the user finished the onboarding or clicked Skip */
    if(localStorage.getItem('finishedOnboarding') === null){
        console.log('First time');
        // Display onboarding section which is hidden by default
        $('.onboarding-wrapper').show();
    }

    $('#btnSkip, #btnFinish').click(function(){
        localStorage.setItem('finishedOnboarding', true);
        $('.onboarding-wrapper').fadeOut(500);
    });
    
    $('#btnQuickStart').click(function(){
        window.location.replace('assessment.html');
    });
});
