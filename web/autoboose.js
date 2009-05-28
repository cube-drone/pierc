// Constants
var refresh_in_seconds = 60;

// Globals (the horror)
var last_id = 0;
var first_id = 0;
var refresh_on = true;

// On Load
$(function() {
	// load the top 50 (or top N)
	top();
	// check for new content every N seconds
    setInterval("refresh()", refresh_in_seconds * 1000);
	
	//Toolbar setup
	$("#search").click( search );
	$("#home").click( top );
	$("#refresh").click( function(){refresh(); scroll_to_bottom();} );
	$("#prev").click( page_up );
	$("#next").click( page_down );
});

function top()
{
	clear();
	refresh_on = true;
	$('#irc').removeClass("searchresult");
	$("#refresh").show();
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

function search()
{
	refresh_on = false;
	$("#refresh").hide();
	clear();
	var searchvalue = escape($("#searchbox").attr("value"));
	
	$('#loading').show('fast');
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

function context(id)
{
	clear();
	refresh_on = false;
	$('#irc').removeClass("searchresult");
	
	$("#refresh").hide();
	// Ajax call to populate table
	$('#loading').show('fast');
	$.getJSON("json.php", {'id':id, 'n':20},
        function(data){
        	first_id = data[0].id;
        	$(data).each( function(i, item) { 	
        										$(irc_render(item)).appendTo("#irc"); 
        										last_id = item.id; 
        									});
        	scroll_to_id( id );
        	$('#loading').hide('slow');
        });
}


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
}

function page_down()
{	
	// Ajax call to populate table
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
	construct_string += "<td class='context'><a href='#' onclick='context("+item.id+")'>Context</a></td> </tr>";
	return $(construct_string);
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

function scroll_to_id(id)
{
	$target = $("#irc-"+id);
	var targetOffset = $target.offset().top;
	$('html,body').animate({scrollTop: targetOffset}, 1000);
}

// Shouldn't this be part of javascript somewhere? 
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