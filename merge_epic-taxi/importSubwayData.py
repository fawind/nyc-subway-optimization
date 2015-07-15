import os
from decimal import *
from lxml import etree
import pyhdb

def _createTable():
	query = 'CREATE TABLE "SUBWAY_STATION" ('\
		'ID INTEGER,'\
		'NAME VARCHAR(36)'\
		'LINES VARCHAR(10)'\
		'LAT REAL',\
		'LNG REAL)'

	cursor.execute(query)

def _insertIntoDB(id, name, lat, lng, lines):
	query = 'INSERT INTO "SUBWAY_STATION" VALUES('+id+','+name+','+lat+',',+lng+','+lines+')'
	cursor.execute(query)
	inserted = inserted + cursor.rowcount

def _storeData(root, id):
	# for each station go through the tags and work with the required information
	for data in root:
		if data.tag == xmlns + 'description':
			name = _getStationName(data.text)
			lines = _getLineNames(data.text)

		if data.tag == xmlns + 'LookAt':
			longitude = Decimal(data[0].text)
			latitude = Decimal(data[1].text)

	_insertIntoDB(id, name, latitude, longitude, lines)

def _getStationName(text):
	start = text.find('<ul class="textattributes">')
	end = text.find('</ul>') + len('</ul>')
	root = etree.XML(text[start:end])
	return root[0][1].text

def _getLineNames(text):
	start = text.find('<ul class="textattributes">')
	end = text.find('</ul>') + len('</ul>')
	root = etree.XML(text[start:end])
	lines = root[2][1].text.split('-')

	for line in lines:
		# remove express stations (subset of normal stations)
		if len(line) > 1:
			lines.remove(line)

	return '-'.join(lines)

""" Script to import Subway-Data as KML into a given HANA-Database """
import credentials

# establish connection with provided credentials
connection = pyhdb.connect(
	host = credentials.host,
	port = credentials.port,
	user = credentials.user,
	password = credentials.password
)

cursor = connection.cursor()

xmlns = '{http://www.opengis.net/kml/2.2}'
path = os.path.join(directory, "data/SubwayStations.kml")
root = etree.parse(path)
root = etree.fromstring(etree.tostring(root))
set_count = 1
inserted = 0

for child in root[0]:
	# each station is a placemark (map representation) which contains
	# location information as well as name and line of the station
	if child.tag == xmlns + 'Placemark':
		_storeData(child, set_count)
		set_count = set_count + 1

connection.close()
