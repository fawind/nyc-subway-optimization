from flask import Flask
from flask_restful import Resource, Api
from app.routes import Routes
from app.handlers.api import *

app = Flask(__name__, static_url_path='', static_folder="public")
api = Api(app)

Routes.add_routes(api)

if __name__ == '__main__':
    app.run(port=8080, debug=True)
