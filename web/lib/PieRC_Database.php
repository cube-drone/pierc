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
	private function create_tables()
	{
		$drop_query = " DROP TABLE IF EXISTS main; ";
		$create_query = "
			    CREATE TABLE main
			    (
				id      INT(12) NOT NULL AUTO_INCREMENT PRIMARY KEY,
				channel VARCHAR(16),
				name    VARCHAR(16),
				time    DATETIME,
				message TEXT,
				type    VARCHAR(10),
				hidden  CHAR(1),
			    ) Engine = InnoDB; ";
		if (mysql_query($drop_query, $this->_conn) == false) { return false; }
		if (mysql_query($create_query, $this->_conn) == false) { return false; }
		return true;
	}
	
	public function insert_line( $channel, $name, $time, $message, $type, $hidden )
	{
		$channel = mysql_real_escape_string( $channel);
		$name = mysql_real_escape_string( $name );
		$time = mysql_real_escape_string( $time );
		$message = mysql_real_escape_string( $message );
		$type = mysql_real_escape_string( $type );
		$hidden = mysql_real_escape_string( $hidden );
		
		$insert_query = " 
					INSERT INTO main SET 
						channel = $channel,
						name = $name,
						time = $time
						message = $message,
						type = $type,
						hidden = $hidden; ";
	}
	
	public function get_last_n_lines( $channel, $n )
	{
		$channel = mysql_real_escape_string( $channel );
		$n = (int)$n;
		$query = "
			SELECT channel, name, time, message, type, hidden FROM main WHERE channel = '$channel' ORDER BY id DESC LIMIT $n;";
		
		$results = 0;
		$results = mysql_query( $query, $this->_conn);
		if (!$results){ print mysql_error(); return false; }
		if( mysql_num_rows($results) == 0 ) { return false; }
		
		$lines = array();
		$counter = 0;
		while( $row = mysql_fetch_assoc($results) )
		{
			$lines[$counter] = $row;
			$counter++;
		}
		return array_reverse($lines);
	}
}
?>

