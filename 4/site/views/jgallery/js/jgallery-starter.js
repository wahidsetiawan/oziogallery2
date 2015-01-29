<?php

$lang = JFactory::getLanguage();

$lang->load('com_oziogallery3',JPATH_ROOT . "/administrator/components/com_oziogallery3");


?>
jQuery( document ).ready(function( $ ) {
 	var strings = {
 			picasaUrl:"https://photos.googleapis.com/data/feed/api/user/"
 		}; 	
	var viewer_mode=<?php echo json_encode($this->Params->get("mode", "standard")); ?>;
	
	
	var num_album_to_load=0;
	var g_parameters=[];
	var multi_album=false;
	
			<?php
			$g_parameters=array();
			$albumvisibility=$this->Params->get("albumvisibility", "public");
			if ($albumvisibility=='limited'){
				$p=array(
					'userid'=>$this->Params->get("ozio_nano_userID", "110359559620842741677"),
					'albumvisibility'=>'limited',
					'limitedalbum'=>$this->Params->get("limitedalbum", ""),
					'limitedpassword'=>$this->Params->get("limitedpassword", ""),
				);
				$g_parameters[]=array('params'=>$p);
				echo "\n".'var g_parameters='.json_encode($g_parameters).';';
				
			?>
				num_album_to_load=1;
				jgallery_load_album_data(0,1);
			
			<?php
				
			}else{
			
			
			?>
			jgallery_options={
					thumbSize:64,
					userID: <?php echo json_encode($this->Params->get("ozio_nano_userID", "110359559620842741677")); ?>,
					blackList: <?php echo json_encode($this->Params->get("ozio_nano_blackList", "Scrapbook|profil|2013-")); ?>,
					whiteList: <?php echo json_encode($this->Params->get("ozio_nano_whiteList", "")); ?>,
					<?php
					$non_printable_separator="\x16";
					$new_non_printable_separator="|!|";
					$albumList=$this->Params->get("ozio_nano_albumList", array());
					if (!empty($albumList) && is_array($albumList) ){
						if (count($albumList)==1){
							if (strpos($albumList[0],$non_printable_separator)!==FALSE){
								list($albumid,$title)=explode($non_printable_separator,$albumList[0]);
							}else{
								list($albumid,$title)=explode($new_non_printable_separator,$albumList[0]);
							}
							$kind=$this->Params->get("ozio_nano_kind", "picasa");
							if ($kind=='picasa'){
								echo 'album:'.json_encode($albumid).",\n";
							}else{
								echo 'photoset:'.json_encode($albumid).",\n";
							}
						}else{
							$albumTitles=array();
							foreach ($albumList as $a){
								if (strpos($a,$non_printable_separator)!==FALSE){
									list($albumid,$title)=explode($non_printable_separator,$a);
								}else{
									list($albumid,$title)=explode($new_non_printable_separator,$a);
								}
								$albumTitles[]=$title;
							}
							echo 'albumList:'.json_encode(implode('|',$albumTitles)).",\n";
						}
					}		
					?>
				};
	
	
	
				url = 'https://photos.googleapis.com/data/feed/api/user/'+jgallery_options.userID+'?alt=json&kind=album&access=public&imgmax=d&thumbsize='+jgallery_options.thumbSize;
				jQuery.ajax({
					'url':url,
					'dataType': 'json', // Esplicita il tipo perche' il riconoscimento automatico non funziona con Firefox
					'beforeSend':OnJGalleryBeforeSend,
					'success':OnJGallerySuccess,
					'error':OnJGalleryError,
					'complete':OnJGalleryComplete,
					'context':jgallery_options
				});
				
							
				/*
				 * JGallery
				 */
				function OnJGalleryBeforeSend(jqXHR, settings)
				{
					document.body.style.cursor = "wait";
				}

				function OnJGallerySuccess(data, textStatus, jqXHR)
				{
					
					var context=this;
					//picasa
					jQuery.each(data.feed.entry, function(i,data){
						var filename='';
						
						//Get the title 
						var itemTitle = data.media$group.media$title.$t;

						//Get the URL of the thumbnail
						var itemThumbURL = data.media$group.media$thumbnail[0].url;

						//Get the ID 
						var itemID = data.gphoto$id.$t;
						
						//Get the description
						var imgUrl=data.media$group.media$content[0].url;
						var ok=false;
						if( context.album !== undefined && context.album.length>0){
							ok= (context.album==itemID);
						}else{
							ok=JGalleryCheckAlbumName(itemTitle,context);
						}

						if( ok ) {
								if (viewer_mode=='slider' && g_parameters.length==1){
									//se slider solo1
								}else{
									var nextI=g_parameters.length;
									g_parameters[nextI]={};
									jQuery.extend(g_parameters[nextI],context);
									g_parameters[nextI].title=itemTitle;
									g_parameters[nextI].params={
										'userid':context.userID,
										'albumvisibility':'public',
										'gallery_id':itemID
									};
								}
						}
						
					  });				
					num_album_to_load=g_parameters.length;
					if (num_album_to_load>1){
						multi_album=true;
					}
					for (var i=0;i<g_parameters.length;i++){
						jgallery_load_album_data(i,1);
					}

					
				}

				function OnJGalleryError(jqXHR, textStatus, error)
				{
				}

				function OnJGalleryComplete(jqXHR, textStatus)
				{
					document.body.style.cursor = "default";
				}
				  // check album name - blackList/whiteList
				  function JGalleryCheckAlbumName(title,g_options) {
					var g_blackList=null;
					var g_whiteList=null;
					var g_albumList=null;
					if( g_options.blackList !='' ) { g_blackList=g_options.blackList.toUpperCase().split('|'); }
					if( g_options.whiteList !='' ) { g_whiteList=g_options.whiteList.toUpperCase().split('|'); }
					if( g_options.albumList && g_options.albumList !='' ) { g_albumList=g_options.albumList.toUpperCase().split('|'); }
				  
					var s=title.toUpperCase();

					if( g_albumList !== null ) {
					  for( var j=0; j<g_albumList.length; j++) {
						if( s == g_albumList[j].toUpperCase() ) {
						  return true;
						}
					  }
					}
					else {
					  var found=false;
					  if( g_whiteList !== null ) {
						//whiteList : authorize only album cointaining one of the specified keyword in the title
						for( var j=0; j<g_whiteList.length; j++) {
						  if( s.indexOf(g_whiteList[j]) !== -1 ) {
							found=true;
						  }
						}
						if( !found ) { return false; }
					  }


					  if( g_blackList !== null ) {
						//blackList : ignore album cointaining one of the specified keyword in the title
						for( var j=0; j<g_blackList.length; j++) {
						  if( s.indexOf(g_blackList[j]) !== -1 ) { 
							return false;
						  }
						}
					  }
					  
					  return true;
					}
				  }										
	
			<?php
			}
			?>
	
	
	function jgallery_load_album_data(i,start_index){
		
		var obj={'album_index':i};
		
		if (start_index==1){
			g_parameters[i].slides=[];
		}
		
		
		JGalleryGetAlbumData({
				//mode: 'album_data',
				username: g_parameters[i]['params']['userid'],
				album:  (g_parameters[i]['params']['albumvisibility'] == "public" ? g_parameters[i]['params']['gallery_id'] : g_parameters[i]['params']['limitedalbum']),
				authKey: g_parameters[i]['params']['limitedpassword'],
				StartIndex: start_index,
				beforeSend: OnBeforeSend,
				success: OnLoadSuccess,
				error: OnLoadError, 
				complete: OnLoadComplete,
	
				// Tell the library to ignore parameters through GET ?par=...
				useQueryParameters: false,
				keyword:'',
				thumbSize:72,
				thumbCrop:false,
				photoSize:"auto",
				
				
				context:obj
			});
		
	}

	

	
	function JGalleryCheckPhotoSize(photoSize)
	{
		var $allowedSizes = [94, 110, 128, 200, 220, 288, 320, 400, 512, 576, 640, 720, 800, 912, 1024, 1152, 1280, 1440, 1600];
		if (photoSize === "auto")
		{
			var $windowHeight = $(window).height();
			var $windowWidth = $(window).width();
			var $minSize = ($windowHeight > $windowWidth) ? $windowWidth : $windowHeight;
			for (var i = 1; i < $allowedSizes.length; i++)
			{
				if ($minSize < $allowedSizes[i])
				{
					return $allowedSizes[i - 1];
				}
			}
		}
		else
		{
			return photoSize;
		}
	}	
	
	function JGalleryGetAlbumData(settings)
	{
		// Aggiunto supporto per album id numerico
		// Pur essendo le foto dai posts un album in formato alfanumerico, va trattato come numerico (|posts)
		var numeric = settings.album.match(/^[0-9]{19}|posts$/);
		var album_type;
		if (numeric) album_type = 'albumid';
		else album_type = 'album';

		var url = strings.picasaUrl + settings.username + ((settings.album !== "") ? '/' + album_type + '/' + settings.album : "") +
			'?imgmax=d' +
			// '&kind=photo' + // https://developers.google.com/picasa-web/docs/2.0/reference#Kind
			'&alt=json' + // https://developers.google.com/picasa-web/faq_gdata#alternate_data_formats
			((settings.authKey !== "") ? "&authkey=Gv1sRg" + settings.authKey : "") +
			((settings.keyword !== "") ? "&tag=" + settings.keyword : "") +
			'&thumbsize=' + settings.thumbSize + ((settings.thumbCrop) ? "c" : "u") + "," + JGalleryCheckPhotoSize(settings.photoSize) +
			((settings.hasOwnProperty('StartIndex')) ? "&start-index=" + settings.StartIndex : "") +
			((settings.hasOwnProperty('MaxResults')) ? "&max-results=" + settings.MaxResults : "");


		// http://api.jquery.com/jQuery.ajax/
		$.ajax({
			'url':url,
			'dataType': 'json', // Esplicita il tipo perche' il riconoscimento automatico non funziona con Firefox
			'beforeSend':settings.beforeSend,
			'success':settings.success,
			'error':settings.error,
			'complete':settings.complete,
			'context':settings.context
		});
	}	
	
	
	
	
	
	
	function OnBeforeSend(jqXHR, settings)
	{
		document.body.style.cursor = "wait";
	}
	function OnLoadError(jqXHR, textStatus, error)
	{
		console.log( jqXHR.message, textStatus, error);
	}

	function OnLoadComplete(jqXHR, textStatus)
	{
		document.body.style.cursor = "default";
	}
	
	function OnLoadSuccess(result, textStatus, jqXHR)
	{
		
		
		for (var i = 0; i < result.feed.entry.length; ++i)
		{
			//if (i==0){alert(JSON.stringify(result.feed.entry[i]));}
			// Todo: di default prende il /d nell'URL che serve per il download
			// Removes the file.ext part of the URL
			var seed = result.feed.entry[i].content.src.substring(0, result.feed.entry[i].content.src.lastIndexOf("/"));
			seed = seed.substring(0, seed.lastIndexOf("/")) + "/";

			var width = result.feed.entry[i].gphoto$width.$t;
			var height = result.feed.entry[i].gphoto$height.$t
			var ratio = 1;
			// Avoids divisions by 0
			if (width) ratio = height / width;
			var photo_data={
					'seed': seed,
					'width': width,
					'height': height,
					'ratio': ratio,
					'album': result.feed.title.$t,
					'summary': result.feed.entry[i].summary.$t,
					
					'updated':'',
					'published':'',
					'title':'',
					'size':'',
					'exif_model':'',
					'exif_exposure':'',
					'exif_focallength':'',
					'exif_iso':'',
					'exif_make':'',
					'exif_flash':'',
					'exif_fstop':'',
					'gphoto_timestamp':'',
					'lat':'',
					'long':'',
					'google_url':'',
					
					'photo_id':'',
					'album_id':'',
					'userid':g_parameters[this.album_index]['userid'],
					'json_details':''
			};
			if (typeof result.feed.entry[i].gphoto$id !== "undefined" && typeof result.feed.entry[i].gphoto$id.$t !== "undefined"){
				photo_data['photo_id']=result.feed.entry[i].gphoto$id.$t;
			}
			if (typeof result.feed.entry[i].gphoto$albumid !== "undefined" && typeof result.feed.entry[i].gphoto$albumid.$t !== "undefined"){
				photo_data['album_id']=result.feed.entry[i].gphoto$albumid.$t;
			}
			
			if (typeof result.feed.entry[i].updated !== "undefined" && typeof result.feed.entry[i].updated.$t !== "undefined"){
				photo_data['updated']=result.feed.entry[i].updated.$t;
			}
			if (typeof result.feed.entry[i].published !== "undefined" && typeof result.feed.entry[i].published.$t !== "undefined"){
				photo_data['published']=result.feed.entry[i].published.$t;
			}
			if (typeof result.feed.entry[i].title !== "undefined" && typeof result.feed.entry[i].title.$t !== "undefined"){
				photo_data['title']=result.feed.entry[i].title.$t;
			}
			if (typeof result.feed.entry[i].gphoto$size !== "undefined" && typeof result.feed.entry[i].gphoto$size.$t !== "undefined"){
				photo_data['size']=result.feed.entry[i].gphoto$size.$t;
			}

			if (typeof result.feed.entry[i].exif$tags !== "undefined"){
				
				if (typeof result.feed.entry[i].exif$tags.exif$model !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$model.$t !== "undefined"){
					photo_data['exif_model']=result.feed.entry[i].exif$tags.exif$model.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$exposure !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$exposure.$t !== "undefined"){
					photo_data['exif_exposure']=result.feed.entry[i].exif$tags.exif$exposure.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$focallength !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$focallength.$t !== "undefined"){
					photo_data['exif_focallength']=result.feed.entry[i].exif$tags.exif$focallength.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$iso !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$iso.$t !== "undefined"){
					photo_data['exif_iso']=result.feed.entry[i].exif$tags.exif$iso.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$make !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$make.$t !== "undefined"){
					photo_data['exif_make']=result.feed.entry[i].exif$tags.exif$make.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$flash !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$flash.$t !== "undefined"){
					photo_data['exif_flash']=result.feed.entry[i].exif$tags.exif$flash.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$fstop !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$fstop.$t !== "undefined"){
					photo_data['exif_fstop']=result.feed.entry[i].exif$tags.exif$fstop.$t;
				}
				//timestamp
			}
						
			if (typeof result.feed.entry[i].gphoto$timestamp !== "undefined" && typeof result.feed.entry[i].gphoto$timestamp.$t !== "undefined"){
				photo_data['gphoto_timestamp']=result.feed.entry[i].gphoto$timestamp.$t;
			}
			if (typeof result.feed.entry[i].georss$where !== "undefined" && typeof result.feed.entry[i].georss$where.gml$Point !== "undefined" &&
				typeof result.feed.entry[i].georss$where.gml$Point.gml$pos !== "undefined" && typeof result.feed.entry[i].georss$where.gml$Point.gml$pos.$t !== "undefined"){

				var latlong=result.feed.entry[i].georss$where.gml$Point.gml$pos.$t.split(" ");
				photo_data['lat']=latlong[0];
				photo_data['long']=latlong[1];
			}
			if (typeof result.feed.entry[i].link !== "undefined"){
				for (var j=0;j<result.feed.entry[i].link.length;j++){
					if (result.feed.entry[i].link[j].rel=='alternate' && result.feed.entry[i].link[j].type=='text/html'){
						photo_data['google_url']=result.feed.entry[i].link[j].href;
						break;
					}
				}
				for (var j=0;j<result.feed.entry[i].link.length;j++){
					if (result.feed.entry[i].link[j].rel=='self' && result.feed.entry[i].link[j].type=='application/atom+xml'){
						photo_data['json_details']=result.feed.entry[i].link[j].href;
						break;
					}
				}
			}
			
			
			g_parameters[this.album_index].slides.push(photo_data);
		}		
		
		
		if (result.feed.openSearch$startIndex.$t+result.feed.openSearch$itemsPerPage.$t>=result.feed.openSearch$totalResults.$t){
			//ho finito!
			
			//aggiungo il nuovo album!
			var photoSorting='<?php echo $this->Params->get("photoSorting", "normal"); ?>';
			if (photoSorting=='random'){
				g_parameters[this.album_index].slides=shuffle(g_parameters[this.album_index].slides);
			}else if (photoSorting=='inverse'){
				g_parameters[this.album_index].slides=g_parameters[this.album_index].slides.reverse();
			}
	
			
			var container_width=document.getElementById('jgallery').offsetWidth;
			if (viewer_mode!='slider'){
				container_width=$(window).width();
			}
			
			var	square=<?php echo json_encode($this->Params->get("square", 0)); ?>;
			if (square == 0)
			{
				var actual_width = "w" + container_width + "/";
			}
			else
			{
				var actual_width = "s" + container_width + "-c/";
			}
			
			// Inserisco le slide
			var jgallery=$( '#jgallery' );
			
			//jgallery.html("");
			
			var num_slides=g_parameters[this.album_index].slides.length;
			if (viewer_mode=='slider'){
				num_slides=Math.min(num_slides,10);//al massimo 10 slide
			}
			
			var jcontainer=jgallery;
			
			if (multi_album){
				var halbum=$('<div class="album"></div>');
				halbum.attr("data-jgallery-album-title",g_parameters[this.album_index].title);
				jgallery.append(halbum);
				jcontainer=halbum;
			}
			
			for (var i=0;i<num_slides;i++){
				
				var large=g_parameters[this.album_index].slides[i].seed + actual_width;
				
				var thumb=g_parameters[this.album_index].slides[i].seed + 's75-c/';
				var alt='';
				
				
				if (viewer_mode=='slider'){
					var himg=$('<img>');
					himg.attr("src",large);
					himg.attr("alt",alt);
					jcontainer.append(himg);
				}else{
					var himg=$('<img>');
					himg.attr("src",thumb);
					himg.attr("alt",alt);

					var ha=$('<a>');
					ha.attr("href",large);
					
					ha.append(himg);
					jcontainer.append(ha);
				}
				
			}
			
			//console.log(slides);
			<?php
				$gallerywidth=$this->Params->get("gallerywidth", array("text" => "100", "select" => "%"));
				if (is_object($gallerywidth)) $gallerywidth = (array)$gallerywidth;
			?>
			
			
			num_album_to_load--;
			
			if (num_album_to_load==0){
				
				jgallery.jGallery({
					
					tooltipClose: <?php echo json_encode(JText::_('JLIB_HTML_BEHAVIOR_CLOSE'));?>,//Close
					tooltipFullScreen: <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_MODE_FULLSCREEN'));?>,//Full screen
					tooltipRandom: <?php echo json_encode(JText::_('COM_OZIOGALLERY3_PHOTOSORTING_RANDOM'));?>,//Random
					tooltipSeeAllPhotos: <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_SEEALLPHOTOS_LBL'));?>,//See all photos
					tooltipSeeOtherAlbums: <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_SEEOTHERALBUMS_LBL'));?>,//See other albums
					tooltipSlideshow:  <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_SLIDESHOW_LBL'));?>,//Slideshow
					tooltipToggleThumbnails: <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_TOGGLETHUMBNAILS_LBL'));?>,//toggle thumbnails
					tooltipZoom:  <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_ZOOM_LBL'));?>,//Zoom
					
					
					
					width: <?php echo json_encode($gallerywidth["text"] . $gallerywidth["select"]); ?>,
					height: <?php echo json_encode($this->Params->get("galleryheight", "600")."px"); ?>,
					transition: <?php echo json_encode($this->Params->get("transition", "rotateCubeRightOut_rotateCubeRightIn")); ?>,
					transitionDuration: <?php echo json_encode(intval($this->Params->get("transition_speed", 700))/1000.0); ?>,
					mode: viewer_mode
				});
				
			}
			
			
			
			
		}else{
			//altra chiamata per il rimanente
			jgallery_load_album_data(this.album_index,result.feed.openSearch$startIndex.$t+result.feed.openSearch$itemsPerPage.$t);
		}
		
		
	}

		
	
	
	//+ Jonas Raoni Soares Silva
	//@ http://jsfromhell.com/array/shuffle [v1.0]
	function shuffle(o){ //v1.0
		for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	};	
	
	
	
	
	
	
	
	/*
	
	
	
	
	
	
	var slides = [];
	var ss = jQuery("#jgallery");
	var userid='<?php echo $this->Params->get("userid", ""); ?>';
	
	
	//if (typeof ozio_fullscreen != 'undefined'?ozio_fullscreen:0){
	//	var closelink='<?php $closelink = trim( $this->Params->get("closelink","") ); if (empty($closelink)){$closelink=JURI::base();} echo $closelink; ?>';
	//	jQuery('a.close_fullscreen').attr('href',closelink);
	//}

	var start_slide = 1;
	load_google_json(start_slide);
	function load_google_json(start_slide){
		ss.pwi(
			{
				mode: 'album_data',
				username: '<?php echo $this->Params->get("userid", ""); ?>',
				album: '<?php echo ($this->Params->get("albumvisibility") == "public") ? $this->Params->get("gallery_id", "") : $this->Params->get("limitedalbum"); ?>',
				authKey: '<?php echo $this->Params->get("limitedpassword", ""); ?>',
				StartIndex: start_slide,
				//MaxResults: length,
				beforeSend: OnBeforeSend,
				success: OnLoadSuccess,
				error: OnLoadError, 
				complete: OnLoadComplete,
	
				// Tell the library to ignore parameters through GET ?par=...
				useQueryParameters: false
			});
	}

	function OnBeforeSend(jqXHR, settings)
	{
		document.body.style.cursor = "wait";
	}

	function OnLoadSuccess(result, textStatus, jqXHR)
	{
		for (var i = 0; i < result.feed.entry.length; ++i)
		{
			//if (i==0){alert(JSON.stringify(result.feed.entry[i]));}
			// Todo: di default prende il /d nell'URL che serve per il download
			// Removes the file.ext part of the URL
			var seed = result.feed.entry[i].content.src.substring(0, result.feed.entry[i].content.src.lastIndexOf("/"));
			seed = seed.substring(0, seed.lastIndexOf("/")) + "/";

			var width = result.feed.entry[i].gphoto$width.$t;
			var height = result.feed.entry[i].gphoto$height.$t
			var ratio = 1;
			// Avoids divisions by 0
			if (width) ratio = height / width;
			var photo_data={
					'seed': seed,
					'width': width,
					'height': height,
					'ratio': ratio,
					'album': result.feed.title.$t,
					'summary': result.feed.entry[i].summary.$t,
					
					'updated':'',
					'published':'',
					'title':'',
					'size':'',
					'exif_model':'',
					'exif_exposure':'',
					'exif_focallength':'',
					'exif_iso':'',
					'exif_make':'',
					'exif_flash':'',
					'exif_fstop':'',
					'gphoto_timestamp':'',
					'lat':'',
					'long':'',
					'google_url':'',
					
					'photo_id':'',
					'album_id':'',
					'userid':userid,
					'json_details':''
			};
			if (typeof result.feed.entry[i].gphoto$id !== "undefined" && typeof result.feed.entry[i].gphoto$id.$t !== "undefined"){
				photo_data['photo_id']=result.feed.entry[i].gphoto$id.$t;
			}
			if (typeof result.feed.entry[i].gphoto$albumid !== "undefined" && typeof result.feed.entry[i].gphoto$albumid.$t !== "undefined"){
				photo_data['album_id']=result.feed.entry[i].gphoto$albumid.$t;
			}
			
			if (typeof result.feed.entry[i].updated !== "undefined" && typeof result.feed.entry[i].updated.$t !== "undefined"){
				photo_data['updated']=result.feed.entry[i].updated.$t;
			}
			if (typeof result.feed.entry[i].published !== "undefined" && typeof result.feed.entry[i].published.$t !== "undefined"){
				photo_data['published']=result.feed.entry[i].published.$t;
			}
			if (typeof result.feed.entry[i].title !== "undefined" && typeof result.feed.entry[i].title.$t !== "undefined"){
				photo_data['title']=result.feed.entry[i].title.$t;
			}
			if (typeof result.feed.entry[i].gphoto$size !== "undefined" && typeof result.feed.entry[i].gphoto$size.$t !== "undefined"){
				photo_data['size']=result.feed.entry[i].gphoto$size.$t;
			}

			if (typeof result.feed.entry[i].exif$tags !== "undefined"){
				
				if (typeof result.feed.entry[i].exif$tags.exif$model !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$model.$t !== "undefined"){
					photo_data['exif_model']=result.feed.entry[i].exif$tags.exif$model.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$exposure !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$exposure.$t !== "undefined"){
					photo_data['exif_exposure']=result.feed.entry[i].exif$tags.exif$exposure.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$focallength !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$focallength.$t !== "undefined"){
					photo_data['exif_focallength']=result.feed.entry[i].exif$tags.exif$focallength.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$iso !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$iso.$t !== "undefined"){
					photo_data['exif_iso']=result.feed.entry[i].exif$tags.exif$iso.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$make !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$make.$t !== "undefined"){
					photo_data['exif_make']=result.feed.entry[i].exif$tags.exif$make.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$flash !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$flash.$t !== "undefined"){
					photo_data['exif_flash']=result.feed.entry[i].exif$tags.exif$flash.$t;
				}
				if (typeof result.feed.entry[i].exif$tags.exif$fstop !== "undefined" && typeof result.feed.entry[i].exif$tags.exif$fstop.$t !== "undefined"){
					photo_data['exif_fstop']=result.feed.entry[i].exif$tags.exif$fstop.$t;
				}
				//timestamp
			}
						
			if (typeof result.feed.entry[i].gphoto$timestamp !== "undefined" && typeof result.feed.entry[i].gphoto$timestamp.$t !== "undefined"){
				photo_data['gphoto_timestamp']=result.feed.entry[i].gphoto$timestamp.$t;
			}
			if (typeof result.feed.entry[i].georss$where !== "undefined" && typeof result.feed.entry[i].georss$where.gml$Point !== "undefined" &&
				typeof result.feed.entry[i].georss$where.gml$Point.gml$pos !== "undefined" && typeof result.feed.entry[i].georss$where.gml$Point.gml$pos.$t !== "undefined"){

				var latlong=result.feed.entry[i].georss$where.gml$Point.gml$pos.$t.split(" ");
				photo_data['lat']=latlong[0];
				photo_data['long']=latlong[1];
			}
			if (typeof result.feed.entry[i].link !== "undefined"){
				for (var j=0;j<result.feed.entry[i].link.length;j++){
					if (result.feed.entry[i].link[j].rel=='alternate' && result.feed.entry[i].link[j].type=='text/html'){
						photo_data['google_url']=result.feed.entry[i].link[j].href;
						break;
					}
				}
				for (var j=0;j<result.feed.entry[i].link.length;j++){
					if (result.feed.entry[i].link[j].rel=='self' && result.feed.entry[i].link[j].type=='application/atom+xml'){
						photo_data['json_details']=result.feed.entry[i].link[j].href;
						break;
					}
				}
			}
			
			
			slides.push(photo_data);
		}

		if (result.feed.openSearch$startIndex.$t+result.feed.openSearch$itemsPerPage.$t>=result.feed.openSearch$totalResults.$t){
			var photoSorting='<?php echo $this->Params->get("photoSorting", "normal"); ?>';
			if (photoSorting=='random'){
				slides=shuffle(slides);
			}else if (photoSorting=='inverse'){
				slides=slides.reverse();
			}
	
			jQuery(function ($)
			{
				var viewer_mode=<?php echo json_encode($this->Params->get("mode", "standard")); ?>;
				
				var container_width=document.getElementById('jgallery').offsetWidth;
				if (viewer_mode!='slider'){
					container_width=$(window).width();
				}
				
				var	square=<?php echo json_encode($this->Params->get("square", 0)); ?>;
				if (square == 0)
				{
					var actual_width = "w" + container_width + "/";
				}
				else
				{
					var actual_width = "s" + container_width + "-c/";
				}
				
				// Inserisco le slide
				var jgallery=$( '#jgallery' );
				
				jgallery.html("");
				
				var num_slides=slides.length;
				if (viewer_mode=='slider'){
					num_slides=Math.min(num_slides,10);//al massimo 10 slide
				}
				
				for (var i=0;i<num_slides;i++){
					
					var large=slides[i].seed + actual_width;
					
					var thumb=slides[i].seed + 's150-c/';
					var alt='';
					
					
					if (viewer_mode=='slider'){
						var himg=$('<img>');
						himg.attr("src",large);
						himg.attr("alt",alt);
						jgallery.append(himg);
					}else{
						var himg=$('<img>');
						himg.attr("src",thumb);
						himg.attr("alt",alt);

						var ha=$('<a>');
						ha.attr("href",large);
						
						ha.append(himg);
						jgallery.append(ha);
					}
					
				}
				
				//console.log(slides);
				<?php
					$gallerywidth=$this->Params->get("gallerywidth", array("text" => "100", "select" => "%"));
					if (is_object($gallerywidth)) $gallerywidth = (array)$gallerywidth;
				?>
				
				
				jgallery.jGallery({
					
					tooltipClose: <?php echo json_encode(JText::_('JLIB_HTML_BEHAVIOR_CLOSE'));?>,//Close
					tooltipFullScreen: <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_MODE_FULLSCREEN'));?>,//Full screen
					tooltipRandom: <?php echo json_encode(JText::_('COM_OZIOGALLERY3_PHOTOSORTING_RANDOM'));?>,//Random
					tooltipSeeAllPhotos: <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_SEEALLPHOTOS_LBL'));?>,//See all photos
					tooltipSeeOtherAlbums: <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_SEEOTHERALBUMS_LBL'));?>,//See other albums
					tooltipSlideshow:  <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_SLIDESHOW_LBL'));?>,//Slideshow
					tooltipToggleThumbnails: <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_TOGGLETHUMBNAILS_LBL'));?>,//toggle thumbnails
					tooltipZoom:  <?php echo json_encode(JText::_('COM_OZIOGALLERY3_JGALLERY_ZOOM_LBL'));?>,//Zoom
					
					
					
					width: <?php echo json_encode($gallerywidth["text"] . $gallerywidth["select"]); ?>,
					height: <?php echo json_encode($this->Params->get("galleryheight", "600")."px"); ?>,
					transition: <?php echo json_encode($this->Params->get("transition", "rotateCubeRightOut_rotateCubeRightIn")); ?>,
					transitionDuration: <?php echo json_encode(intval($this->Params->get("transition_speed", 700))/1000.0); ?>,
					mode: viewer_mode
				});
				
				
			});
		}else{
			load_google_json(result.feed.openSearch$startIndex.$t+result.feed.openSearch$itemsPerPage.$t);
		}

	}

	function OnLoadError(jqXHR, textStatus, error)
	{
		console.log( jqXHR.message, textStatus, error);
	}

	function OnLoadComplete(jqXHR, textStatus)
	{
		document.body.style.cursor = "default";
	}
  
	
	*/
	
	
	
	
});
