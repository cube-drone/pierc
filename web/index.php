<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" charset="UTF-16">
<head> 
	<title>IRC Archive</title>
	<link rel="stylesheet" href="style.css" type="text/css" />
	
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"> </script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/jquery-ui.min.js"> </script>
	<script type="text/javascript" src="LumberJack_js_app.js"> </script>

</head>
<body>
	
<div id="toolbar"> 
	<div id="toolbar_inner">
	
	<form id="search" style="display:inline;" action="#loading">
		<input id="searchbox" tabindex="1" type="text" />
		<input tabindex="2" type="submit" value="Search"/>
	</form>
	<a id="home" href="#">Home</a> |
	<a id="events" href="#">Events</a> |
	<a id="important" href="#">Important</a>
	<span id="options"> |
	<a id="prev" href="#"><<</a> | 
	<a id="next" href="#">>></a> </span>
	<img id="loading" src="images/ajax-loader.gif"/>
	</div>

</div>	
	
<div id="content">
	
	<table id="irc">
	</table>
	<div id="bottom"></div>
	
</div>

<div id="footer">
	Powered by <a href="http://curtis.lassam.net/software/lumberjack/">LumberJack</a> v1.1
</div>

</body>
</html>