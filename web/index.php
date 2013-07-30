<?php 
// All of the JSON calls are handled here. 

error_reporting( E_ERROR | E_WARNING | E_PARSE ); 

include("pierc_db.php");
include("config.php");

$pdb = config::get_db();
$channels = $pdb->get_channels() ;
?>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en" charset="UTF-16">
<head> 
	<title>IRC Archive</title>
	<link rel="stylesheet" href="<?php config::get_theme("style.css") ?>" type="text/css" />
	<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;">
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js"> </script>
	<script type="text/javascript" src="//ajax.googleapis.com/ajax/libs/jqueryui/1.9.1/jquery-ui.min.js"> </script>
	<script type="text/javascript" src="pierc.js"> </script>
	<meta name="viewport" content="width=device-width; initial-scale=1.0; maximum-scale=1.0;">

</head>
<body>
	
<div id="toolbar"> 
	<div id="toolbar_inner">
	
	<div class="toolbar-break">
		<select id="channellist">
			<?php
				foreach ($channels as $channel) {
					echo "<option>".$channel."</option>";
				}
			?>
		</select>

		<form id="search" style="display:inline;" action="#loading">
			<input id="searchbox" placeholder="Search" tabindex="1" type="text" />
			<input id="searchbutton" tabindex="2" type="submit" value="Search"/>
		</form>
	</div>
	<a id="home" class='toolbutton' href="#">Home</a>
	<span id="searchoptions"> 
	<a id="load_more" class='toolbutton' href="#">More</a> 
	</span>
	<span id="options">
		<a id="prev" class='toolbutton' href="#">&laquo;</a> 
		<a id="next" class='toolbutton' href="#">&raquo;</a> 
	</span>
	<span id="hide-join-quit">
		<label><input id="join-quit-toggle" type="checkbox" /> hide join/quit</label>
	</span>
	<span id="inline-media-menu">
		<label><input id="inline-media-toggle" type="checkbox" checked="checked" /> enable inline media</label>
	</span>
	<img id="loading" src="<?php config::get_theme("ajax-loader.gif") ?>"/>
	</div>

</div>	

<div id="horrible_error" style="display:none;">
	<h2>Something Has Gone Spectacularly Wrong!</h2>
	<h3>Error:</h3>
	<div id="error"></div>
	<h3>Next Steps:</h3>
	<ul>
		<li> If you're not the maintainer of this site, please report it to... that guy. Boy is <em>he</em> in trouble. </li>
		<li> Did you follow the <a href="http://classam.github.com/pierc/">installation steps</a> properly? </li>
		<li> You're a smart guy (or girl). You have access to the source code. Figure it out. </li>
		<li> If you find a problem with the code (almost certain), please report it <a href='https://github.com/classam/pierc/issues'>here</a>. </li>
		<li> This error isn't going away until you restart the page. </li>
	</ul>
</div>
	
<div id="content">
	
	<ul id="irc">
	</ul>
	<div id="bottom"></div>
	
</div>

<div id="footer">
	Powered by <a href="http://classam.github.com/pierc/">Pierc</a>
</div>

</body>
</html>
