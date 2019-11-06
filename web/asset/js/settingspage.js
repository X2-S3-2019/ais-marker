var settings = {
    coursesTab: $("#courses-tab"),
    presentationsTab: $("#presntations-tab"),
    studentsTab: $("#students-tab"),
    courseStudentsTab: $("#course-students-tab"),
    container: $("#content"),
    setfolderBtn: $("#set_path"),
    startBtn: $('#to_assessment'),
    init: function ()
    {
        this.initLoadCourses();
        this.initAddCourseBtn();
        this.initSetFolder();
        this.initStartBtn();

    },

    initLoadCourses() {
        var that = this;
        settings.container.load("coursestab.html");
        this.getCourses();
        this.initTabs()
    },
    initTabs() {
        this.coursesTab.on('click', function () {
            settings.container.load("coursestab.html");
        });
        this.presentationsTab.on('click', function () {

            settings.container.load("presentationstab.html", function () {
                settings.initPresentationTab();
            });
        });
        // this.studentsTab.on('click', function () {
        //     settings.container.load("studentstab.html");
        // });
        // this.courseStudentsTab.on('click', function () {
        //     settings.container.load("coursestudentstab.html");
        // });
    },

    initPresentationTab() {
        courses = eel.getCourses()(function (courses) {
            courses.forEach(function (row) {
                $('.presentations #courses').append(
                    '<option value=' + row[1] + '>' +
                    row[2] +
                    '</option>'
                    )
            })
        });

        var today = new Date();
        var dd = ("0" + (today.getDate())).slice(-2);
        var mm = ("0" + (today.getMonth() +　1)).slice(-2);
        var yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd ;
        $("#presentation-date").attr("value", today);

        $(document).on('change', '.presentations #courses', function (el) {
            settings.getPresentations($('.presentations #courses').val())
        });

        $(document).on('click', '#add-presentation', function () {
            $('input').removeClass('is-invalid');

            course_id = $('.presentations #courses').val();
            presentation_date = $('#presentation-date').val();
            presentation_name = $('#presentation-name').val();

            valid = true;
            if (course_id.length == 0) {
                $('.presentations #courses').addClass('is-invalid')
                valid = false;
            }
            if (presentation_date.length == 0) {
                $('#presentation-date').addClass('is-invalid')
                valid = false;
            }
            if (presentation_name.length == 0) {
                $('#presentation-name').addClass('is-invalid')
                valid = false;
            }
            if (!valid) {
                return false;
            }

            eel.createPresentation(course_id, presentation_date, presentation_name)
            settings.getPresentations($('.presentations #courses').val());
            $('#presentation-date').val('')
            $('#presentation-name').val('')
        }); 
    },
    createCourse() {

        let course_name, course_id;

        $('input').removeClass('is-invalid');
        course_id = $('#course-id').val();
        course_name = $('#course-name').val();

        valid = true;
        if (course_id.length == 0) {
            $('#course-id').addClass('is-invalid')
            valid = false;
        }
        if (course_name.length == 0) {
            $('#course-name').addClass('is-invalid')
            valid = false;
        }
        if (!valid) {
            return false;
        }

        eel.createCourse(course_name, course_id)
        this.getCourses();
    },
    getCourses() {
        $('#courses-table tbody').empty()

        courses = eel.getCourses()(function (courses) {
            courses.forEach(function(row) {
                $('#courses-table tbody').append(
                    '<tr>' +
                        '<th scope="row">' + row[1] + '</th>' +
                        '<td>' + row[2]  +'</td>' +
                        '<td> <button class="link btn btn-danger"> Remove </button></td>' +
                    '</tr')
            })        
        });
    },
    getPresentations() {
        $('#course-presentations-table tbody').empty()

        course_id = $('.presentations #courses').val();
        eel.getPresentations(course_id)(function (presentations) {
            presentations.forEach(function (row) {
                $('#course-presentations-table tbody').append(
                    '<tr>' +
                    '<th scope="row">' + row[0] + '</th>' +
                    '<td>' + row[2] + '</td>' +
                    '<td>' + row[1] + '</td>' +
                    '<td> <button class="link btn btn-danger">Remove</button></td>' +
                    '</tr')
            })
        });
    },
  

	initSetFolder: function() {
		var that = this;
		async function run() {
            const res = await eel.setFolder();
            //if ( res ) {
            //	that.startBtn.removeClass("disabled");
            //}
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
			window.location.href = "/assessment.html"
		});
    },
    initAddCourseBtn: function () {
        $(document).on('click', '#add-course', function () {
            settings.createCourse();
        });
    },
};

$(document).ready(function(){
    settings.init();
});

function reload(confirm_msg) {
    var isconfirm = confirm(confirm_msg);
    if (isconfirm) {
        window.location.reload();
    }
}
eel.expose(reload);

function AisAlert(confirm_msg) {
    alert(confirm_msg);
}
eel.expose(AisAlert);




