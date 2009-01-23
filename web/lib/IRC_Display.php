
<?php
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
	$line['message'] = link_to_html($line['message']);
	switch( $line['type'] )
		{
			case "pubmsg":
				return "<li class='pubmsg'> "
							. "<span class='time'>(" . $line["time"] . "):</span>" 
							. "<span class='name'>" . $line["name"] . "</span>: &nbsp;"
							. $line["message"] . "</li>\n";
				break;
			case "join":
				return "<li class='join'>" 
						. "<span class='time'>(" . $line["time"] . "):</span>"  
						. "<span class='name'>" . $line["name"] . "</span>" 
						. " has joined #sfucsss. </li>\n";
				break;
			case "part":
				return "<li class='part'>" 
						. "<span class='time'>(" . $line["time"] . "):</span>"  
						. " <span class='name'>" . $line["name"] . "</span> has left #sfucsss. </li>\n";
				break;
			case "action":
				return "<li class='action'>"
						."<span class='time'>(" . $line["time"] . "):</span>"  
						."<span class='name'>" . $line["name"] . "</span> " . $line["message"] . "</li>\n";
				break;
			case "topic":
				return "<li class='topic'>"
						."<span class='time'>(" . $line["time"] . "):</span>"  
						."<span class='name'>" . $line["name"] . "</span> has changed the topic:  <br />" . $line["message"] . "</li>\n";
				break;
			case "nick":
				// \todo The logger should cram the *new* nick in $line["message"] or something.  
				return "<li class='nick'>"
						."<span class='time'>(" . $line["time"] . "):</span>"  
						."<span class='name'>" . $line["name"] . "</span> has changed his nick.  " . $line["message"] . "</li>\n";
				break;
			default: 
				return "<li class='".$line["type"]."'><span class='name'>" . $line["name"] . "</span>: &nbsp;" . $line["message"] . "</li>\n";
		}
}

function link_to_html( $string ) 
// Checks a string $s for sections that start with "http://" and converts them to proper html links. 
{
	// \todo Is that all the valid HTTP request characters? Dunno.
	// ""
	return preg_replace( '/(http:\/\/[0-9A-Za-z~\.%\/\?&+=_-]*)/',
							'<a href=\'$0\'>$0</a>', $string );
}


?>