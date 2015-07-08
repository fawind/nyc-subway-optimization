/*
 * Run the statement using:
 * CALL GETCIRCLEPAIRS (40.767706, 40.731733, -73.875005, -73.922572, 100, ?);
 */

CREATE PROCEDURE getCirclePairs(
  IN lat_max REAL,
  IN lat_min REAL,
  IN lng_max REAL,
  IN lng_min REAL,
  IN distance REAL,
  OUT out1 T_POINTS)
LANGUAGE SQLSCRIPT
READS SQL DATA AS

BEGIN
  DECLARE rides1 TABLE(point_a ST_POINT);
  DECLARE rides2 TABLE(point_b ST_POINT);

  rides1 = SELECT (NEW ST_POINT(PICKUP_LONG, PICKUP_LAT)) AS point_a FROM
        (SELECT DISTINCT PICKUP_LAT, PICKUP_LONG FROM NYCCAB.TRIP
        WHERE DROPOFF_LONG < :lng_max AND DROPOFF_LONG > :lng_min
        AND DROPOFF_LAT < :lat_max AND DROPOFF_LAT > :lat_min);

  rides2 = SELECT point_a AS point_b FROM :rides1;

  out1 = SELECT * FROM :rides1 JOIN :rides2
      ON point_a.ST_WithinDistance(point_b, :distance, 'meter') = 1;
END;
