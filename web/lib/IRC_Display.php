
<?php
function page( $line, $prev_next="prev") 
{
	if( $prev_next == "prev")
	{
		$id = $line['id']-9;
		$name = "&lt;&lt;&nbsp;Go Back";
	}
	else
	{
		$id = $line['id']+9;
		$name = "Go Forward&nbsp;&gt;&gt;";
	}
	$text = "<a class='page' href='context.php?id=".$id."&n=20&channel=". $line["channel"] ."'>$name</a>";
	return $text;
}

function irc_display( $line )
// Convert a $line- an associative array containing
// 	time (the time the message was logged), 
// 	name (the name of the message's author),
// 	type (the type of message- pubmsg, join, part, action, topic, nick)
// 	message (the content of the message)
// 	channel (the channel to which the message was posted) and 
// 	hidden (whether or not the line should be hidden - F or T) 
// into a html string - as <li class='$type'> (text) </li> 
{
	if ( $line['hidden'] != "F" ) { return "";}
	
	$line['message'] = htmlspecialchars( $line['message'] );
	$line['message'] = link_to_html($line['message']);
	
	// special PFAK line
	if ($line['name'] == 'pfak')
	{
		$line['message'] == preg_replace( '[A-Za-z]* ', 'bork', $line['message'] ); 
	}
	
	
	
	$extraclass = "";
	if ( $line['id'] == $_GET['id'])
	{
		$extraclass = "special";
	}
	
	$prelude = " <li class='".$line['type']." ".$extraclass."'>" 
					."<a class='tiny_button' href='context.php?id=".$line["id"]."&n=20&channel=". $line["channel"] ."'><img src='images/sweetie_pack_icons/12-em-up.png' /></a>"
					."<span class='time'>(" . $line["time"] . "): </span>"
					."<span class='name'>" . $line["name"] . "</span>" ;
	
	switch( $line['type'] )
		{
			case "pubmsg":
				return $prelude	. ": " . $line["message"] . "</li>\n";
				break;
			case "join":
				return $prelude . " has joined #" . $line["channel"] . " </li>\n";
				break;
			case "part":
				return $prelude . " has left #" . $line["channel"] . ". </li>\n";
				break;
			case "action":
				return $prelude . " " . $line["message"] . "</li>\n";
				break;
			case "topic":
				return $prelude . " has changed the topic:  <br />" . $line["message"] . "</li>\n";
				break;
			case "nick":
				// \todo The logger should cram the *new* nick in $line["message"] or something.  
				return $prelude . " has changed his nick.  " . $line["message"] . "</li>\n";
				break;
			default: 
				return $prelude . ": " . $line["message"] . "</li>\n";
		}
}

function link_to_html( $string ) 
// Checks a string $s for sections that start with "http://" and converts them to proper html links. 
{
	// \todo Is that all the valid HTTP request characters? Dunno.
	// ""
	return preg_replace( '/(http:\/\/[0-9#\(\);A-Za-z:~\.%\/\?&+=_-]*)/',
							'<a href=\'$0\'>$0</a>', $string );
}


?>