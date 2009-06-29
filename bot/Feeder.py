import httplib
import BeautifulSoup

class Feeder: 
	def __init__(self):
		feed = "feed://pipes.yahoo.com/pipes/pipe.run?_id=8L8S0Ppk3hG2rnwcqevxTA&_render=rss"
		self.conn = httplib.HTTPConnection("pipes.yahoo.com")
		self.already_viewed = []
		xml = self.get_feed()
		for x in xml('item'):
			self.already_viewed.append( x.title.string )
		
	def get_feed(self):
		self.conn.request("GET", "/pipes/pipe.run?_id=8L8S0Ppk3hG2rnwcqevxTA&_render=rss")
		r1 = self.conn.getresponse()
		xml = BeautifulSoup.BeautifulStoneSoup(r1);
		return xml
		
	def update(self):
		xml = self.get_feed()
		new = []
		for x in xml('item'):
			if not x.title.string in self.already_viewed:
				new.append( x.title.string + " --> " + x.link.string  )
		return new;
		
if __name__ == "__main__":
	fdr = Feeder()
	print fdr.update()
	
		