/* Contains scripts used all over the application */
var CutString = function(string, maxlength) {
    if ( typeof string != "string" ) {
        return string;
    }
    maxlength = maxlength || 40;
    if ( string.length <= maxlength ) {
        return $('<div/>').text(string).html();;
    }
    return $('<div/>').text(string.substr(0, maxlength) + "...").html();;
}

$(document).ready(function(){
    $(window).bind('beforeunload', function(){
        var href = document.location.href;
        var lastPathSegment = href.substr(href.lastIndexOf('/') + 1);

        eel.say_hello_py(lastPathSegment);
    });

    /* If this is user's first time, load onboarding.html, else stay in index.html */
    /* This is determined whether the user finished the onboarding or clicked Skip */
    if(localStorage.getItem('finishedOnboarding') === null){
        console.log('First time');
        // Display onboarding section which is hidden by default
        $('.onboarding-wrapper').show();
    }
});