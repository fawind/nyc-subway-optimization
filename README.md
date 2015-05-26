Epic-Taxi
===================

### Installation

```
clone repo

# setup virtual environment
virtualenv --no-site-packages env
# activate environment
source env/bin/activate
# install required packages
pip install -r requirements.txt

# install frontend dependencies
cd public
bower install
```

Finally add [the credential file](https://gist.github.com/fawind/5e52b568c0a8f8636da2) as credentials.py in your root directory (same as app.py)

After that you can run the server from the project root (don't forget to start your virtual env each time!)
```
# run the server
python app.js

```

### Structure

##### Backend: Flask, Flask-RESTful: [docs](https://flask-restful.readthedocs.org/en/0.3.3/)

##### Frontend: ?Angular?, d3js


```
app.py           -- Start server
/public          -- Frontend
  |-index.html
  |-...
/app             -- Backend
  |--routes.py   -- Routing
  /handlers      -- Handlers for requests
     |-...
```
