/* Contains scripts used all over the application */

$(document).ready(function(){

    $(window).bind('beforeunload', function(){
        var href = document.location.href;
        var lastPathSegment = href.substr(href.lastIndexOf('/') + 1);

        eel.say_hello_py(lastPathSegment);
    });

});