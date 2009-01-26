<?php
function get_main_menu()
{
	$mainmenu = 
	"
	<div id='mainmenu'>
		<a id='mainlogo' href='index.php?n=50'></a>
		<ul>
		<li><a href='index.php?n=50'>Last 50</a></li>
		<li><a href='search.php?search=dongs'>Dongs</a></li>
		</ul>
		<form class='search' action='search.php' method='get'>
			<input class='searchbox' type='text' name='search' value=".$_GET['search']." ></input>
			<input class='searchbutton' type='submit' value='Search'> </input>
		</form>
	</div>
	";
	return $mainmenu;
}

?>