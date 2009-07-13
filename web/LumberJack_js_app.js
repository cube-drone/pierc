// The main site is powered, rather unnecessarily, entirely by AJAX calls.

// Constants
var irc_refresh_in_seconds = 60;	// How often we refresh the page
var page_hash_check_in_seconds = 1;	// How often we check the page hash for changes.

// Globals (the horror)
var last_id = 0;		// The ID of the comment at the very bottom of the page
var first_id = 0;		// The ID of the comment at the very top of the page
var refresh_on = true;	// Whether or not the 'refresh' action is currently operating
var hash = "#";			// The most recent hash value in the URL ("#search-poop")

// On Load
$(function() {
	
	// check for new content every N seconds
    setInterval("refresh()", irc_refresh_in_seconds * 1000);
    setInterval("hashnav_check()", page_hash_check_in_seconds * 1000);
    
    if( ! hashnav() ) { top(); }
	
	//Toolbar setup
	$("#search").submit( search );
	$("#home").click( top );
	$("#prev").click( page_up );
	$("#next").click( page_down );
	$("#events").click( events );
	$("#important").click( important );
	
	
});

// Navigate around the site based on the site hash.
// This allows for use of the "Back" button, as well as reusable URL structure. 
function hashnav()
{
	hash = window.location.hash
	if( hash.substring(1, 7) == "search")
	{
		var searchterm = hash.substring( 8, hash.length );
		$("#searchbox").attr({"value":searchterm});
		search();
		return true;
	}
	if( hash.substring(1, 4) == "tag")
	{
		var tagname = hash.substring( 5, hash.length );
		tag( tagname );
		return true;
	}
	else if (hash.substring(1, 3) == "id") 
	{
		var id = hash.substring( 4, hash.length );
		context(id);
		return true;
	}
	else if (hash.substring(1, 5) == "home") 
	{
		top();
		return true;
	}
	else if (hash.substring(1, 8) == "loading") 
	{
		return true;
	}
	return false;
}

// Check the current hash against the hash in the url. If they're different, perform hashnav.
// Note: this happens frequently
function hashnav_check()
{
	if( hash == window.location.hash )
	{
		return false;
	}
	else
	{
		return hashnav();
	}
}


// Populate the page with the last 50 things said
// This is the default 'home' activity for the page.
function top()
{
	clear();
	refresh_on = true;
	$('#irc').removeClass("searchresult");
	$("#options").show();
	// Ajax call to populate table
	$('#loading').show('fast');
	$.getJSON("json.php",
        function(data){
        	first_id = data[0].id;
        	$(data).each( function(i, item) { 	
        										$(irc_render(item)).appendTo("#irc"); 
        										last_id = item.id; 
        									});
        	scroll_to_bottom();
        	$('#loading').hide('slow');
        	window.location.hash = "home";
   			hash = window.location.hash;
        });
}

// Check if anything 'new' has been said in the past minute or so. 
function refresh()
{
	if( !refresh_on ) { return; }
	$("#loading").show("fast");
	$.getJSON("json.php", { 'type':'update', 'id': last_id },
        function(data){
        	$(data).each( function(i, item) { 
        										try
        										{
        											$(irc_render(item)).appendTo("#irc"); last_id = item.id; 
        										}
        										catch(err)
        										{
        											// do nuffins
        										}
        									
        									});
        	$('#loading').hide('slow');
        });
}

// Perform a search for the given search value. Populate the page with the results.
function search_for( searchvalue )
{
	
	window.location.hash = "search-"+searchvalue;
    hash = window.location.hash;
    	
	//Before
	refresh_on = false;
	$("#options").hide();
	
	clear();
	$('#loading').show('fast');
	
	// Ajax call to get search results
	$.getJSON("json.php", {'search':searchvalue}, 
        function(data){
        	$(data).each( function(i, item) { try
        										{
        											$(irc_render(item)).appendTo("#irc");
        										}
        										catch(err)
        										{
        											// do nuffins
        										}
        									} );
        $("#irc").addClass("searchresult");
        $('#loading').hide('slow');
        
        scroll_to_bottom();
        
        });
}

// Perform a search for the search value in the #searchbox element. 
function search()
{
	var searchvalue = escape($("#searchbox").attr("value"));
	search_for( searchvalue );
	return false; // This should prevent the search form from submitting
}

// Switch to a specific IRC message, centered about its ID.
function context(id)
{
	// Before
	clear();
	refresh_on = false;
	$("#options").show();
	
	$('#irc').removeClass("searchresult");
	$('#loading').show('fast');
	
	// Ajax call to get 'context' (find the comment at id 'id' and 'n' spaces around it). 
	$.getJSON("json.php", {'type':'context', 'id':id },
        function(data){
        	first_id = data[0].id;
        	$(data).each( function(i, item) { 	
        										$(irc_render(item)).appendTo("#irc"); 
        										last_id = item.id; 
        									});
        					
        	// After
        	scroll_to_id( id );
        	$('#irc-'+id).animate({fontSize: "150%"}, 2500);
        	$('#loading').hide('slow');
        	window.location.hash = "id-"+id;
        	hash = window.location.hash;
        });
    
}


// Add a page of IRC chat _before_ the current page of IRC chat
function page_up()
{	
	// Ajax call to populate table
	$('#loading').show('fast');
	$.getJSON("json.php", {'type':'context', 'id':first_id, 'n':20, 'context':'before' },
        function(data){
        	$("<tr class='pagebreak'><td></td> <td>-------------------------------</td> <td></td></tr>").prependTo("#irc");
        	$(data).each( function(i, item) { 	
        										$(irc_render(item)).prependTo("#irc"); 
        										first_id = item.id; 
        									});
        	scroll_to_id( first_id );
        	$('#loading').hide('slow');
        });
 	return false;   
}

// Add a page of IRC chat _after_ the current page of IRC chat
function page_down()
{	
	$('#loading').show('fast');
	
	$.getJSON("json.php", {'type':'context', 'id':last_id, 'n':20, 'context':'after' },
        function(data){
        	$("<tr class='pagebreak'><td></td> <td>-------------------------------</td> <td></td></tr>").appendTo("#irc");
        	$(data).each( function(i, item) { 	
        										$(irc_render(item)).appendTo("#irc"); 
        										last_id = item.id; 
        									});
        								
        	scroll_to_bottom();
        	$('#loading').hide('slow');
        });
    return false;
}

function events ( )
{
	tag( "event" );
	return false;
}

function important( )
{
	tag( "important" );
	return false;
}

// Load a tag
function tag( tagname ) 
{
	window.location.hash = "tag-"+tagname;
    hash = window.location.hash;

	clear();
	refresh_on = false;
	$("#options").hide();
	$('#irc').removeClass("searchresult");
	
	$('#loading').show('fast');
	
	$.getJSON("json.php", {'type':'tag', 'tag':tagname, 'n':15 },
        function(data){
        	$(data).each( function(i, item) { 	
        										$(irc_render(item)).appendTo("#irc");
        									});
        									
        	$('#loading').hide('slow');
        	scroll_to_bottom();
        });
    return false;
}


//-----------------------------------------------

// Convert a single IRC message into a table row
function irc_render( item ) 
{
	if ( item.hidden != "F" ) { return "";} 
	
	var message_tag = /^\s*([A-Za-z]*):/.exec(item.message);
	var tag_tag = "";
	if (message_tag) 
	{
		message_tag = message_tag[1].toLowerCase();
		tag_tag = "tag";
	}
	else
	{
		message_tag = "";
	}
	
	var construct_string = "<tr id='irc-"+item.id+"' class='"+item.type+" "+message_tag+" " + tag_tag + "'>";
	construct_string += "<td class='name'><a href='#search-"+html_escape(item.name)+"'>" + html_escape(item.name) + "</a>&nbsp;</td><td class='message'>";
	
	if 		(item.type == "pubmsg") { construct_string += ":&nbsp;";}
	else if (item.type == "join") { construct_string += "has joined #" + html_escape(item.channel); }
	else if (item.type == "part") { construct_string += "has left #" + html_escape(item.channel) + " -- "; }
	else if (item.type == "topic") { construct_string += "has changed the topic: <br/>"; } 
	else if (item.type == "nick") { construct_string += "is now known as ";}
	else if (item.type == "action") { } 

	construct_string += link_replace(html_escape(item.message)) + "</td>";
	var message_date = datetimeify(item.time);
	var pretty_date = human_date(message_date);
	construct_string += "<td class='date'>" + pretty_date + "</td>";
	construct_string += "<td class='context'><a onclick='loading' href='#id-"+item.id+"'>Context</a></td> </tr>";
	return $(construct_string);
}

// Make links clickable, and images images
function link_replace( string )
{
	return string.replace( /(http:&#x2F;&#x2F;\S*)/g , "<a href='$1'>$1</a>");
}

// Show the 'loading' widget. 
function loading()
{
	$("#loading").show('fast');
}

// Clears the IRC area.
function clear()
{
	$("#irc").html("");	
}

// Scroll to the bottom of the page
function scroll_to_bottom()
{
	$target = $("#bottom");
	var targetOffset = $target.offset().top;
	$('html,body').animate({scrollTop: targetOffset}, 1000);
}

// Attempt to scroll to the id of the item specified.
function scroll_to_id(id)
{
	$target = $("#irc-"+id);
	var targetOffset = $target.offset().top - 100;
	$('html,body').animate({scrollTop: targetOffset}, 1000);
}

// MySQL date string (2009-06-13 18:10:59 / yyyy-mm-dd hh:mm:ss )
function datetimeify( mysql_date_string )
{
	var dt = new Date();
	var space_split = mysql_date_string.split(" ");
	var d = space_split[0];
	var t = space_split[1];
	var date_split = d.split("-");
	dt.setFullYear( date_split[0] );
	dt.setMonth( date_split[1]-1 );
	dt.setDate( date_split[2] );
	var time_split = t.split(":");
	dt.setHours( time_split[0] );
	dt.setMinutes( time_split[1] );
	dt.setSeconds( time_split[2] );
	return dt;
}

// human_date - tries to construct a human-readable date
function human_date( date )
{
	var td = new Date();
	if( date.getDate() == td.getDate() && 
		date.getMonth() == td.getMonth() &&
		date.getYear() == td.getYear() ) { return "Today - "  + date.toLocaleTimeString(); }
	
	var yesterday = new Date();
	yesterday.setDate( td.getDate() - 1 );
		
	if( date.getDate() == yesterday.getDate() && 
		date.getMonth() == yesterday.getMonth() &&
		date.getYear() == yesterday.getYear() ) { return "Yesterday - "  + date.toLocaleTimeString(); }
	
	return date.toDateString() + " - " + date.toLocaleTimeString();
}

// Shouldn't this be part of javascript somewhere? 
// Nevetheless, escapes HTML control characters.
function html_escape( string )
{
	string = string.replace(/&/g, '&amp;');
	string = string.replace(/</g, '&lt;');
	string = string.replace(/>/g, '&gt;');
	string = string.replace(/\"/g, '&quot;' );
	string = string.replace(/'/g, '&#x27;' );
	string = string.replace(/\//g, '&#x2F;');
	return string;
}