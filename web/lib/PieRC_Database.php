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
		
		$results = 0;
		$results = mysql_query( $query, $this->_conn);
		if (!$results){ print mysql_error(); return false; }
		if( mysql_num_rows($results) == 0 ) { return false; }
		
		return array_reverse($this->hashinate($results));
	}
	
	public function get_context( $channel, $id, $n )
	{
		$id = (int)$id;
		$n = (int)$n;
		$lt_n = 
		$query = "
			SELECT id, channel, name, time, message, type, hidden 
				FROM (SELECT * FROM main WHERE channel = '$channel') channel_table
			WHERE id <= $id ORDER BY id DESC LIMIT $n;";
		
		$results = 0;
		$results = mysql_query( $query, $this->_conn);
		if (!$results){ print mysql_error(); return false; }
		if( mysql_num_rows($results) == 0 ) { return false; }
		
		return array_reverse($this->hashinate($results));
	}
	
	
}
?>

