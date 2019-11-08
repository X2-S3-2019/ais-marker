

# TODO: 
# Apply cell shading for selected cells (Source: https://groups.google.com/forum/#!topic/python-docx/-c3OrRHA3qo)
# Add an optional grouping mechanism for criteria
# Hacky: Getting the first criterion as the basis for the header values
# Create interface to view and edit templates
# Add existing assessment code
# Make use of Popper.js
# Craete a assessment_results JSON object dynamically


from __future__ import print_function	# For Py2/3 compatibility
import eel, json, os, sys , time        # External dependencies
# Program-related python files
import datastore                        # Database-related functions
# assessment contains template- and assessment-related classes
from assessment import AssessmentDocument, TemplateDocument, Template, GroupCriterion, Criterion, Field    
from schoolrecords import Student, Presentation, Course        

global databaseManager

# Create template document from database values
def createTemplate(template_id):
    template_db = databaseManager.getTemplate(template_id) # Get Default template

    template = Template(template_db[0], template_db[1], template_db[2])
    
    group_criteria_db = databaseManager.getGroupCriteriaOf(template_db[0])

    # For each group, add criterion
    for group in group_criteria_db:
        temp_group = GroupCriterion(group[0], group[1], group[2])
        template.addGroupCriterion(temp_group)
        group_id = group[0]

        criteria = databaseManager.getCriteriaOfGroup(group_id)
        # For each criterion, get information and fields
        for criterion in criteria:
            temp_criterion = Criterion(criterion[0], criterion[1], criterion[2], criterion[3])
            fields = databaseManager.getFieldsOf(criterion[0])
            for field in fields:
                temp_field = Field(field[0], field[1], field[2], field[3], field[4])
                temp_criterion.addField(temp_field)
            template.addCriterionToGroup(temp_criterion, temp_group)

    return template

@eel.expose
def getCourses():
    return databaseManager.getAllCourses()

@eel.expose
def getStudents():
    return databaseManager.getAllStudents()

@eel.expose
def getPresentations():
    return databaseManager.getAllPresentations()

@eel.expose
def getAllPresentationsOfCourse(course_id):
    return databaseManager.getAllPresentationsOfCourse(course_id)


@eel.expose
def addStudent(id, name):
    student_id = databaseManager.addStudent(id, name)
    print('Added student with id ' + str(student_id))

    return student_id

@eel.expose
def addCourse(code, name):
    course_id = databaseManager.addCourse(code, name)
    print('Added course with id ' + str(course_id))

    return course_id
@eel.expose
def addPresentation(course_id, name, date):
    presentation_id = databaseManager.addPresentation(course_id, name, date)
    print('Added presentation with id ' + str(presentation_id))

    return presentation_id

# Create the class version of the JSON template
# For when the user doesn't want to save his/her template to the database
# NOTE: This is is not used as of the moment.
@eel.expose
def deserializeJSONDummyTemplate(JSONTemplate):

    template = Template(-1, JSONTemplate['name'], JSONTemplate['type'])
    
    for group in JSONTemplate['groupCriteria']:
        groupCriterionObj = GroupCriterion(-1, group['name'], group['icon'])

        for criterion in group['criteria']:
            criterionObj = Criterion(-1, criterion['name'], criterion['description'], criterion['icon'])
            groupCriterionObj.addCriterion(criterionObj)

            for field in criterion['fields']:
                fieldObj = Field(-1, field['name'], field['value'], field['description'], field['points'])
                criterionObj.addField(fieldObj)
    
        template.addGroupCriterion(groupCriterionObj)

    doc = TemplateDocument('Ben')
    doc.createTemplateDocument(template)
    doc.openTemplateDocument()

    return True
    
# Save the JSON object of the template to the database
@eel.expose
def saveJSONTemplateToDatabase(JSONTemplate):

    template_id = databaseManager.addTemplate(JSONTemplate['name'], JSONTemplate['type'])

    for group in JSONTemplate['groupCriteria']:
        group_criterion_id = databaseManager.addGroupCriterion(template_id, group['name'], group['icon'])

        for criterion in group['criteria']:
            criterion_id = databaseManager.addCriterionToGroup(group_criterion_id, criterion['name'], criterion['description'], group['icon'])

            for field in criterion['fields']:
                databaseManager.addFieldToCriteria(criterion_id, field['name'], field['value'], field['description'], field['points'])

    return template_id

# Create JSON object of template object
@eel.expose
def getTemplateJSON(template_id):
    template = createTemplate(template_id)
    templateJSON = json.dumps(template, default=lambda o: o.__dict__, indent=1)

    return templateJSON

@eel.expose
def openDocument(document_name):
    os.startfile(document_name + '.docx')   

# Creates the document containing the results of the assessment
@eel.expose
def createAssessmentResultDocument(header_info, results, template_id, openDocument):
    # data_of_presentation acts as a unique id for the document
    if "".__eq__(header_info['studentName']):
        document_name = header_info['studentId'] + ' (' + header_info['presentationDate'] + ')'
    else:
        document_name = header_info['studentName'] + ' - ' + header_info['studentId'] + ' (' + header_info['presentationDate'] + ')'       

    template = createTemplate(template_id)

    assessmentDocument = AssessmentDocument(document_name)
    assessmentDocument.createResultsDocument(template, results, header_info)
    
    if openDocument:
        assessmentDocument.openResultsDocument()   

# Prevents the connection time-out (hopefully). x is the name of the page accessing this function.
@eel.expose
def say_hello_py(x):
   print('Hello from %s' % x)
   time.sleep(0.9)
    
# Main Function
if __name__ == '__main__':

    # Initiliaze database
    databaseManager = datastore.DBManager()
    databaseManager.initDB('ais_marker_db')

    # Add a default template to database
    databaseManager.createDefaultTemplate()
    databaseManager.createSaghirTemplate()

    web_app_options = {'mode': "chrome-app", 'host': '127.0.0.1'}

    eel.init('web')
    eel.start('index.html', size=(1000, 600), options=web_app_options)
