// The main site is powered, rather unnecessarily, entirely by AJAX calls.

// Constants
var irc_refresh_in_seconds = 60;	// How often we refresh the page
var page_hash_check_in_seconds = 1;	// How often we check the page hash for changes.

// Globals (the horror)
var last_id = 0;		// The ID of the comment at the very bottom of the page
var first_id = 0;		// The ID of the comment at the very top of the page
var refresh_on = true;	// Whether or not the 'refresh' action is currently operating
var hash = "#";			// The most recent hash value in the URL ("#search-poop")
var channelselect = $('#channellist').val();	// Selected channel in dropdown

var current_offset = 50; // The current search offset;
var most_recent_search = ""; //The last thing searched for. 

function everything_has_failed( xhr ){
	clear();
	$("#horrible_error").show();
	$("#error").html( xhr.responseText );
}

// On Load
$(function() {
	$("#channellist").change(function(){
		clear();
		refresh_on = true;
		home();
	});

	$("#join-quit-toggle").click(function(){
		hideJoinQuit();
	});
	
	$("#inline-media-toggle").click(function(){
		toggleInlineMedia();
	});

	$("#searchoptions").hide();	
	
	// check for new content every N seconds
    setInterval("refresh()", irc_refresh_in_seconds * 1000);
    setInterval("hashnav_check()", page_hash_check_in_seconds * 1000);
    
    if( ! hashnav() ) { home(); }
	
	//Toolbar setup
	$("#load_more").click( load_more_search_results );
	$("#search").submit( search );
	$("#home").click( home );
	$("#prev").click( page_up );
	$("#next").click( page_down );
	$("#events").click( events );
	$("#important").click( important );

	// Live Search
	// This should prevent the sending of too many queries (i.e. one per letter typed).

	// Reference to the pending search query.
	var liveSearchTimer;
	// Delay after typing a key, before the search request is sent.
	var liveSearchTimerInterval = 200;

	// When a key is typed
	$("#searchbox").keyup(function(){
		// Cancel the prending query
		clearTimeout(liveSearchTimer);
	    // Create a new delayed one
		liveSearchTimer = setTimeout(liveSearchSubmit, liveSearchTimerInterval);
	});

	function liveSearchSubmit () {
	    if ($('#searchbox').val()=="")
	    	home();
	    else
	    	search();
	}
	
});

// Hide all join/quit messages
function hideJoinQuit() {
	if ($('#join-quit-toggle').is(':checked')) {
		$('#irc .join, #irc .quit').hide();
	} else {
		$('#irc .join, #irc .quit').show();
	}
} 

function toggleInlineMedia() {
	if ($('#inline-media-toggle').is(':checked')) {
		$('#irc .inline-image').show();
	} else {
		$('#irc .inline-image').hide();
	}
} 

// Display embedable media inline
// Only images (jpg,gif,png) right now, might extend to youtube links or something eventually
function displayInlineMedia() {
	$('.message a:not(.inline-image-link)').each(function() {
		link = $(this);
		url = link.attr('href');
		var testRegex = /^https?:\/\/(?:[a-z\-]+\.)+[a-z]{2,6}(?:\/[^\/#?]+)+\.(?:jpe?g|gif|png)$/;
		if (testRegex.test(url)) {
		  link.append('<img src="'+url+'" class="inline-image">').addClass('inline-image-link').attr('target','_blank');
		  // Re-hide media if necessary
		  toggleInlineMedia();
		}
	});
}

//Direct channel links via ?channel=mychan
$(document).ready(function() {
    var channel = getUrlVars()["channel"];

    $('#channellist option').each(function(){
        if (this.value === channel){
            $('#channellist').val(channel);
        }
    });
});
     
function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
       vars[key] = value;
    });
        return vars;
}

// Navigate around the site based on the site hash.
// This allows for use of the "Back" button, as well as reusable URL structure. 
function hashnav()
{
	hash = window.location.hash
	if( hash.substring(1, 7) == "search")
	{
		var searchterm = hash.substring( 8, hash.length );
		$("#searchbox").attr({"value":decodeURIComponent(searchterm)});
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
		$("#toolbar_inner").prepend("<span class=\"backbutton\"><a href=\"#\">&laquo; Back to channellist</a>.</span>");
		$('.backbutton').click(function(){
			$(this).hide();
			home();
		});
		return true;
	}
	else if (hash.substring(1, 5) == "home") 
	{
		home();
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
function home()
{
	var channelselect = $('#channellist').val();

	clear();
	refresh_on = true;
	$('#irc').removeClass("searchresult");
	$("#options").show();
	$("#searchoptions").hide();	
	// Ajax call to populate table
	loading()
	
	//alert($('#channellist').val());

	$.ajax({
		url: "json.php",
		data: { channel: channelselect},
		dataType: "json",
		success: function(data){
			first_id = data[0].id;
			$(data).each( function(i, item) { 	
				$(irc_render(item)).appendTo("#irc"); 
				last_id = item.id; 
			});
			done_loading();
			window.location.hash = "home";
			hash = window.location.hash;
			hideJoinQuit();
			displayInlineMedia();
			scroll_to_bottom();
		}, 
		error: everything_has_failed
	});
	

}

// Check if anything 'new' has been said in the past minute or so. 
function refresh()
{
	// Selected value in dropdown
	var channelselect = $('#channellist').val();

	if( !refresh_on ) { return; }
	loading();
	$.getJSON("json.php?channel=" + channelselect, { 'type':'update', 'id': last_id },
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
		done_loading();
        }).error(everything_has_failed);
}

// Perform a search for the given search value. Populate the page with the results.
function search_for( searchvalue )
{
	// If the previous search was for the same term, don't search again
	if(searchvalue == most_recent_search)
	{
		return;
	}

	current_offset = 50;
	most_recent_search = searchvalue;	
	window.location.hash = "search-"+searchvalue;
	hash = window.location.hash;
    	
	//Before
	refresh_on = false;
	$("#options").hide();
	$("#searchoptions").show();	
	
	clear();
	loading();
	
	// Ajax call to get search results
	$.getJSON("json.php", {'search':searchvalue}, 
        function(data){
		if( data.length < 50 ) { $("#searchoptions").hide(); }	
        	$(data).each( function(i, item) { 
			try{
				$(irc_render(item)).appendTo("#irc");
			}
			catch(err){
				// do nuffins
			}
		} );
		$("#irc").addClass("searchresult");
		done_loading(); 
		
		highlight( searchvalue );
		hideJoinQuit();
		displayInlineMedia();
		scroll_to_bottom();
        }).error(everything_has_failed);
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
	$("#searchoptions").hide();	
	
	$('#irc').removeClass("searchresult");
	loading();
	
	// Ajax call to get 'context' (find the comment at id 'id' and 'n' spaces around it). 
	$.getJSON("json.php", {'type':'context', 'id':id },
        function(data){
        	first_id = data[0].id;
        	$(data).each( function(i, item) { 	
			$(irc_render(item)).appendTo("#irc"); 
			last_id = item.id; 
		});
        					
        	// After
        	
		$('#irc-'+id).addClass('highlighted' )
        	done_loading();
        	window.location.hash = "id-"+id;
        	hash = window.location.hash;
        	hideJoinQuit();
        	displayInlineMedia();
        	scroll_to_id( id );
        }).error(everything_has_failed);
    
}

// Add n more search results
function load_more_search_results()
{
	if( current_offset < 40 ){ current_offset = 40 };

	// Ajax call
	loading();
	$.getJSON("json.php", {'type':'search', 'n':40, 'offset':current_offset, 'search':most_recent_search },
	function(data){ 
        	$("#irc li:first-child").addClass("pagebreak");
		var id = 0;
		if( data.length < 40 ) { $("#searchoptions").hide(); }	
		else{ $("#searchoptions").show(); }
		data.reverse();
		$(data).each( function( i, item) {
			$(irc_render(item)).prependTo("#irc");
			id = item.id;
		});
		scroll_to_id( id );
		done_loading();
		current_offset += 40;
		highlight( most_recent_search );
        }).error(everything_has_failed);
	return false;
}

// Add a page of IRC chat _before_ the current page of IRC chat
function page_up()
{	
	// Selected value in dropdown
	var channelselect = $('#channellist').val();
	
	// Ajax call to populate table
	loading();
	$.getJSON("json.php?channel=" + channelselect, {'type':'context', 'id':first_id, 'n':40, 'context':'before' },
        function(data){
        	$("#irc li:first-child").addClass("pagebreak");
        	$(data).each( function(i, item) { 	
			$(irc_render(item)).prependTo("#irc"); 
			first_id = item.id; 
		});
        	hideJoinQuit();
  				displayInlineMedia(); 
        	scroll_to_id( first_id );
		done_loading();
        }).error(everything_has_failed);
 	return false;   
}

// Add a page of IRC chat _after_ the current page of IRC chat
function page_down()
{	
	// Selected value in dropdown
	var channelselect = $('#channellist').val();
	
	loading();
	
	$.getJSON("json.php?channel=" + channelselect, {'type':'context', 'id':last_id, 'n':40, 'context':'after' },
        function(data){
        	$("#irc li:last-child").addClass("pagebreak");
        	$(data).each( function(i, item) { 	
			$(irc_render(item)).appendTo("#irc"); 
			last_id = item.id; 
		});
        	hideJoinQuit();
  				displayInlineMedia(); 
        	scroll_to_bottom();
		done_loading();
        }).error(everything_has_failed);
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
	$("#searchoptions").hide();	
	$('#irc').removeClass("searchresult");
	
	loading();	
	$.getJSON("json.php", {'type':'tag', 'tag':tagname, 'n':15 },
        function(data){
        	$(data).each( function(i, item) { 	
			$(irc_render(item)).appendTo("#irc");
		});
        									
		done_loading();
        	hideJoinQuit();
  				displayInlineMedia(); 
        	scroll_to_bottom();
        }).error(everything_has_failed);
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
	
	var construct_string = "<li data-channel="+ html_escape(item.channel) +" id='irc-"+item.id+"' class='"+item.type+" "+message_tag+" " + tag_tag + "'>";
	construct_string += "<span class='name'><a href='#id-"+item.id+"'>" + html_escape(item.name) + "</a>&nbsp;</span><span class='message'>";
	
	if (item.type == "join") { construct_string += "has joined #" + html_escape(item.channel); }
	else if (item.type == "part") { construct_string += "has left #" + html_escape(item.channel) + " -- "; }
	else if (item.type == "quit") { construct_string += "has quit -- "; }
	else if (item.type == "topic") { construct_string += "has changed the topic: <br/>"; } 
	else if (item.type == "nick") { construct_string += " is now known as ";}
	else if (item.type == "action") { } 

	construct_string += link_replace(spanify(html_escape(item.message))) + "</span>";
	var message_date = datetimeify(item.time);
	var pretty_date = human_date(message_date);
	construct_string += "<span class='date'>" + pretty_date + "</span>";
	return $(construct_string);
}

// Make EVERY WORD A SPAN TAG moo hoo ha ha ha 
function spanify( string )
{
	if (!string){ return string; }
	var split = $(string.split(" "));
	var join = []
	split.each( function(i, thing)
	{
		if( thing[0] == 'h' && thing[1] == 't' ){ join.push( thing ); }
		else{
			join.push( "<span class='spanify-"+thing.toLowerCase().replace(/\W/g, '')+"'>"+thing+"</span>" ); 
		}
	});
	return join.join(" ");
}

function highlight( words )
{
	var split = $(words.split(/[ (%2520)]/));
	split.each( function( i, word)
	{
		var random = Math.floor((Math.random()*10)+1)
		if( word.length > 3 ){
			$("span[class*=spanify-"+word.toLowerCase().replace(/\W/g, '')+"]").addClass("search-highlight");
			$("span[class*=spanify-"+word.toLowerCase().replace(/\W/g, '')+"]").addClass("highlight-"+random);
		}
	});
	
}

// Make links clickable, and images images
function link_replace( string )
{
	if(!string){ return string; }
	var links = string.match( /(https*:&#x2F;&#x2F;\S*)/g  );
	if (links)
	{
		for( var i = 0; i < links.length; i++ )
		{	
			var replacement = links[i]
			if (replacement.length > 100)
			{
				replacement = links[i].substring(0,100) + "...";
			}
			
			string = string.replace( links[i], "<a href='"+links[i]+"'>"+replacement+"</a>");
		}
	}
	return string;
}

// Show the 'loading' widget. 
function loading()
{
	$("#loading").fadeIn('fast');
	document.body.style.cursor = 'wait';
}

function done_loading()
{
	$('#loading').fadeOut('slow');
	document.body.style.cursor = 'default';
}

// Clears the IRC area.
function clear()
{
	$("#irc").html("");	
}

// Scroll to the bottom of the page
function scroll_to_bottom()
{
	setTimeout( function() {
		$('html, body').animate({scrollTop: $(document).height()}, 200);
	}, 100)
}

// Attempt to scroll to the id of the item specified.
function scroll_to_id(id)
{
	setTimeout( function() {
		$target = $("#irc-"+id);
		var targetOffset = $target.offset().top - 100;
		$('html,body').animate({scrollTop: targetOffset}, 200);
	}, 100)
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
	var dt = date.toDateString()
	if( date.getDate() == td.getDate() && 
		date.getMonth() == td.getMonth() &&
		date.getYear() == td.getYear() ) { dt = "Today"; }
	
	var yesterday = new Date();
	yesterday.setDate( td.getDate() - 1 );
		
	if( date.getDate() == yesterday.getDate() && 
		date.getMonth() == yesterday.getMonth() &&
		date.getYear() == yesterday.getYear() ) { dt = "Yesterday";}

	if( hours == 0 && minutes == 0 ) { return dt + " - Midnight"; }
	else if( hours == 12 && minutes == 0 ){ return dt + " - Noon"; } 
	else
	{
		var ampm = "AM";
		var hours = date.getHours();
		if(hours > 11){ hours = hours - 12; ampm = "PM"; }
		
		var minutes = date.getMinutes();
		if( minutes < 10 ){ minutes = "0" + minutes; } 

		// I find it strange, but in a 12-hour clock, '12' acts as 0. 
		if( hours == 0 ) { hours = 12; }

		return dt + " - " + hours + ":" + minutes + " " + ampm;
	}
}

// Shouldn't this be part of javascript somewhere? 
// Nevetheless, escapes HTML control characters.
function html_escape( string )
{
	if( !string ){ return string; }
	string = string.replace(/&/g, '&amp;');
	string = string.replace(/</g, '&lt;');
	string = string.replace(/>/g, '&gt;');
	string = string.replace(/\"/g, '&quot;' );
	string = string.replace(/'/g, '&#x27;' );
	string = string.replace(/\//g, '&#x2F;');
	return string;
}
