<?php
function get_main_menu()
{
	$mainmenu = 
	"
	<div id='mainmenu'>
		<a id='mainlogo' href='index.html'></a>
		<ul>
		<li><a href='index.php?n=50'>Last 50</a></li>
		<li><a href=''>Best Of</a></li>
		</ul>
		<form class='search' action='search.php' method='get'>
			<input class='searchbox' type='text' name='search' value=".$_GET['search']." ></input>
			<input class='searchbutton' type='submit' value='Go'> </input>
		</form>
	</div>
	";
	return $mainmenu;
}

?>