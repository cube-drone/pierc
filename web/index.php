<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head> 
	<title>The Last 50 Things Said.</title>
	<link rel="stylesheet" href="style.css" type="text/css" />
</head>
<body>
<div id="content">
	<ul class="irc">
	<?php 
	include("lib/PieRC_Database.php");

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
		switch( $line['type'] )
		{
			case "pubmsg":
				print "<li class='pubmsg'> "
							. "<span class='time'>(" . $line["time"] . "):</span>" 
							. "<span class='name'>" . $line["name"] . "</span>: &nbsp;"
							. $line["message"] . "</li>\n";
				break;
			case "join":
				print "<li class='join'>" 
						. "<span class='time'>(" . $line["time"] . "):</span>"  
						. "<span class='name'>" . $line["name"] . "</span>" 
						. " has joined #sfucsss. </li>\n";
				break;
			case "part":
				print "<li class='part'>" 
						. "<span class='time'>(" . $line["time"] . "):</span>"  
						. " <span class='name'>" . $line["name"] . "</span> has left #sfucsss. </li>\n";
				break;
			case "action":
				print "<li class='action'>"
						."<span class='time'>(" . $line["time"] . "):</span>"  
						."<span class='name'>" . $line["name"] . "</span> " . $line["message"] . "</li>\n";
				break;
			default: 
				print "<li class='".$line["type"]."'><span class='name'>" . $line["name"] . "</span>: &nbsp;" . $line["message"] . "</li>\n";
		}
	}

	?>
	</ul>
</div>
</body>
</html>