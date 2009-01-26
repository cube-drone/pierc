<?php

class db_class
{
	protected $_conn;
	
	public function __construct( $server, $port, $database, $user, $password)
	{
		if ($port) { $port = ":".$port ; print $port; }
		$this->_conn = mysql_connect( $server.$port, $user, $password );
		if (!$this->_conn){ die ("Could not connect: " + mysql_error() ); }
		mysql_select_db( $database, $this->_conn );
	}
	
	public function __destruct( )
	{
		mysql_close( $this->_conn );	
	}
	
}

class pie_db extends db_class
{
	protected function hashinate( $result )
	{
		$lines = array();
		$counter = 0;
		while( $row = mysql_fetch_assoc($result) )
		{
			$lines[$counter] = $row;
			$counter++;
		}
		return $lines;
	}
	
	public function get_last_n_lines( $channel, $n )
	{
		$channel = mysql_real_escape_string( $channel );
		$n = (int)$n;
		$query = "
			SELECT id, channel, name, time, message, type, hidden FROM main WHERE channel = '$channel' ORDER BY id DESC LIMIT $n;";
		
		$results = mysql_query( $query, $this->_conn);
		if (!$results){ print mysql_error(); return false; }
		if( mysql_num_rows($results) == 0 ) { return false; }
		
		return array_reverse($this->hashinate($results));
	}
	
	public function get_context( $channel, $id, $n )
	{
		$channel = mysql_real_escape_string($channel);
		$n = (int)$n;
		// Note: This does not protect well against multiple channels in the same database at all. 
		$id = (int)$id + 5;
		$query = "
			SELECT id, channel, name, time, message, type, hidden 
				FROM (SELECT * FROM main WHERE channel = '$channel') channel_table
			WHERE id <= $id ORDER BY id DESC LIMIT $n;";
		
		$results = mysql_query( $query, $this->_conn);
		if (!$results){ print mysql_error(); return false; }
		if( mysql_num_rows($results) == 0 ) { return false; }
		
		return array_reverse($this->hashinate($results));
	}
	
	public function get_search_results( $channel, $search, $n )
	{
		$search = mysql_real_escape_string($search);
		
		$searchquery = " WHERE channel = '$channel' ";
		$searcharray = split(" ", $search);
		foreach($searcharray as $searchterm )
		{
			$searchquery .= "AND message LIKE '%".mysql_real_escape_string($searchterm)."%' ";
		}
		
		$channel = mysql_real_escape_string($search);
		$n = (int)$n;
		$query = "
			SELECT id, channel, name, time, message, type, hidden 
				FROM main 
			$searchquery ORDER BY id DESC LIMIT $n;";
		
		$results = mysql_query( $query, $this->_conn);
		if (!$results){ print mysql_error(); return false; }
		if( mysql_num_rows($results) == 0 ) { return false; }
		
		return array_reverse($this->hashinate($results));
	}
	
	
}
?>

