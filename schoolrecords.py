# -*- coding: utf-8 -*-
# Contains the classes related to school records

class Student:
    def __init__(self, id, name):
        self.id = id
        self.name = name

class Presentation:
    def __init__(self, id, date, name):
        self.id = id
        self.name = name
        self.date = date   

class Course:
    def __init__(self, id, code, name):
        self.id = id
        self.code = code
        self.name = name
        self.presentations = []

    def addPresentation(self, presentation):
        self.presentations.append(presentation)

    def getPresentations(self):
        return self.presentations

    def printPresentations(self):
        for i in self.presentations:
            print(i.name)