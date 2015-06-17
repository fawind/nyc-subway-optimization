import time

from app.hana import DBHandler

def measure_clustering():
	db = DBHandler()

	runs = 1


	# Test 168th St.
	sum = 0
	for i in range(runs):
		start = time.time()
		res_1 = db.get_cluster(40.8407193325, -73.9395609999)
		diff = time.time() - start
		sum = sum + diff

	print 'average for get_cluster with view (168th St.): ' + str(float(sum)/float(runs)) + ' s'

	sum = 0
	for i in range(runs):
		start = time.time()
		res_2 = db.get_cluster_squery(40.8407193325, -73.9395609999)
		diff = time.time() - start
		sum = sum + diff

	print 'average for get_cluster without view (168th St.): ' + str(float(sum)/float(runs)) + ' s'


	print (res_1 == res_2)


	# Test Grand St.
	sum = 0
	for i in range(runs):
		start = time.time()
		res_1 = db.get_cluster(40.718267332, -73.9937529993)
		diff = time.time() - start
		sum = sum + diff

	print 'average for get_cluster without view (Grand St.): ' + str(float(sum)/float(runs)) + ' s'


	sum = 0
	for i in range(runs):
		start = time.time()
		res_2 = db.get_cluster_squery(40.718267332, -73.9937529993)
		diff = time.time() - start
		sum = sum + diff

	print 'average for get_cluster with view (Grand St.): ' + str(float(sum)/float(runs)) + ' s'


	print (res_1 == res_2)
