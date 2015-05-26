import pyhdb
import credentials

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

    def get_entry(self):
        cursor = self.connection.cursor()
        cursor.execute("SELECT COUNT(TOTAL) FROM NYCCAB.FARE WHERE TOTAL > 0")

        return cursor.fetchone()
