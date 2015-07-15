import os
import json
import math
import pyhdb

""" helper functions """
def distance(self, lat1, long1, lat2, long2):
    # Convert latitude and longitude to
    # spherical coordinates in radians.
    degrees_to_radians = math.pi/180.0

    # phi = 90 - latitude
    phi1 = (90.0 - lat1)*degrees_to_radians
    phi2 = (90.0 - lat2)*degrees_to_radians

    # theta = longitude
    theta1 = long1*degrees_to_radians
    theta2 = long2*degrees_to_radians

    cos = (math.sin(phi1)*math.sin(phi2)*math.cos(theta1 - theta2) +
           math.cos(phi1)*math.cos(phi2))
    arc = math.acos( cos )

    # return in kilometres
    return (arc * 6371)

def _stationsByLine(line):
	query = "SELECT * FROM NYCCAB.SUBWAY_STATION WHERE LINES LIKE \'%" + line + "%'"
	cursor.execute(query)
	return cursor.fetchall()

def _stationsNameAndLine(name, line):
	query = "SELECT * FROM NYCCAB.SUBWAY_STATION WHERE NAME LIKE \'%" + name + "%\' AND LINES LIKE \'%" + line + "%'"
	cursor.execute(query)
	return cursor.fetchall()

def _numberOfStations():
	query = "SELECT COUNT(*) FROM NYCCAB.SUBWAY_STATION"
	cursor.execute(query)
	return cursor.fetchone()[0]

""" Data containing the start-stations of the subway lines """
start_stations = [{'station': 'Inwood - 207th', 'line': 'A'},\
				{'station': 'Van Cortlandt', 'line': '1'},\
				{'station': 'Woodlawn', 'line': '4'},\
				{'station': 'Norwood - 205th', 'line': 'D'},\
				{'station': 'Wakefield', 'line': '2'},\
				{'station': 'Eastchester', 'line': '5'},\
				{'station': 'Pelham Bay Park', 'line': '6'},\
				{'station': 'Flushing - Main St', 'line': '7'},\
				{'station': 'Jamaica - 179', 'line': 'F'},\
				{'station': 'Forest Hills - 71', 'line': 'M'},\
				{'station': 'Forest Hills - 71', 'line': 'R'},\
				{'station': 'Jamaica Ctr', 'line': 'E'},\
				{'station': 'Jamaica Ctr', 'line': 'J'},\
				{'station': 'Jamaica Ctr', 'line': 'Z'},\
				{'station': 'New Lots Ave', 'line': '3'},\
				{'station': 'Canarsie', 'line': 'L'},\
				{'station': 'Church Ave', 'line': 'G'},\
				{'station': 'Brighton Beach', 'line': 'B'},\
				{'station': 'Coney Island', 'line': 'N'},\
				{'station': 'Coney Island', 'line': 'Q'},\
				{'station': 'Bay Ridge - 95th St', 'line': 'R'},\
				{'station': 'Euclid', 'line': 'C'},\
				]

""" main script creating a JSON containg the subway lines approximately """
import credentials

# establish connection with provided credentials
connection = pyhdb.connect(
	host = credentials.host,
	port = credentials.port,
	user = credentials.user,
	password = credentials.password
)

cursor = connection.cursor()
print(_numberOfStations())
# Check if given data in Dictionary is valid regarding starting stations
# otherwise print invalid data
failed = False
for station in start_stations:
	testSet = _stationsNameAndLine(station['station'], station['line'])
	if len(testSet) != 1:
		#print station
		#print testSet
		failed = True

if failed:
	print("Failed - not only one matching station")
	print(_numberOfStations())
	exit()

routes = []

for station in start_stations:
	# For each station and the line it starts collect the nearest stations and create the line as array
	start = _stationsNameAndLine(station['station'], station['line'])[0]
	line = station['line']
	stations = []

	possible_stations = _stationsByLine(line)
	print(possible_stations)

	while len(possible_stations) > 0:
		nearest_station = possible_stations[0]
		for pos_station in possible_stations:
			if distance(pos_station.latitude, pos_station.longitude, start.latitude, start.longitude) \
				< distance(nearest_station.latitude, nearest_station.longitude, start.latitude, start.longitude):
				nearest_station = pos_station

		possible_stations.remove(nearest_station)
		stations.append(nearest_station)
		start = nearest_station

	station_js = []
	for stat in stations:
		station_js.append({'id': str(stat.id), 'name': str(stat.name), 'lat': str(stat.latitude), 'lng': str(stat.longitude)})

	route = {'route': line, 'stations': station_js}
	routes.append(route)

lines_json = json.JSONEncoder().encode(routes)
print lines_json
