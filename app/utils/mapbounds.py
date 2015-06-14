import math

def get_top_left():
	return {'lng': -74.079760, 'lat': 40.924695}

def get_bottom_right():
	return {'lng': -73.689058, 'lat': 40.561053}

# lat and long diff are approximate
def get_lng_diff():
	return 0.39

def get_lat_diff():
	return 0.36

def translate(distance_m, bearing_deg, lng, lat):
	delta = (distance_m/1000.0) / 6371.0

	new_lat = math.asin(\
		math.sin(lat) * math.cos(delta) \
		+ math.cos(lat) * math.sin(delta) * math.cos(bearing_deg))

	new_lng = lng + math.atan2(\
		(math.sin(bearing_deg) * math.sin(delta) * math.cos(lat)), \
		(math.cos(delta) - math.sin(lat) * math.sin(new_lat)))

	return (new_lat, new_lng)