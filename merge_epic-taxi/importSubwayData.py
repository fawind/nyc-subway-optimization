from django.core.management.base import BaseCommand
from NYC_TAXI.settings import BASE_DIR
from lxml import etree
import os
from NYCCAB.models import SubwayStation
from decimal import *

class Command(BaseCommand):

	xmlns = '{http://www.opengis.net/kml/2.2}'

	def handle(self, *args, **options):
		path = os.path.join(BASE_DIR,"data/Subway Stations.kml")
		root = etree.parse(path)
		root = etree.fromstring(etree.tostring(root))

		SubwayStation.objects.all().delete()

		set_count = 1

		for child in root[0]:

			# each station is a placemark (map representation) which contains 
			# location information as well as name and line of the station
			if child.tag == self.xmlns + 'Placemark':
				self.storeData(child, set_count)
				set_count = set_count + 1


	def storeData(self, root, id):
		# for each station go through the tags and work with the required information
		for data in root:
			if data.tag == self.xmlns + 'description':
				name = self.getStationName(data.text)
				lines = self.getLineNames(data.text)

			if data.tag == self.xmlns + 'LookAt':
				longitude = Decimal(data[0].text)
				latitude = Decimal(data[1].text)

		sub_station = SubwayStation(id=id, name=name, latitude=latitude, longitude=longitude, lines=lines)
		sub_station.save()


	def getStationName(self, text):
		start = text.find('<ul class="textattributes">')
		end = text.find('</ul>') + len('</ul>')
		root = etree.XML(text[start:end])
		return root[0][1].text


	def getLineNames(self, text):
		start = text.find('<ul class="textattributes">')
		end = text.find('</ul>') + len('</ul>')
		root = etree.XML(text[start:end])
		lines = root[2][1].text.split('-')

		for line in lines:
			# remove express stations (subset of normal stations)
			if len(line) > 1:
				lines.remove(line)

		return '-'.join(lines)
