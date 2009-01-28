<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head> 
	<title>The Last 50 Things Said.</title>
	<link rel="stylesheet" href="style.css" type="text/css" />
</head>
<body>
	
<div id="content">
<?php
include('mainmenu.php');
print get_main_menu();
?>
	<ul class="irc">
	<?php 
	include("lib/PieRC_Database.php");
	include("lib/IRC_Display.php");

	$pdb = new pie_db( "mysql.lassam.net", "", "pierc", "pierc", "thedayofthetriffids" );
	if( $_GET['n'] != "" && $_GET['n'] != NULL)
	{
		$n = $_GET['n'];
	}
	else
	{
		$n = 50;
	}
	foreach ($pdb->get_last_n_lines( "sfucsss", $n ) as $line)
	{
		print "\t\t" . irc_display($line);
	}

	?>
	</ul>
</div>
</body>
</html>