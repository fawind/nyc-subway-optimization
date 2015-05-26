from flask import Flask
from flask_restful import Resource, Api
from app.handlers.apiHandler import *

def add_routes(api):
    # Add backend routes here
    api.add_resource(TestPage, '/api/test')
