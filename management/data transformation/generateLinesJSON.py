import os
import json
from django.core.management.base import BaseCommand
from NYCCAB.models import SubwayStation
import math

class Command(BaseCommand):
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


	def handle(self, *args, **options):
		# Check if given data in Dictionary is valid regarding starting stations
		# otherwise print invalid data
		failed = False
		for station in self.start_stations:
			if len(SubwayStation.objects.filter(name__icontains = station['station'], lines__icontains = station['line'])) != 1:
				print station
				print SubwayStation.objects.filter(name__icontains = station)
				failed = True

		if failed:
			return


		routes = []
		
		for station in self.start_stations:
			# For each station and the line it starts collect the nearest stations and create the line as array
			start = SubwayStation.objects.filter(name__icontains = station['station'], lines__icontains = station['line'])[0]
			line = station['line']
			stations = []

			possible_stations = list(SubwayStation.objects.filter(lines__icontains = line))

			while len(possible_stations) > 0:
				nearest_station = possible_stations[0]
				for pos_station in possible_stations:
					if self.distance(pos_station.latitude, pos_station.longitude, start.latitude, start.longitude) \
						< self.distance(nearest_station.latitude, nearest_station.longitude, start.latitude, start.longitude):
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

	    # Compute spherical distance from spherical coordinates.

	    # For two locations in spherical coordinates
	    # (1, theta, phi) and (1, theta, phi)
	    # cosine( arc length ) =
	    #    sin phi sin phi' cos(theta-theta') + cos phi cos phi'
	    # distance = rho * arc length

	    cos = (math.sin(phi1)*math.sin(phi2)*math.cos(theta1 - theta2) +
	           math.cos(phi1)*math.cos(phi2))
	    arc = math.acos( cos )

	    # return in kilometres
	    return (arc * 6371)