<?php
defined( '_JEXEC' ) or die( 'Restricted access' );
jimport('joomla.application.component.model');

class OzioGalleryModelLista extends JModel
{

	function __construct()
	{
		parent::__construct();

	}
	
	function getGallerie()
	{
	global $mainframe;
	
	$params 		= & $mainframe->getParams('com_oziogallery2');	
	$tipogallerie 	= (int) $params->def('tipogallerie');
	$ordine		 	= $params->def('ordine');

	switch ($params->get( 'tipogallerie' ))
		{		
				case '0': //tutte le gallerie
				$where 	= '';
				$where .= ' WHERE (link = "index.php?option=com_oziogallery2&view=01tiltviewer" 
								OR link = "index.php?option=com_oziogallery2&view=02flashgallery"
								OR link = "index.php?option=com_oziogallery2&view=03imagin"
								OR link = "index.php?option=com_oziogallery2&view=04carousel"
								OR link = "index.php?option=com_oziogallery2&view=05imagerotator"
								OR link = "index.php?option=com_oziogallery2&view=06accordion"	
								OR link = "index.php?option=com_oziogallery2&view=07flickrslidershow"
								OR link = "index.php?option=com_oziogallery2&view=08flickrphoto"							
						)';
				break;
				
				case '1': //Tit gallery
				$where 	= '';
				$where .= ' WHERE (link = "index.php?option=com_oziogallery2&view=01tiltviewer" )';
				break;	

				case '2': //Flash gallery
				$where 	= '';
				$where .= ' WHERE (link = "index.php?option=com_oziogallery2&view=02flashgallery" )';
				break;	

				case '3': //Imagin gallery
				$where 	= '';
				$where .= ' WHERE (link = "index.php?option=com_oziogallery2&view=03imagin" )';
				break;			

				case '4': //Carousel gallery
				$where 	= '';
				$where .= ' WHERE (link = "index.php?option=com_oziogallery2&view=04carousel" )';
				break;	

				case '5': //Imagerotator gallery
				$where 	= '';
				$where .= ' WHERE (link = "index.php?option=com_oziogallery2&view=05imagerotator" )';
				break;	

				case '6': //Accordion gallery
				$where 	= '';
				$where .= ' WHERE (link = "index.php?option=com_oziogallery2&view=06accordion" )';
				break;			

				case '7': //Flickr Slidershow gallery
				$where 	= '';
				$where .= ' WHERE (link = "index.php?option=com_oziogallery2&view=07flickrslidershow" )';
				break;	

				case '8': //Flickr Photo gallery
				$where 	= '';
				$where .= ' WHERE (link = "index.php?option=com_oziogallery2&view=08flickrphoto" )';
				break;			
		}
		
		$query = 'SELECT id, componentid, name, link'
				. ' FROM #__menu'
                . $where
				. ' AND published = 1'				
				. ' ORDER BY  name ' . $ordine
			;

		$this->_db->SetQuery($query);
  		$vambagall = $this->_db->loadObjectList();

  		return $vambagall;
	}	
	
}
?>