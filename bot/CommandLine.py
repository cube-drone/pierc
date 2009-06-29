import PieRC_Database
import time
	
class CommandExecutor:
	def __init__(self, db):
		self.db = db
		self.commands = [ Command(), Feeds(self.db), Reddits(self.db), LastSeen(self.db), Mumbler() ]
	
	def run_commands(self, input_text):
		for command in self.commands:
			result = command.run( input_text )
			if result:
				return result
			#try:
			#	result = command.run( input_text )
			#	if result:
			#		return result
			#except Exception:
			#	return "Command has failed.";
			#	print Exception;
		return "I'm sorry, I don't understand that."

class Command:
	def run(self, input_text):
		return self.command( input_text.split(" ") )
		
	def command(self, args):
		return False;	
		
class DB_Command(Command):
	def __init__(self, db):
		self.db = db
		
class Mumbler(Command):
	def command(self, args):
		try:
			time.sleep( 2 )
			chatterfile = open("chatter.txt", 'r+')
			chatterfile.seek(0, 2)
			eof = chatterfile.tell()
			counter = -1
			while 1:
				counter -= 1
				chatterfile.seek(counter, 1)
				line = chatterfile.read()
				if line.startswith("\n"):
					chatterfile.seek(counter + 1, 1)
					chatterfile.truncate( eof + counter ) 
					return line[1:].strip("\n")
		except IOError:
			return "I'm broken.  Tell me to go away before I cough up my entrails. :("
			
class EchoArgs(Command):
	def command(self, args):
		blup = ""
		for arg in args:
			blup += arg + ", "
		return blup
		
class LastSeen(DB_Command):
	def command(self, args):
		if args[1] and args[1] == "lastseen":
			if args[2]:
				return self.db.lastseen(args[2]).__str__()
		return False
		
class Feeds(DB_Command):
	def command(self, args):
		if args[1] and args[1] == "feeds":
			feedstring = ""
			for feed in self.db.feeds():
				feedstring += str( feed[0]) + ":" + str(feed[1]) + ", " 
			return feedstring
		if args[1] and args[1] == "feed":
			if args[2] and int(args[2]) :
				result = self.db.feed( int(args[2]) )
				return str( result[0] ) + " : " + str(result[1])
		if args[1] and args[1] == "deletefeed":
			if args[2] and int(args[2]) :
				result = self.db.deletefeed( int(args[2]) )
				return "Done"
		if args[1] and args[1] == "addfeed":
			if args[2]:
				if args[3] and args[3].startswith("http://"):
					self.db.addfeed( args[2], args[3] )
					return "Done"
		return False
		
class Reddits(DB_Command):
	def command(self, args):
		if args[1] and args[1] == "reddits":
			redstring = ""
			for reddit in self.db.reddits():
				redstring += str( reddit[0]) + ":" + str(reddit[1]) + ", " 
			return redstring
		if args[1] and args[1] == "deletereddit":
			if args[2] and int(args[2]) :
				result = self.db.deletereddit( int(args[2]) )
				return "Done"
		if args[1] and args[1] == "addreddit":
			if args[2]:
				self.db.addreddit( args[2] )
				return "Done"
				
		return False
		
