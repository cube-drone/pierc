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

	<?php 
	include("lib/PieRC_Database.php");
	include("lib/IRC_Display.php");

	if( $_GET['n'] != "" && $_GET['n'] != NULL)
	{
		$n = $_GET['n'];
	}
	else
	{
		$n = 20;
	}
	if( $_GET['id'] != "" && $_GET['id'] != NULL)
	{
		$id = $_GET['id'];
	}
	else
	{
		$id = 10;
	}
	if( isset( $_GET['channel'] ) )
	{
		$channel = $_GET['channel'];
	}
	else
	{
		$channel = "sfucsss";
	}
	
	
	$pdb = new pie_db( "mysql.lassam.net", "", "pierc", "pierc", "thedayofthetriffids" );
	$context = $pdb->get_context( $channel, $id,  $n );
	
	if ( count( $context ) == 0 )
	{
		print "</div></body></html>";
		exit();
	}
	
	$firstline = $context[0];
	
	print page( $firstline, "prev" );
	
	print "<ul class='irc'>";
	
	$lastline = $firstline;
	foreach ($context as $line)
	{
		print "\t\t" . irc_display($line);
		$lastline = $line;
	}
	print "</ul>";
	
	print page( $lastline, "next" );

	?>
</div>
</body>
</html>