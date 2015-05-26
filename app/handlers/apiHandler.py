from flask import Flask
from flask_restful import Resource, Api
from app.hana import DBHandler

db = DBHandler()

class TestPage(Resource):
    def get(self):
        print(db.get_entry())
        return {'hello': 'world'}
