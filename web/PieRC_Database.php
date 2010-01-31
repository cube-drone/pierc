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
			SELECT id, channel, name, time, message, type, hidden FROM main WHERE channel = '$channel' ORDER BY time DESC, id DESC LIMIT $n;";
		
		$results = mysql_query( $query, $this->_conn);
		if (!$results){ print mysql_error(); return false; }
		if( mysql_num_rows($results) == 0 ) { return false; }
		
		return array_reverse($this->hashinate($results));
	}
	
	public function get_offset( $channel, $id)
	{
		$channel = mysql_real_escape_string( $channel );
		$n = (int)$n;
		$query = "
			SELECT COUNT(*) as count FROM main 
				WHERE channel = '$channel' 
				AND id < $id 
				GROUP BY channel;";
		
		$results = mysql_query( $query, $this->_conn);
		if (!$results){ print mysql_error(); return false; }
		if( mysql_num_rows($results) == 0 ) { return false; }
		
		$res = $this->hashinate($results);
		$count = $res[0]["count"];
		if ( $count < 0 )
		{
			return 0;
		}
		return $count;
	}
	
	public function get_context( $channel, $id, $n)
	{
	
		$channel = mysql_real_escape_string($channel);
		$n = (int)$n + (int)$offset;
		$offset = (int) $offset;
		$id = (int)$id;
		
		$count = $this->get_offset( $channel, $id );
		
		$offset = $count - (int)($n/2);
		
		if( $offset < 0)
		{
			$offset = 0;
		}
		
		$query = "
			SELECT * 
				FROM (SELECT * FROM main 
						WHERE channel = '$channel'
						LIMIT $n OFFSET $offset) channel_table
				ORDER BY time DESC ;
				";
		
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
			$searchquery ORDER BY id LIMIT $n;";
		
		$results = mysql_query( $query, $this->_conn);
		if (!$results){ print mysql_error(); return false; }
		if( mysql_num_rows($results) == 0 ) { return false; }
		
		return array_reverse($this->hashinate($results));
	}
	
	
}
?>

