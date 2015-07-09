CREATE TABLE "SUBWAY_STATION" (
    "id" integer NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" varchar(36) NOT NULL,
    "lines" varchar(10) NOT NULL,
    "latitude" decimal NOT NULL,
    "longitude" decimal NOT NULL
);

COMMIT;
