<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" charset="UTF-16">
<head> 
	<title>AutoBoose: The Last 50 Things Said.</title>
	<link rel="stylesheet" href="style.css" type="text/css" />
	
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.3.2/jquery.min.js"> </script>
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.7.1/jquery-ui.min.js"> </script>
	<script type="text/javascript" src="autoboose.js"> </script>

</head>
<body>
	
<div id="toolbar"> 
	<div id="toolbar_inner">
	
	<form style="display:inline;" action="#">
		<input id="searchbox" type="text" />
		<input id="search" type="submit" value="Search"/>
	</form>
	<a id="home" href="#">Home</a> | 
	<a id="refresh" href="#">Refresh</a> | 
	<a id="prev" href="#"><<</a> | 
	<a id="next" href="#">>></a>
	<img id="loading" src="images/ajax-loader.gif"/>
	</div>

</div>	
	
<div id="content">
	
	<table id="irc">
	</table>
	
</div>

</body>
</html>