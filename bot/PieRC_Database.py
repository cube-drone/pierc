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
				id	INT(5) NOT NULL AUTO_INCREMENT PRIMARY KEY, 	
				url	TEXT,
				name	VARCHAR(30)
			) engine = InnoDB;
			
			CREATE TABLE IF NOT EXISTS redditusers
			(
				id	INT(5) NOT NULL AUTO_INCREMENT PRIMARY KEY,
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
		

if __name__ == "__main__":
	mysql_config = config.config("mysql_config.txt")
	db = PieRC_Database( mysql_config["server"],
						int(mysql_config["port"]),
						mysql_config["database"], 
						mysql_config["user"],
						mysql_config["password"])
	print db.create_table() 
        
        
        
    
