import httplib
import BeautifulSoup

# Stolen from Adam, from Stack Overflow. Thanks Adam!		
def smart_truncate(content, length=100, suffix='...'):
    if len(content) <= length:
        return content
    else:
        return ' '.join(content[:length+1].split(' ')[0:-1]) + suffix	

class Feeder: 
	def __init__(self):
		feed = "feed://pipes.yahoo.com/pipes/pipe.run?_id=8L8S0Ppk3hG2rnwcqevxTA&_render=rss"
		self.conn = httplib.HTTPConnection("pipes.yahoo.com")
		self.already_viewed = []
		xml = self.get_feed()
		for x in xml('item'):
			self.already_viewed.append( x.title.string )
		
	def get_feed(self):
		try:
			self.conn.request("GET", "/pipes/pipe.run?_id=8L8S0Ppk3hG2rnwcqevxTA&_render=rss")
			r1 = self.conn.getresponse()
			xml = BeautifulSoup.BeautifulStoneSoup(r1);
			return xml
		except:
			return False
		
	def update(self):
		try:
			xml = self.get_feed()
			if not xml:
				return False
			new = []
			for x in xml('item'):
				if not x.title.string in self.already_viewed:
					self.already_viewed.append( x.title.string )
					new.append( x.title.string + " --> " + x.link.string + " :: " + smart_truncate(x.description.string)  )
			return new;
		except:
			return [];
	
	def top5(self):
		try:
			xml = self.get_feed()
			if not xml:
				return False
			new = []
			counter = 0
			for x in xml('item'):
				new.append( x.title.string + " --> " + x.link.string + " :: " + smart_truncate(x.description.string)  )
				counter += 1
				if counter == 5:
					break
			return new;
		except:
			return new;	
		
if __name__ == "__main__":
	fdr = Feeder()
	print fdr.top5()
	
		