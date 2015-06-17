from flask import Flask, request, jsonify
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
        stationLat = request.json['lat']
        stationLng = request.json['lng']
        print '[POST] cluster: id: ' + str(stationId) + ', lat: ' + str(stationLat) + ', lng: ' + str(stationLng)

        results = db.get_cluster(stationLat, stationLng)

        return jsonify(cluster=results)

class ClusterFiltered(Resource):
    def post(self):
        stationId =  request.json['id']
        stationLat = request.json['lat']
        stationLng = request.json['lng']
        dates = request.json['filter']['date']
        years = request.json['filter']['years']
        times = request.json['filter']['time']

        results = db.get_cluster_filtered(stationLat, stationLng, dates, years, times)

        return {'hello': 'hellow'}


