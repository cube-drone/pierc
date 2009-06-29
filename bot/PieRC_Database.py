import MySQLdb
import config
import datetime

class PieRC_Database:
	
	def __init__(self, server, port, database, user, password):
		try:
			self.conn = MySQLdb.connect ( host = server,
								port = port, 
								user = user,
								passwd = password,
								db = database )
			self.cursor = self.conn.cursor()
            
		except MySQLdb.Error, e:
			print "Error %d: %s" % (e.args[0], e.args[1])
			exit(1)

	def __del__(self):
		self.conn.close()
        
	def create_table(self):
		self.cursor.execute(
		"""
			CREATE TABLE IF NOT EXISTS main
			(
				id      INT(12) NOT NULL AUTO_INCREMENT PRIMARY KEY,
				channel VARCHAR(16),
				name    VARCHAR(16),
				time    DATETIME,
				message TEXT,
				type    VARCHAR(10),
				hidden  CHAR(1)
			) engine = InnoDB;
			
			CREATE TABLE IF NOT EXISTS feeds
			(
<<<<<<< .mine
				id		INT(5) NOT NULL AUTO_INCREMENT PRIMARY KEY, 	
				url		TEXT,
=======
				id	INT(5) NOT NULL AUTO_INCREMENT PRIMARY KEY, 	
				url	TEXT,
>>>>>>> .r43
				name	VARCHAR(30)
			) engine = InnoDB;
			
			CREATE TABLE IF NOT EXISTS redditusers
			(
<<<<<<< .mine
				id		INT(5) NOT NULL AUTO_INCREMENT PRIMARY KEY,
=======
				id	INT(5) NOT NULL AUTO_INCREMENT PRIMARY KEY,
>>>>>>> .r43
				reddituser	VARCHAR(30)
			)engine = InnoDB;
			""")

	def insert_line(self, channel, name, time, message, msgtype, hidden = "F"):
		"""
		Sample line: "sfucsss, danly, 12:33-09/11/2009, I love hats, normal, 0"
		"""
		query =	"INSERT INTO main (channel, name, time, message, type, hidden) VALUES" + \
		"(\""+self.conn.escape_string(channel)+ "\"," + \
		"\""+self.conn.escape_string(name)+"\"," + \
		""+time+"," + \
		"\""+self.conn.escape_string(message)+"\"," + \
		"\""+self.conn.escape_string(msgtype)+"\"," + \
		"\""+self.conn.escape_string(hidden)+"\")"
		
		print query
		self.cursor.execute(query)

	def insert_now(self, channel, name, message, msgtype, hidden = "F" ):
		self.insert_line(channel, name, "NOW()", message, msgtype, hidden)
		
	def commit(self):
		self.conn.commit()
		
	def lastseen(self, username):
		""" When was the last time username was seen? """
		query = """
			SELECT time 
				FROM main 
				WHERE name = %s ORDER BY id DESC LIMIT 1;
				"""
		self.cursor.execute( query, (username, ) )
		result = self.cursor.fetchone()
		if result:
			return result[0]
		else:
			return False
	
	def feeds(self):
		""" List the feeds that AutoBoose watches """
		query = """
			SELECT id, name
				FROM feeds;
				"""
		self.cursor.execute( query )
		result = self.cursor.fetchall()
		if result:
			return result
		else:
			return False
			
	def feed(self, id):
		""" Get the URL of a feed that AutoBoose watches """
		query = """
			SELECT name, url
				FROM feeds WHERE id = %s;
				"""
		self.cursor.execute( query, (id, ) )
		result = self.cursor.fetchone()
		if result:
			return result
		else:
			return False
			
	def addfeed(self, name, url):
		""" Add a feed """
		query = """
			INSERT INTO feeds (name, url) VALUES (%s, %s);
				"""
		
		print query;
		self.cursor.execute( query, (name, url) )
		return True
	
	def deletefeed(self, id):
		""" Add a feed """
		query = """
			DELETE FROM feeds WHERE id = %s;
				"""
		print query;
		self.cursor.execute( query, (id, ) )
		return True
		
	def reddits(self):
		""" List the reddit users that AutoBoose watches """
		query = """
			SELECT id, reddituser
				FROM redditusers;
				"""
		self.cursor.execute( query )
		result = self.cursor.fetchall()
		if result:
			return result
		else:
			return False
			
	def addreddit(self, name):
		""" Add a reddit user """
		query = """
			INSERT INTO redditusers (reddituser) VALUES (%s);
				"""
		print query;
		self.cursor.execute( query, (name, ) )
		return True
	
	def deletereddit(self, id):
		""" Add a feed """
		query = """
			DELETE FROM redditusers WHERE id = %s;
				"""
		print query;
		self.cursor.execute( query, (id, ) )
		return True
		

if __name__ == "__main__":
	mysql_config = config.config("mysql_config.txt")
	db = PieRC_Database( mysql_config["server"],
						int(mysql_config["port"]),
						mysql_config["database"], 
						mysql_config["user"],
						mysql_config["password"])
	print db.create_table() 
        
        
        
    
