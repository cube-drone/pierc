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
	if( $_GET['search'] != "" && $_GET['search'] != NULL)
	{
		$search = $_GET['search'];
	}
	else
	{
		$search = "Poop";
	}
	
	$results = $pdb->get_search_results( "sfucsss", $search, $n );
	if (!$results)
	{
		print "<div class='error'>We're sorry, the search term you entered could not be found.  Please enjoy this search for the word 'poop', instead. </div>";
		$results = $pdb->get_search_results( "sfucsss", "poop", $n );
	}
	
	foreach ($results as $line)
	{
		print "\t\t" . "<li class='filler'></li>";
		print "\t\t" . irc_display($line);
		print "\t\t" . "<li class='filler'></li>";
	}

	?>
	</ul>
</div>
</body>
</html>