<?php 
include("lib/PieRC_Database.php");
include("config.php");

$pdb = config::get_db();

// n: The number of results to return (centered around id, if provided)
if( isset( $_GET['n']) ) 
{
	$n = $_GET['n'];
}

// context type (before, middle, after)
if( isset( $_GET['context']) ) 
{
	$context = $_GET['context'];
}
else
{
	$context = "middle";
}

// id: The id of a term. 
if( isset($_GET['id']) )
{
	$id = $_GET['id'];
}

// channel: The channel, less the # mark - say, 'sfucsss' or 'ubuntu'. 
if( isset( $_GET['channel'] ) )
{
	$channel = $_GET['channel'];
}
else
{
	$channel = config::$default_channel;
}

// search: Search for this term. "Poop"
if( isset( $_GET['search'] ) )
{
	$search = $_GET['search'];
}

if ( $search )
{
	if (!$n)
	{
		$n = config::$default_number_of_lines;
	}
	// Search channel for $search
	$lines = $pdb->get_search_results( $channel, $search, $n );
}	
else if( $id and $n )
{
	
	if( $context == "before" )
	{
		$lines = $pdb->get_before( $channel, $id,  $n );
	}
	// Context: provide n results, centred around id
	if( $context == "middle" )
	{
		$lines = $pdb->get_context( $channel, $id,  $n );
	}
	if( $context == "after" )
	{
		$lines = $pdb->get_after( $channel, $id,  $n );
	}
}
else if ($id)
{
	// Update: Get all of the results that occur after $id
	$lines = $pdb->get_lines_between_now_and_id( $channel, $id ) ;
}
else
{
	// Home: Get the last $n results
	if (!$n)
	{
		$n = config::$default_number_of_lines;
	}
	
	$lines = $pdb->get_last_n_lines( $channel, $n );
}

print json_encode( $lines );
