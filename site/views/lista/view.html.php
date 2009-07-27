<?php
defined( '_JEXEC' ) or die( 'Restricted access' );
jimport( 'joomla.application.component.view');

class OzioGalleryViewLista extends JView
{

	function display( $tpl = null )
	{
		global $mainframe;

		$document 	= & JFactory::getDocument();
		$menus		= & JSite::getMenu();
		$menu    	= $menus->getActive();
		$params 	= & $mainframe->getParams('com_oziogallery2');

		$items		= & $this->get('Gallerie');


		if (is_object( $menu )) {
			$menu_params = new JParameter( $menu->params );

			if (!$menu_params->get( 'page_title')) {
				$params->set('page_title',	$menu->name);
			}

		} else {
			$params->set('page_title',	JText::_('Oziogallery2'));
		}

		$document->setTitle($params->get('page_title'));

		$pathimage   	= JURI::root().'administrator/components/com_oziogallery2/images/logo.png';
		

		$this->assignRef('params' , 				$params);
		$this->assignRef('items' , 					$items);
		$this->assignRef('pathimage' ,	 			$pathimage);

		parent::display($tpl);
	}
}
?>