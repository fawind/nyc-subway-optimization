NYC-Subway-Optimization
===================

### Installation
Requires [node.js](https://nodejs.org/download/) and [bower](http://bower.io/#install-bower).
```bash
# clone the repository
git clone https://github.com/fawind/epic-subway.git
cd nyc-subway-optimization

# install required packages
npm install
```

Finally, modify the `credentials.js.default` file in the `/app` directory and save it as `credentials.js`.

### Run the app
```bash
# start the server
npm start
```

Now you can visit `localhost:8080` in your browser.

---

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
