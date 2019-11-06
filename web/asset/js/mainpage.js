var start = {
	startBtn: $("#start"),
    settingsBtn: $("#btnSetup"),
    assessmentBtn: $("#btnAssessment"),
    skipIntroBtn: $("#skip_intro"),
    init: function () {
        this.initSettingsBtn();
        this.initStartBtn();
        this.initAssessmentBtn();
        this.initSkipIntroBtn();
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
    initAssessmentBtn: function () {
        var that = this;
        this.assessmentBtn.on('click', function () {
            window.location.href = "assessment.html"
        });
    },
    initSkipIntroBtn: function () {
        var that = this;
        this.skipIntroBtn.on('click', function () {
            window.location.href = "main.html"
        });
    },
    initSettingsBtn: function () {
        var that = this;
        this.settingsBtn.on('click', function () {
            window.location.href = "coursesettings.html"
        });
    }
};

$(document).ready(function () {
    start.init();
});
