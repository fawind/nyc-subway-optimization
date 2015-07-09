CREATE PROCEDURE getUnservedRides(
  IN distance REAL,
  OUT result EDGES
)
LANGUAGE SQLSCRIPT
READS SQL DATA AS

BEGIN
  DECLARE edges TABLE(point_start ST_POINT, COUNTS INTEGER, point_end ST_POINT);
  DECLARE stations TABLE(point_station ST_POINT);

  stations = SELECT (NEW ST_POINT(LATITUDE, LONGITUDE)) AS point_station FROM NYCCAB.SUBWAY_STATION;

  edges = SELECT (NEW ST_POINT(LAT_OUT, LNG_OUT)) AS point_start,
  			         COUNTS,
                 (NEW ST_POINT(LAT_IN, LNG_IN)) AS point_end
          FROM NYCCAB.RIDE_EDGES;

  result = SELECT DISTINCT point_start.ST_X() AS LAT_OUT, point_end.ST_Y() AS LNG_OUT,
  						           COUNTS,
                         point_end.ST_X() AS LAT_IN, point_end.ST_Y() AS LNG_IN
         FROM (SELECT * FROM :edges JOIN :stations
              ON point_start.ST_WithinDistance(point_station, :distance, 'meter') = 0
              OR point_end.ST_WithinDistance(point_station, :distance, 'meter') = 0);

END;
