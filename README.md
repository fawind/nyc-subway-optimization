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
