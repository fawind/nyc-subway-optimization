from flask import Flask, request
from flask_restful import Resource, Api
from app.hana import DBHandler

db = DBHandler()

class TestPage(Resource):
    def get(self):
        print(db.get_entry())
        return {'hello': 'world'}

class Cluster(Resource):
    def post(self):
        stationId =  request.json['id']
        return {'res': 'ok', 'id': stationId}
