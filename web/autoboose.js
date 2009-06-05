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
    
    hashnav();
	
	//Toolbar setup
	$("#search").submit( search );
	$("#home").click( top );
	$("#prev").click( page_up );
	$("#next").click( page_down );
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
	}
	else if (hash.substring(1, 3) == "id") 
	{
		var id = hash.substring( 4, hash.length );
		context(id);
	}
	else if (hash.substring(1, 8) == "loading") 
	{
		return;
	}
	else
	{
		// load the top 50 (or top N)
		$("#searchbox").attr({"value":hash.substring(1,7)});
		top();
	}
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
		hashnav();
		return true;
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
        });
}

// Check if anything 'new' has been said in the past minute or so. 
function refresh()
{
	if( !refresh_on ) { return; }
	$("#loading").show("fast");
	$.getJSON("json.php", { 'id': last_id },
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
	$.getJSON("json.php", {'id':id, 'n':20},
        function(data){
        	first_id = data[0].id;
        	$(data).each( function(i, item) { 	
        										$(irc_render(item)).appendTo("#irc"); 
        										last_id = item.id; 
        									});
        					
        	// After
        	scroll_to_id( id );
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
	$.getJSON("json.php", {'id':first_id, 'n':20, 'context':'before' },
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
	
	$.getJSON("json.php", {'id':last_id, 'n':20, 'context':'after' },
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

// Convert a single IRC message into a table row
function irc_render( item ) 
{
	if ( item.hidden != "F" ) { return "";} 
	var construct_string = "<tr id='irc-"+item.id+"' class='"+item.type+"'>";
	construct_string += "<td class='name'>" + html_escape(item.name) + "&nbsp;</td><td class='message'>";
	
	if 		(item.type == "pubmsg") { construct_string += ":&nbsp;";}
	else if (item.type == "join") { construct_string += "has joined #" + html_escape(item.channel); }
	else if (item.type == "part") { construct_string += "has left #" + html_escape(item.channel) + " -- "; }
	else if (item.type == "topic") { construct_string += "has changed the topic: <br/>"; } 
	else if (item.type == "nick") { construct_string += "has changed his nick!";}
	else if (item.type == "action") { } 

	construct_string += html_escape(item.message) + "</td>";
	construct_string += "<td class='context'><a onclick='loading' href='#id-"+item.id+"'>Context</a></td> </tr>";
	return $(construct_string);
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
	scroll_to_id(last_id)
}

// Attempt to scroll to the id of the item specified.
function scroll_to_id(id)
{
	$target = $("#irc-"+id);
	var targetOffset = $target.offset().top;
	$('html,body').animate({scrollTop: targetOffset}, 1000);
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