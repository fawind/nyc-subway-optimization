import math
import json
import pyhdb

import credentials
from mapbounds import *


class DBHandler:
    def __init__(self):
        # get credentials from config
        user, password = credentials.get_credentials()

        self.connection = pyhdb.connect(
            host="192.168.30.206",
            port=30015,
            user=user,
            password=password
        )

        # prevent creation of identically named views at the same time
        self.station_out_id = 0

    def get_entry(self):
        cursor = self.connection.cursor()
        cursor.execute("SELECT COUNT(TOTAL) FROM NYCCAB.FARE WHERE TOTAL > 0")

        return cursor.fetchone()

    def get_cluster(self, lat_st, lng_st):
        cursor = self.connection.cursor()

        # number representing amount of clusters in each direction (east/north in this case)
        raster_deg = 10.0

        offset_lng = get_lng_diff() / (raster_deg * 2)
        offset_lat = get_lat_diff() / (raster_deg * 2)

        # limiters for each side of the area we look on
        lat = get_bottom_right()['lat'] + offset_lat
        lat_max = get_top_left()['lat']

        lng = get_top_left()['lng'] + offset_lng
        lng_max = get_bottom_right()['lng']

        cur_id = self.station_out_id
        self.station_out_id = self.station_out_id + 1

        # 1. Get all outgoing Rides from within the station area (add rectangle around it)
        #   -> Create temporary View
        # 2. Get amount of rides ending in a specific rectangular area
        #   -> Unioned Select count statement on given view
        # 3. for each rectangle get the ending rides
        #   -> aggregate in JSON to return


        # create temporary view to operate on
        create_view = "CREATE VIEW NYCCAB.STATION_OUT" + str(cur_id) + \
                " (ID, PICKUP_LONG, PICKUP_LAT, DROPOFF_LONG, DROPOFF_LAT) \
                AS SELECT ID, PICKUP_LONG, PICKUP_LAT, DROPOFF_LONG, DROPOFF_LAT \
                FROM NYCCAB.TRIP \
                WHERE PICKUP_LONG < %s AND PICKUP_LONG > %s \
                AND PICKUP_LAT < %s AND PICKUP_LAT > %s \
                WITH READ ONLY" \
                % (str(lng_st + offset_lng), str(lng_st - offset_lng),
                str(lat_st + offset_lat), str(lat_st - offset_lat))

        cursor.execute(create_view)
        print 'INFO: Created Temporary View'


        # generate query for each destination area and store in list
        query_list = []
        # start in the south of manhatten/NY
        while lat < lat_max:
            # start in the west of manhatten/NY
            while lng < lng_max:
                query_list.append("SELECT COUNT(ID), "+str(lat)+", "+str(lng)+" \
                        FROM NYCCAB.STATION_OUT" + str(cur_id) + \
                        " WHERE DROPOFF_LONG < %s AND DROPOFF_LONG > %s \
                        AND DROPOFF_LAT < %s AND DROPOFF_LAT > %s" \
                        % (str(lng + offset_lng), str(lng - offset_lng),
                        str(lat + offset_lat), str(lat - offset_lat)))

                # increase longitude for next iteration
                lng = lng + get_lng_diff() / raster_deg

            # increase latitude for next iteration
            lat = lat + get_lat_diff() / raster_deg
            # reset longitude
            lng = get_top_left()['lng']

        query = " UNION ALL ".join(query_list)

        cursor.execute(query)
        print "INFO: Executed Query"

        # transform result to specified structure
        result_set = []
        for elem in cursor.fetchall():
            cluster = {'count': elem[0], 'lat': float(elem[1]), 'lng': float(elem[2])}
            result_set.append(cluster)

        # drop temporary view after query-execution
        drop_view = "DROP VIEW NYCCAB.STATION_OUT" + str(cur_id)

        cursor.execute(drop_view)
        print "INFO: Dropped temporary View"


        return json.JSONEncoder().encode(result_set);

    # naive way to cluster data without using a temporary view (return not yet implemented)
    def get_cluster_basic(self, lat_st, lng_st):
        cursor = self.connection.cursor()

        raster_deg = 20.0
        offset_lng = get_lng_diff() / (raster_deg * 2)
        offset_lat = get_lat_diff() / (raster_deg * 2)

        # 1. Get all outgoing Rides from within the station area (add rectangle around it)
        # 2. Get amount of rides ending in a specific rectangular area
        # --> Loop:
        # 3. for each rectangle get the ending rides
        lat = get_bottom_right()['lat'] + offset_lat
        lat_max = get_top_left()['lat']

        lng = get_top_left()['lng'] + offset_lng
        lng_max = get_bottom_right()['lng']


        # start in the bottom of manhatten/NY
        while lat < lat_max:
            while lng < lng_max:
                query = "SELECT COUNT(ID) FROM NYCCAB.TRIP \
                        WHERE DROPOFF_LONG < %s AND DROPOFF_LONG > %s \
                        AND DROPOFF_LAT < %s AND DROPOFF_LAT > %s \
                        AND PICKUP_LONG < %s AND PICKUP_LONG > %s \
                        AND PICKUP_LAT < %s AND PICKUP_LAT > %s" \
                        % (str(lng + offset_lng), str(lng - offset_lng),
                        str(lat + offset_lat), str(lat - offset_lat),
                        str(lng_st + offset_lng), str(lng_st - offset_lng),
                        str(lat_st + offset_lat), str(lat_st - offset_lat))

                print 'start query'
                cursor.execute(query)
                print cursor.fetchone()[0]

                # increase longitude for next iteration
                lng = lng + get_lng_diff() / raster_deg

            # increase latitude for next iteration
            lat = lat + get_lat_diff() / raster_deg
            # reset longitude
            lng = get_top_left()['lng']

        return 0;

