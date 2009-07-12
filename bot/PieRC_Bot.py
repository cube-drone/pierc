#! /usr/bin/env python
#

#libs
from ircbot import SingleServerIRCBot
from irclib import nm_to_n, nm_to_h, irc_lower, ip_numstr_to_quad, ip_quad_to_numstr
import irclib
import sys
import re
import time

#mine
import PieRC_Database
import config


# Configuration

class Logger(irclib.SimpleIRCClient):
	
	def __init__(self, server, port, channel, nick, mysql_server, mysql_port, mysql_database, mysql_user, mysql_password):
	
		irclib.SimpleIRCClient.__init__(self)
		self.server = server
		self.port = port
		self.target = channel
		self.channel = channel
		self.nick = nick
		
		self.nick_reg = re.compile("^" + nick + "[:,](?iu)")
		self.disconnect_reg = re.compile("(\sdisconnect)|(\squit)(?iu)")
		
		self.echo = False
		
		# On creating the Bot, instantiate the database 
		self.db = PieRC_Database.PieRC_Database( mysql_server,
												 mysql_port,
												 mysql_database, 
											   	 mysql_user,
												 mysql_password)
		self.connect(self.server, self.port, self.nick)
		
	def _dispatcher(self, c, e):
	# This determines how a new event is handled. 
		if(e.eventtype() == "topic" or 
		   e.eventtype() == "part" or
		   e.eventtype() == "join" or
		   e.eventtype() == "action" or
		   e.eventtype() == "nick" or
		   e.eventtype() == "pubmsg"):
			try: 
				source = e.source().split("!")[0]
			except IndexError:
				source = ""
			try:
				text = e.arguments()[0]
			except IndexError:
				text = ""
		
			# Most of the events are pushed to the buffer. 
			if e.eventtype() == "nick":
				self.db.insert_now( self.channel.strip("#"), 		#channel
								source, 						#name
								e.target(), 					#message
								e.eventtype() 					#message type
								)
			else:
				self.db.insert_now( self.channel.strip("#"), 		#channel
								source, 						#name
								text, 							#message
								e.eventtype() 					#message type
								)
			
		
		m = "on_" + e.eventtype()	
		if hasattr(self, m):
			getattr(self, m)(c, e)

	def on_nicknameinuse(self, c, e):
		c.nick(c.get_nickname() + "_")

	def on_welcome(self, connection, event):
		if irclib.is_channel(self.target):
			connection.join(self.target)

	def on_disconnect(self, connection, event):
		self.db.commit()
		
	def on_ping(self, connection, event):
		try:
			self.db.commit()
		except:
			print "Database Commit Failed! Let's wait a bit!" 
			connection.privmsg(self.channel, "cough cough" )
			self.db.insert_now( self.channel.strip("#"), 		#channel
								self.nick, 						#name
								"coughs" , 						#message
								'action'	 					#message type
								)

	def on_pubmsg(self, connection, event):
		text = event.arguments()[0]

		# If you talk to the bot, this is how he responds.
		if self.nick_reg.search(text):
			if self.disconnect_reg.search(text):
				connection.privmsg(self.channel, "Aww.")
				connection.action(self.channel, "... TRANSFORM AND ROLL OUT!")
				sys.exit( 0 ) 
				
			if text.split(" ")[1] and text.split(" ")[1] == "ping":
				self.on_ping(connection, event)
				return

def main():

	mysql_settings = config.config("mysql_config.txt")
	irc_settings = config.config("irc_config.txt")
	
	c = Logger(
				irc_settings["server"], 
				int(irc_settings["port"]), 
				irc_settings["channel"], 
				irc_settings["nick"],
				mysql_settings["server"],
				int(mysql_settings["port"]),
				mysql_settings["database"],
				mysql_settings["user"],
				mysql_settings["password"]) 
	while True:			
		try:
			c.start()
		except Exception, x:
			print x
	
if __name__ == "__main__":
	main() 