<?php 
// All of the JSON calls are handled here. 

// TODO: 
// * Unfortunately, the code does not make it immediately clear which call is being made
// and instead figures it out via context. (Which terms are you passing?) 
// Which is the _wrong_ way to do it, because it's confusing for all but the architect. 
// * The return results are unbounded and it is possible to make a query that will 
// return > 10,000 results.  To prevent this sort of crash, results should be capped at a maximum
// of 1000 results. 

include("lib/PieRC_Database.php");
include("config.php");

$pdb = config::get_db();

// n: The number of results to return (centered around id, if provided)
if( isset( $_GET['n']) ) 
{
	$n = $_GET['n'];
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

# SEARCH 
if ( $search )
{
	if (!$n)
	{
		$n = config::$default_number_of_lines;
	}
	// Search channel for $search
	$lines = $pdb->get_search_results( $channel, $search, $n );
}	
# CONTEXT - results centered about an ID value
else if( $id and $n )
{

	// context type (before, middle, after)
	if( isset( $_GET['context']) ) 
	{
		$context = $_GET['context'];
	}
	else
	{
		$context = "middle";
	}
	
	if( $context == "before" )
	{
		$lines = $pdb->get_before( $channel, $id,  $n );
	}
	if( $context == "middle" )
	{
		$lines = $pdb->get_context( $channel, $id,  $n );
	}
	if( $context == "after" )
	{
		$lines = $pdb->get_after( $channel, $id,  $n );
	}
}
// UPDATE - get all results that occur after $id 
else if ($id)
{
	$lines = $pdb->get_lines_between_now_and_id( $channel, $id ) ;
}
// DEFAULT - get the last $n results
else
{
	if (!$n)
	{
		$n = config::$default_number_of_lines;
	}
	
	$lines = $pdb->get_last_n_lines( $channel, $n );
}

print json_encode( $lines );
