# -*- coding: utf-8 -*-

import json, sqlite3
from sqlite3 import Error

class DBManager:

    def initDB(self, db_name):
        global db
        db = db_name

        try:
            con = sqlite3.connect(db)
            crs = con.cursor()
        except Error:
            print(Error)
            con.close()
        
        # Create tables related to templates
        crs.execute('CREATE TABLE IF NOT EXISTS templates (id INTEGER PRIMARY KEY AUTOINCREMENT, name, type)')
        crs.execute('CREATE TABLE IF NOT EXISTS groupCriteria (id INTEGER PRIMARY KEY AUTOINCREMENT, template_id, name, icon)')
        crs.execute('CREATE TABLE IF NOT EXISTS criteria (id INTEGER PRIMARY KEY AUTOINCREMENT, groupCriterion_id, name, description, icon)')
        crs.execute('CREATE TABLE IF NOT EXISTS fields (id INTEGER PRIMARY KEY AUTOINCREMENT, criterion_id, name, value, description, points)')
        crs.execute('CREATE TABLE IF NOT EXISTS settings (defaultDirectory, enabledNightMode, setPathEveryPresentation, openDocumentAfterAssess)')

        # Create tables related to AIS
        crs.execute('CREATE TABLE IF NOT EXISTS courses (id INTEGER PRIMARY KEY AUTOINCREMENT, code, name)')
        crs.execute('CREATE TABLE IF NOT EXISTS presentation (id INTEGER PRIMARY KEY AUTOINCREMENT, course_id, name, date)')
        crs.execute('CREATE TABLE IF NOT EXISTS students (id INTEGER PRIMARY KEY AUTOINCREMENT, school_id, name)')

        con.close()

        return True

# Database functions related to AIS information
    # def addCourse(self, code, name):

    # def removeCourse(self, course_id):

    # def addPresentation(self, course_id, name, date):

    # def removePresentation(self, presentation_id):

    # def addStudent(self, school_id, name):

    # def removeStudent(self, student_id):
        

# Database functions related to the template and settings
    def getTemplate(self, id):
        try:
            con = sqlite3.connect(db)
        except Error:
            print(Error)
            con.close()
        
        crs = con.cursor()

        crs.execute('SELECT id, name, type FROM templates WHERE id=?', (id,))

        template = []

        row = crs.fetchone()

        if row is not None:
            template = row
        else:
            print('There was an error in getTemplate()')

        con.close()

        return template

    def getTemplates(self):
        try:
            con = sqlite3.connect(db)
        except Error:
            print(Error)
            con.close()
        
        crs = con.cursor()

        crs.execute('SELECT id, name, type FROM templates')

        row = crs.fetchall()

        con.close()

        return row

    def getGroupCriteriaOf(self, template_id):
        try:
            con = sqlite3.connect(db)
        except Error:
            print(Error)
            con.close()
        
        crs = con.cursor()

        crs.execute('SELECT id, name, icon FROM groupCriteria WHERE template_id=?', (template_id,))

        row = crs.fetchall()

        con.close()

        return row

    def getCriteriaOfGroup(self, group_id):
        try:
            con = sqlite3.connect(db)
        except Error:
            print(Error)
            con.close()
        
        crs = con.cursor()

        crs.execute('SELECT id, name, description, icon FROM criteria WHERE groupCriterion_id=?', (group_id,))

        row = crs.fetchall()

        con.close()

        return row

    def getFieldsOf(self, criterion_id):
        try:
            con = sqlite3.connect(db)
        except Error:
            print(Error)
            con.close()
        
        
        crs = con.cursor()

        crs.execute('SELECT id, name, value, description, points FROM fields WHERE criterion_id=?', (criterion_id,))

        row = crs.fetchall()

        con.close()

        return row

# TODO:
    # where template is a JSON
    #def addTemplate(self, template):

# TODO:
    # where template_id is the id of the template to be modified and template is a JSON
    #def editTemplate(self, template_id, template):   

    # Set default values for settings
    def setDefaultSettings(self):
        try:
            con = sqlite3.connect(db)
        except Error:
            print(Error)
            con.close()

        crs = con.cursor()

        # Get user's Desktop path as default path, use light mode, always set path every presentation and always open document
        default_path = os.path.expanduser("~/Desktop")
        crs.execute('INSERT INTO settings VALUES (?, ?, ?, ?)', (default_path, False, True, True))

    # Generates the values of AIS default assessment document
    def createDefaultTemplate(self):
        try:
            con = sqlite3.connect(db)
        except Error:
            print(Error)
            con.close()

        crs = con.cursor()

        crs.execute('INSERT INTO templates VALUES (?, ?, ?)', (None, 'Default', 'table'))
        template_id = crs.lastrowid

        # Content Structure / Ideas
        crs.execute('INSERT INTO groupCriteria VALUES (?, ?, ?, ?)', (None, template_id, 'Content Structure / Ideas', 'fas fa-sitemap'))
        group_criterion_id = crs.lastrowid

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Focus', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'focus_excellent', 'Excellent', 'Purpose of presentation is clear from the outset. Supporting ideas maintain clear focus on the topic.', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'focus_good', 'Good', 'Topic of the presentation is clear. Content generally supports the purpose', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'focus_fair', 'Fair', 'Presentation lacks clear direction. Big ideas not specifically identified', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'focus_poor', 'Poor', 'No focus at all. Audience cannot determine purpose of presentation', 1))
        
        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Organization', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'organization_excellent', 'Excellent', 'Student presents information in logical, interesting sequence that audience follows', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'organization_good', 'Good', 'Student presents information in logical sequence that audience can follow', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'organization_fair', 'Fair', 'Audience has difficulty following because student jumps around', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'organization_poor', 'Poor', 'Audience cannot understand because there is no sequence of information', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Visual Aids', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'visualAids_excellent', 'Excellent', 'Visual aids are readable, clear and professional looking, enhancing the message', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'visualAids_good', 'Good', 'Visual aids are mostly readable, clear and professional looking', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'visualAids_fair', 'Fair', 'Significant problems with readability, clarity, professionalism of visual aids', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'visualAids_poor', 'Poor', 'Visual aids are all unreadable, unclear and/or unprofessional', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Question & Answer', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questionAnswer_excellent', 'Excellent', 'Speaker has prepared relevant questions for opening up the discussion and is able to stimulate discussion', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questionAnswer_good', 'Good', 'Speaker has prepared relevant questions for opening up the discussion and is somewhat able to stimulate discussion', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questionAnswer_fair', 'Fair', 'Speaker has prepared questions but is not really able to stimulate discussion', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questionAnswer_poor', 'Poor', 'Speaker has not prepared questions', 1))
        
        # Language and Delivery
        crs.execute('INSERT INTO groupCriteria VALUES (?, ?, ?, ?)', (None, template_id, 'Language and Delivery', 'fas fa-comment-dots'))
        group_criterion_id = crs.lastrowid
        
        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Eye Contact', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'eyeContact_excellent', 'Excellent', 'Holds attention of entire audience with the use of direct eye contact, seldom looking at notes', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'eyeContact_good', 'Good', 'Consistent use of direct eye contact with audience, but often returns to notes', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'eyeContact_fair', 'Fair', 'Displays minimal eye contact with audience, while reading mostly from the notes', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'eyeContact_poor', 'Poor', 'No eye contact with audience; entire presentation is read from notes', 1))
        
        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Enthusiasm', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'enthusiasm_excellent', 'Excellent', 'Demonstrates a strong, positive feeling about topic during entire presentation', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'enthusiasm_good', 'Good', 'Mostly shows positive feelings about topic', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'enthusiasm_fair', 'Fair', 'Shows some negativity toward topic presented', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'enthusiasm_poor', 'Poor', 'Shows no interest in topic presented', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Elocution', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'elocution_excellent', 'Excellent', 'Student uses a clear voice so that all audience members can hear presentation', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'elocution_good', 'Good', 'Student’s voice is clear. Most audience members can hear presentation', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'elocution_fair', 'Fair', 'Student’s voice is low. Audience has difficulty hearing presentation', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'elocution_poor', 'Poor', 'Student mumbles, speaks too quietly for a majority of audience to hear', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Time Management', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'timeManagement_excellent', 'Excellent', 'Students start and finish presentation in time', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'timeManagement_good', 'Good', 'Students start presentation in time and could not finish in time', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'timeManagement_fair', 'Fair', 'Students could not star presentation in time but they finish in time', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'timeManagement_poor', 'Poor', 'Students could not start and could not finish presentation in time', 1))

        # Technical
        crs.execute('INSERT INTO groupCriteria VALUES (?, ?, ?, ?)', (None, template_id, 'Technical', 'fas fa-cogs'))
        group_criterion_id = crs.lastrowid

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Knowledge', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'knowledge_excellent', 'Excellent', 'Demonstrate clear knowledge and understanding of the subject', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'knowledge_good', 'Good', 'Show clear knowledge and understanding of most subject area', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'knowledge_fair', 'Fair', 'Show some knowledge and understanding of the subject area', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'knowledge_poor', 'Poor', 'Show no knowledge and understanding of the subject area', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Research', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'research_excellent', 'Excellent', 'Evidence of thorough research and preparation', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'research_good', 'Good', 'Evidence of sufficient research and preparation', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'research_fair', 'Fair', 'Evidence of some research and preparation', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'research_poor', 'Poor', 'Evidence of no research and preparation', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Discussion of new ideas', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'discussionNewIdeas_excellent', 'Excellent', 'Demonstrate  thorough knowledge while discussing new ideas ', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'discussionNewIdeas_good', 'Good', 'Show  sufficient knowledge while discussing new ideas ', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'discussionNewIdeas_fair', 'Fair', 'Show  some knowledge while discussing new ideas ', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'discussionNewIdeas_poor', 'Poor', 'Show  no knowledge while discussing new ideas ', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Argument', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'argument_excellent', 'Excellent', 'Opinion set out in a concise and persuasive manner', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'argument_good', 'Good', 'Opinion is not concise and persuasive manner', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'argument_fair', 'Fair', 'Opinion is clearly demonstrated but not persuasive', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'argument_poor', 'Poor', 'Opinion is not demonstrated or highlighted', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Questions', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questions_excellent', 'Excellent', 'Responded very well to technical questions', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questions_good', 'Good', 'Could answer most technical questions related to the presentation', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questions_fair', 'Fair', 'Could answer some technical questions related to the presentation', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questions_poor', 'Poor', 'Could not answer any technical questions related to the presentation', 1))

        con.commit()
        con.close()

        return True

    # Generates the values of Saghir's modified assessment document
    def createSaghirTemplate(self):
        try:
            con = sqlite3.connect(db)
        except Error:
            print(Error)
            con.close()

        crs = con.cursor()

        crs.execute('INSERT INTO templates VALUES (?, ?, ?)', (None, 'Default', 'table'))
        template_id = crs.lastrowid

        # Content Structure / Ideas
        crs.execute('INSERT INTO groupCriteria VALUES (?, ?, ?, ?)', (None, template_id, 'Content Structure / Ideas', 'fas fa-sitemap'))
        group_criterion_id = crs.lastrowid

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Focus', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'focus_excellent', 'Excellent', 'Purpose of presentation is clear from the outset. Supporting ideas maintain clear focus on the topic.', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'focus_good', 'Good', 'Topic of the presentation is clear. Content generally supports the purpose', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'focus_fair', 'Fair', 'Presentation lacks clear direction. Big ideas not specifically identified', 1))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'focus_poor', 'Poor', 'No focus at all. Audience cannot determine purpose of presentation', 0))
        
        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Organization', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'organization_excellent', 'Excellent', 'Student presents information in logical, interesting sequence that audience follows', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'organization_good', 'Good', 'Student presents information in logical sequence that audience can follow', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'organization_fair', 'Fair', 'Audience has difficulty following because student jumps around', 1))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'organization_poor', 'Poor', 'Audience cannot understand because there is no sequence of information', 0))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Visual Aids', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'visualAids_excellent', 'Excellent', 'Visual aids are readable, clear and professional looking, enhancing the message', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'visualAids_good', 'Good', 'Visual aids are mostly readable, clear and professional looking', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'visualAids_fair', 'Fair', 'Significant problems with readability, clarity, professionalism of visual aids', 1))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'visualAids_poor', 'Poor', 'Visual aids are all unreadable, unclear and/or unprofessional', 0))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Question & Answer', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questionAnswer_excellent', 'Excellent', 'Speaker has prepared relevant questions for opening up the discussion and is able to stimulate discussion', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questionAnswer_good', 'Good', 'Speaker has prepared relevant questions for opening up the discussion and is somewhat able to stimulate discussion', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questionAnswer_fair', 'Fair', 'Speaker has prepared questions but is not really able to stimulate discussion', 1))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questionAnswer_poor', 'Poor', 'Speaker has not prepared questions', 0))
        
        # Language and Delivery
        crs.execute('INSERT INTO groupCriteria VALUES (?, ?, ?, ?)', (None, template_id, 'Language and Delivery', 'fas fa-comment-dots'))
        group_criterion_id = crs.lastrowid
        
        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Eye Contact', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'eyeContact_excellent', 'Excellent', 'Holds attention of entire audience with the use of direct eye contact, seldom looking at notes', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'eyeContact_good', 'Good', 'Consistent use of direct eye contact with audience, but often returns to notes', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'eyeContact_fair', 'Fair', 'Displays minimal eye contact with audience, while reading mostly from the notes', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'eyeContact_poor', 'Poor', 'No eye contact with audience; entire presentation is read from notes', 1))
        
        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Enthusiasm', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'enthusiasm_excellent', 'Excellent', 'Demonstrates a strong, positive feeling about topic during entire presentation', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'enthusiasm_good', 'Good', 'Mostly shows positive feelings about topic', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'enthusiasm_fair', 'Fair', 'Shows some negativity toward topic presented', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'enthusiasm_poor', 'Poor', 'Shows no interest in topic presented', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Elocution', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'elocution_excellent', 'Excellent', 'Student uses a clear voice so that all audience members can hear presentation', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'elocution_good', 'Good', 'Student’s voice is clear. Most audience members can hear presentation', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'elocution_fair', 'Fair', 'Student’s voice is low. Audience has difficulty hearing presentation', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'elocution_poor', 'Poor', 'Student mumbles, speaks too quietly for a majority of audience to hear', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Time Management', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'timeManagement_excellent', 'Excellent', 'Students start and finish presentation in time', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'timeManagement_good', 'Good', 'Students start presentation in time and could not finish in time', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'timeManagement_fair', 'Fair', 'Students could not star presentation in time but they finish in time', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'timeManagement_poor', 'Poor', 'Students could not start and could not finish presentation in time', 1))

        # Technical
        crs.execute('INSERT INTO groupCriteria VALUES (?, ?, ?, ?)', (None, template_id, 'Technical', 'fas fa-cogs'))
        group_criterion_id = crs.lastrowid

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Knowledge', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'knowledge_excellent', 'Excellent', 'Demonstrate clear knowledge and understanding of the subject', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'knowledge_good', 'Good', 'Show clear knowledge and understanding of most subject area', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'knowledge_fair', 'Fair', 'Show some knowledge and understanding of the subject area', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'knowledge_poor', 'Poor', 'Show no knowledge and understanding of the subject area', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Research', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'research_excellent', 'Excellent', 'Evidence of thorough research and preparation', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'research_good', 'Good', 'Evidence of sufficient research and preparation', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'research_fair', 'Fair', 'Evidence of some research and preparation', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'research_poor', 'Poor', 'Evidence of no research and preparation', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Discussion of new ideas', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'discussionNewIdeas_excellent', 'Excellent', 'Demonstrate  thorough knowledge while discussing new ideas ', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'discussionNewIdeas_good', 'Good', 'Show  sufficient knowledge while discussing new ideas ', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'discussionNewIdeas_fair', 'Fair', 'Show  some knowledge while discussing new ideas ', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'discussionNewIdeas_poor', 'Poor', 'Show  no knowledge while discussing new ideas ', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Argument', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'argument_excellent', 'Excellent', 'Opinion set out in a concise and persuasive manner', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'argument_good', 'Good', 'Opinion is not concise and persuasive manner', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'argument_fair', 'Fair', 'Opinion is clearly demonstrated but not persuasive', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'argument_poor', 'Poor', 'Opinion is not demonstrated or highlighted', 1))

        crs.execute('INSERT INTO criteria VALUES (?, ?, ?, ?, ?)', (None, group_criterion_id, 'Questions', '', ''))
        criterion_id = crs.lastrowid
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questions_excellent', 'Excellent', 'Responded very well to technical questions', 4))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questions_good', 'Good', 'Could answer most technical questions related to the presentation', 3))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questions_fair', 'Fair', 'Could answer some technical questions related to the presentation', 2))
        crs.execute('INSERT INTO fields VALUES (?, ?, ?, ?, ?, ?)', (None, criterion_id, 'questions_poor', 'Poor', 'Could not answer any technical questions related to the presentation', 1))

        con.commit()
        con.close()

        return True