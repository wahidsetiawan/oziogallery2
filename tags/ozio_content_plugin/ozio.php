<?php
defined( '_JEXEC' ) or die( 'Restricted access' );

$mainframe->registerEvent( 'onPrepareContent', 'plgContentOzio' );

function plgContentOzio( &$row, &$params, $page=0 )
{
	
	if ( JString::strpos( $row->text, 'oziogallery' ) === false ) {
		return true;
	}

	$plugin =& JPluginHelper::getPlugin('content', 'ozio');

 	$regex = '/{oziogallery\s*.*?}/i';

 	$pluginParams = new JParameter( $plugin->params );

	if ( !$pluginParams->get( 'enabled', 1 ) ) {
		$row->text = preg_replace( $regex, '', $row->text );
		return true;
	}

	preg_match_all( $regex, $row->text, $matches );

 	$count = count( $matches[0] );

 	if ( $count ) {
		
		$larghezza	= $pluginParams->def( 'larghezza', '100%' );
		$altezza	= $pluginParams->def( 'altezza', '600' );
		$scroll		= $pluginParams->def( 'scroll', 'no' );
		
 		plgContentProcessOzio( $row, $matches, $count, $regex, $larghezza, $altezza, $scroll );
	}
}

function plgContentProcessOzio ( &$row, &$matches, $count, $regex, $larghezza, $altezza, $scroll )
{
 	for ( $i=0; $i < $count; $i++ )
	{
 		$load = str_replace( 'oziogallery', '', $matches[0][$i] );
 		$load = str_replace( '{', '', $load );
 		$load = str_replace( '}', '', $load );
 		$load = trim( $load );

		
		$elemento	= plgcontentloadozio( $load, $larghezza, $altezza, $scroll );
		$row->text 	= str_replace($matches[0][$i], $elemento, $row->text );
 	}

	$row->text = preg_replace( $regex, '', $row->text );
}

function plgcontentloadozio( $galleriaozio, $larghezza, $altezza, $scroll )
{

	$db =& JFactory::getDBO();

		$query = 'SELECT published, link, id, access'
				. ' FROM #__menu'
				. ' WHERE id='.(int) $galleriaozio
				;

		$db->setQuery($query);
  		$codice = $db->loadObject();
		

		$query = 'SELECT *'
				. ' FROM #__menu'
				. ' WHERE (link LIKE "index.php?option=com_oziogallery2&view=01tiltviewer" 
						OR LIKE "index.php?option=com_oziogallery2&view=02flashgallery"
						OR LIKE "index.php?option=com_oziogallery2&view=03imagin"
						OR LIKE "index.php?option=com_oziogallery2&view=04carousel"
						OR LIKE "index.php?option=com_oziogallery2&view=05imagerotator"
						OR LIKE "index.php?option=com_oziogallery2&view=06accordion"	
						OR LIKE "index.php?option=com_oziogallery2&view=07flickrslidershow"
						OR LIKE "index.php?option=com_oziogallery2&view=08flickrphoto"				
						)'
				;				
		$db->setQuery($query);
  		$cp = $db->loadObject();		
		
		
	$document	= &JFactory::getDocument();

        if ($cp->id = $galleriaozio) :
		
				@$gall 	= JURI::root(). $codice->link .'&Itemid='. $galleriaozio;

			if (@$codice->published != 0 && @$codice->access != 1 && @$codice->access != 2) :	
				$contents = '<iframe src ="'.$gall.'&amp;tmpl=component" width="'.$larghezza.'" height="'.$altezza.'" scrolling="'.$scroll.'" frameborder="0">';
				$contents .= '<p>Your browser does not support iframes.</p>';
				$contents .= '</iframe>';

				return $contents;
			endif;
		endif;			
	
}