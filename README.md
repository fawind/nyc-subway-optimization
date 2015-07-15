Epic-Taxi
===================

### Installation

```
clone repo

# install required packages (node, npm)
npm install

# install frontend dependencies
cd public
bower install
```

Finally add and modify the [credentials.js file](https://gist.github.com/AlexImmer/03ed4f3fd047b4d591e2) in the /app directory.

```
# run the server
node app.js
# run the server in debug-mode
DEBUG=[modules]:* node app.js

# now open your browser with
localhost:8080/index.html
```

### Structure

##### Backend: Node with Express: [docs](http://expressjs.com/api.html)

##### Frontend: Angular, d3.js


```
app.js              -- Start server
/public             -- Frontend
  |-index.html
  |-...
/app                -- Backend
  |--routes.js      -- Routing
  |--hana.js        -- Hana Connector
  |--queries.js     -- Database queries
  |--credentials.js -- Modify this file
  /utils         -- Geo Utils for Lat/Lng calculations
     |-...
```

### Data Transformation and Insert

Definitely working under Python 2.7.9 with the following requirements:

* lxml==3.4.4
* pyhdb==0.2.3

Now download [Subway-Stations](https://data.cityofnewyork.us/api/geospatial/arq3-7z49?method=export&format=KML) and put it into /data in the directory of `importSubwayData.py`. Download [credentials.py](https://gist.github.com/AlexImmer/e85abf560ab5f85055ce), put it into the script´s directory and modify the data for your needs.

```Bash
python importSubwayData
```

Will then create a new Table inside *NYCCAB*-Database and insert all the subway stations.
