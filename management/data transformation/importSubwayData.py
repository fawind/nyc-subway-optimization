import os
from decimal import *
from lxml import etree
import pyhdb

""" Helper Functions to insert into DB and retrieve the data from .kml """
def _createTable():
	query = "CREATE TABLE NYCCAB.SUBWAY_STATION (ID INTEGER PRIMARY KEY, NAME VARCHAR(36), LINES VARCHAR(10), LAT REAL, LNG REAL)"
	print query
	cursor.execute(query)
	print("Table created")

def _clearTable():
	query = "DROP TABLE NYCCAB.SUBWAY_STATION"
	cursor.execute(query)
	print("Table flushed")

def _insertIntoDB(id, name, lat, lng, lines):
	query = "INSERT INTO NYCCAB.SUBWAY_STATION VALUES (%s, '%s', '%s', %s, %s)"\
		% (str(id), name.replace('\'', ""), lines, str(lat), str(lng))
	cursor.execute(query)
	print(query + str(cursor.rowcount))

def _numberOfStations():
	query = "SELECT COUNT(*) FROM NYCCAB.SUBWAY_STATION"
	cursor.execute(query)
	return cursor.fetchone()[0]

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
directory = os.path.dirname(os.path.abspath(__file__))
path = os.path.join(directory, "data/Subway Stations.kml")
root = etree.parse(path)
root = etree.fromstring(etree.tostring(root))
set_count = 1

_clearTable()
_createTable()

for child in root[0]:
	# each station is a placemark (map representation) which contains
	# location information as well as name and line of the station
	if child.tag == xmlns + 'Placemark':
		_storeData(child, set_count)
		set_count = set_count + 1

print('Inserted ' + str(_numberOfStations()) + ' stations')
connection.close()
