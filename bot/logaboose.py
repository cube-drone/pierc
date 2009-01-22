#! /usr/bin/env python
#

# TODO: Properly sanitize input
# TODO: Make sure commits happen regularly 


from ircbot import SingleServerIRCBot
from irclib import nm_to_n, nm_to_h, irc_lower, ip_numstr_to_quad, ip_quad_to_numstr
import irclib
import sys
import re

#mine
import PieRC_Database
import config


# ALL OF THE AUTOBOOSE SETTINGS GO IN HERE
server = "irc.freenode.net"
channel = "#sfucsss"
port = 6667
nick = "AutoBoose"

nick_reg = re.compile(nick)
disconnect_reg = re.compile("(disconnect)|(quit)|(leave)|(go away)|(vacate)|(gone)(?iu)")
echo_reg = re.compile("(echo)(?iu)")
# ALL OF THE AUTOBOOSE SETTINGS END HERE

class Logger(irclib.SimpleIRCClient):
	def __init__(self, target):
		irclib.SimpleIRCClient.__init__(self)
		self.target = target
		self.echo = False
		
		mysql_config = config.config("mysql_config.txt")
		self.db = PieRC_Database.PieRC_Database( mysql_config["server"],
									int(mysql_config["port"]),
									mysql_config["database"], 
									mysql_config["user"],
									mysql_config["password"])
		
	def _dispatcher(self, c, e):
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
		
			self.db.insert_now( channel.strip("#"), 			#channel
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
		sys.exit(0)
		
	def on_ping(self, connection, event):
		self.db.commit()

	def on_pubmsg(self, connection, event):
		text = event.arguments()[0]
		
		print "SOURCE: " + event.source();
		print "TARGET: " + event.target();
		for argument in event.arguments():
			print argument + ", "	

		# ALL OF THE AUTOBOOSE LOGIC GOES IN HERE
		if nick_reg.search(text):
			if disconnect_reg.search(text):
				connection.privmsg(channel, "Aww.")
				connection.action(channel, "... TRANSFORM AND ROLL OUT!")
				self.disconnect()
			if echo_reg.search(text) and not self.echo:
				self.echo = True
			elif echo_reg.search(text) and self.echo:
				self.echo = False
		if self.echo:
			connection.privmsg(channel, text)
		#ALL OF THE AUTOBOOSE LOGIC ENDS HERE

def main():

	c = Logger(channel)
	try:
		c.connect(server, port, nick)
	except irclib.ServerConnectionError, x:
		print x
		sys.exit(1)
	c.start()

if __name__ == "__main__":
	main()
