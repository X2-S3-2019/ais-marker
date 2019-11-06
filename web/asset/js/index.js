var mainpage = {


	startBtn: $("#start"),
	setfolderBtn: $("#setfolder"),
    timerInterval:0,
    init: function () {
		this.initSetFolder();
        this.initStartBtn();
	},
	initSetFolder: function() {
		var that = this;
		async function run() {
            const res = await eel.setFolder();
            if ( res ) {
            	that.startBtn.removeClass("disabled");
            }
        }
		this.setfolderBtn.click(function() {
			run();
		});
	},
	initStartBtn: function() {
		var that = this;
		this.startBtn.click(function() {
			if ( that.startBtn.hasClass("disabled") === true ) {
				// return;
			}
			window.location.href = "/accessment.html"
		});
    },
    initCourses: function () {
        mainpage.getCourses();
        $(document).on('change', '#courses-assess', function () {
            mainpage.getPresentations();
        })
        setTimeout(function () { mainpage.getPresentations() }, 1000);

        $(document).on('click', '#get_student_name', function () {
            if ($('#get_student_name').hasClass('disabled') || $('#student_name').val().length > 0) {
                return false;
            }
        
            courses = eel.getRandomStudentFullName()(function (name) {
                $('#student_name').val(name.trim());
            });
        });
        $(document).on('input', '#student_id', function () {
            mainpage.getPresentations();
            $('#student_name').val('')
            if ($('#student_id').val().length > 0) {
                $('#get_student_name').removeClass('disabled');
            } else {
                $('#get_student_name').addClass('disabled');
            }
        })
        $(document).on('click', '#start_timer', function () {
            if ($(this).hasClass('bg-success')) {
                $(this).text('Stop Presentation Timer');
                $(this).removeClass('bg-success').addClass('bg-danger')
                $('#presentation_timer').removeClass('collapse')
                let elapsed_seconds = 0;
                this.timerInterval = setInterval(function () {
                    elapsed_seconds += 1;
                    $('#presentation_timer_container').text(get_elapsed_time_string((elapsed_seconds)));
                }, 1000);
            } else {
                $(this).text('Start Presentation Timer');
                $(this).removeClass('bg-danger').addClass('bg-success')
               
                clearInterval(this.timerInterval);
            }
            
            
        });
        
    },
    getCourses: function () {
        courses = eel.getCourses()(function (courses) {  
            courses.forEach(function (row) {
                $('#courses-assess').append(
                    '<option value=' + row[1] + '>' +
                    row[2] +
                    '</option>'
                )
            })
        });
    },
    getPresentations: function () {
        let course_id = $('#courses-assess').val();
        presentations = eel.getPresentations(course_id)(function (presentations) {
            $('#presentations-assess').empty();
            presentations.forEach(function (row) {
                $('#presentations-assess').append(
                    '<option value=' + row[0] + '>' +
                    row[1] + ' (' + row[2] +
                    ')</option>'
                )
            })
        });
    },
    getStudentName() {
    }
};

var assess = {
	data: {
		"content": {
			"focus": 0,
			"organization": 0,
			"visual_aids": 0,
			"QA": 0,
		},
		"lang": {
			"eye_contact": 0,
			"enthusiasm": 0,
			"elocution": 0,
		},
		"technical": {
			"knowledge": 0,
			"research": 0,
			"ideas": 0,
			"argument": 0,
			"questions": 0,
		}
	},
	header: {
		"sname": "",
		"sid": "",
		"topic": "",
	},
	student_name: $("#student_name"),
	student_id: $("#student_id"),
    topic: $("#presentations-assess"),
	saveBtn: $("#save"),
	resetBtn: $("#reset"),

	// generateBtn: $("#generate"),
	init: function() {
		this.initialSelect();
		this.initalHeader();
        this.initialSave();
        this.initialReset();
        mainpage.initCourses();
	},
	initialSelect: function() {
		var that = this;
		$('td').click(function(e){
			if ( that.checkHeader() === false ) {
				return;
			}
			$(e.target).parent().removeClass("table-danger");
			var score = $(e.target).attr('data-score');
			var type = $(e.target).attr('data-type');
			var classname = "";
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
			var tmp = type.split('.')
			that.data[tmp[0]][tmp[1]] = score;
			updateScores(that.data, tmp[1]);
		});

		function updateScores(data, criteria){
			// Brute Force D<
			var content_total = 0;

			content_total += parseInt(data['content']['focus']);
			content_total += parseInt(data['content']['organization']);
			content_total += parseInt(data['content']['visual_aids']);
			content_total += parseInt(data['content']['QA']);

			$('.contentScore').html(content_total);

			var language_total = 0;

			language_total += parseInt(data['lang']['eye_contact']);
			language_total += parseInt(data['lang']['enthusiasm']);
			language_total += parseInt(data['lang']['elocution']);

			$('.languageScore').html(language_total);

			var technical_total = 0;

			technical_total += parseInt(data['technical']['knowledge']);
			technical_total += parseInt(data['technical']['research']);
			technical_total += parseInt(data['technical']['ideas']);
			technical_total += parseInt(data['technical']['argument']);
			technical_total += parseInt(data['technical']['questions']);

			$('.technicalScore').html(technical_total);

			$('.totalScore').html(content_total + language_total + technical_total);

		}
	},
	initalHeader: function() {
		var that = this;
		this.student_name.blur(function(){
			that.checkHeader();
		});
		this.student_id.blur(function(){
			that.checkHeader();
		});
		this.topic.blur(function(){
			that.checkHeader();
		});
	},
	initialSave: function() {
		var that = this;
		this.saveBtn.click(function() {
			if ( that.checkHeader() ) {
				var ret = that.checkOption();
                if (ret) {
                    console.log(JSON.stringify(that.data));
                    console.log(JSON.stringify(that.header));
					eel.generdate_word(JSON.stringify(that.data), JSON.stringify(that.header));
				}
			}
		});
	},
	initialReset: function() {
		this.resetBtn.click(function() {
			var isconfirm = confirm("Are you sure to reset this page?");
			if ( isconfirm ) {
				window.location.reload();
			}
		});
	},
    checkHeader: function () {
        if ($('#courses-assess').val() == "") {
            this.$('#courses-assess').addClass("is-invalid");
            return false;
        }
        if ($('#presentations-assess').val() == "") {
            this.$('#presentations-assess').addClass("is-invalid");
            return false;
        }
		if ( this.student_name.val() == "" ) {
			// this.student_name.addClass("is-invalid");
			// return false;
        }
        else {
			this.student_name.removeClass("is-invalid");
			this.header.sname = this.student_name.val();
		}
		if ( this.student_id.val() == "" ) {
			this.student_id.addClass("is-invalid");
			this.student_id.focus();
			return false;
		} else {
			this.student_id.removeClass("is-invalid");
			this.header.sid = this.student_id.val();
		}
		if ( this.topic.val() == "" ) {
			this.topic.addClass("is-invalid");
			this.topic.focus();
			return false;
		} else {
			this.topic.removeClass("is-invalid");
			this.header.topic = this.topic.text();
		}
		return true;
	},
	checkOption: function() {
		var that = this;
		for (category in that.data ) {
			for ( subcate in that.data[category] ) {
				if ( that.data[category][subcate] == 0 ) {
					var tmp = $('tr[data-type="' + category + '.' + subcate + '"]');
					tmp.addClass("table-danger");
					$('body, html').animate({
						scrollTop: tmp.offset().top
					});
					// that.generateBtn.addClass("disabled");
					return false;
				}
			}
		}
		// that.generateBtn.removeClass("disabled");
		return true;
	},
}

$(document).ready(function(){
	var rating = 5;
	assess.init();
    //start.init();
	$("#rateYo").rateYo({
		rating: rating,
    	fullStar: true
	}).on('rateyo.change', function (e, data) {
    }).on('rateyo.set', function(e, data) {
		rating = data.rating;
    });
    $("#rating_submit").click(function(){
		if ( $("#govisit").prop("checked") ) {
			eel.openURL();
		}
    	var ret = eel.sendRating(rating);
    	if ( ret ) {
    		var msg = "Submit Successfully!"
			
    		//alert(msg);
    		$("#surveyModel").modal("hide");
    	}
    	Cookies.set("survey", true);
	});
	
	// Show Survey
    $('#btnShowSurvey').click(function (e){
        showSurvey();
        console.log("Clicked show survey");
    });
});

eel.expose(say_hello_js);               // Expose this function to Python
function say_hello_js(x) {
    console.log("Hello from " + x);
}
say_hello_js("Javascript World!");
// eel.say_hello_py("Javascript World!");  // Call a Python function

function showSurvey() {
	var hasSurvey = Cookies.get("survey");
	console.log(hasSurvey);
	//if ( !hasSurvey ) {
		console.log("12345");
		$("#surveyModel").modal('show');
	//}
}
eel.expose(showSurvey);

function AisAlert(confirm_msg) {
    alert(confirm_msg);
}

function showSuccessfulSave(filename){
	$('.successSavePopupBody').html("The document has been successfully saved in " + filename);
	$('#popupSuccessfulSave').modal('show');
}


function get_elapsed_time_string(total_seconds) {
    function pretty_time_string(num) {
        return (num < 10 ? "0" : "") + num;
    }

    var hours = Math.floor(total_seconds / 3600);
    total_seconds = total_seconds % 3600;

    var minutes = Math.floor(total_seconds / 60);
    total_seconds = total_seconds % 60;

    var seconds = Math.floor(total_seconds);

    // Pad the minutes and seconds with leading zeros, if required
    hours = pretty_time_string(hours);
    minutes = pretty_time_string(minutes);
    seconds = pretty_time_string(seconds);

    // Compose the string for display
    var currentTimeString = hours + ":" + minutes + ":" + seconds;

    return currentTimeString;
}

eel.expose(AisAlert);
eel.expose(showSuccessfulSave);




