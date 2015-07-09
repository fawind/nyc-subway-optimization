CREATE PROCEDURE getUnservedRides(
  IN distance REAL,
  OUT edge EDGES
)
LANGUAGE SQLSCRIPT
READS SQL DATA AS

BEGIN
  DECLARE edges TABLE(point_start ST_POINT, counts integer, point_end ST_POINT);
  DECLARE stations TABLE(point_station ST_POINT);

  stations = SELECT (NEW ST_POINT(lat, lng)) AS point_station FROM
  			(SELECT LATITUDE as lat, LONGITUDE as lng FROM NYCCAB.SUBWAY_STATION);

  edges = SELECT (NEW ST_POINT(lat_out, lng_out)) AS point_start,
            (NEW ST_POINT(lat_in, lng_in)) AS point_end,
            "count" as counts
          FROM NYCCAB.RIDE_EDGES JOIN :stations
          ON point_start.ST_WithinDistance(point_station, :distance, 'meter') = 0
          OR point_end.ST_WithinDistance(point_station, :distance, 'meter') = 0;

  edge = SELECT DISTINCT point_start.ST_X() AS lat_out, point_end.ST_Y() AS lng_out,
                        point_end.ST_X() AS lat_in, point_end.ST_Y() AS lng_in, counts as "count" FROM :edges;

END;
