<?php
?>
jQuery( document ).ready(function( $ ) {
	
	var slides = [];
	var ss = jQuery("#jgallery");
	var userid='<?php echo $this->Params->get("userid", ""); ?>';
	
	/*
	if (typeof ozio_fullscreen != 'undefined'?ozio_fullscreen:0){
		var closelink='<?php $closelink = trim( $this->Params->get("closelink","") ); if (empty($closelink)){$closelink=JURI::base();} echo $closelink; ?>';
		jQuery('a.close_fullscreen').attr('href',closelink);
	}
	*/

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
				var	square=<?php echo json_encode($this->Params->get("square", 0)); ?>;
				if (square == 0)
				{
					var actual_width = "w" + document.getElementById('jgallery').offsetWidth + "/";
				}
				else
				{
					var actual_width = "s" + document.getElementById('jgallery').offsetWidth + "-c/";
				}
				var viewer_mode=<?php echo json_encode($this->Params->get("mode", "standard")); ?>;
				
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
  
	//+ Jonas Raoni Soares Silva
	//@ http://jsfromhell.com/array/shuffle [v1.0]
	function shuffle(o){ //v1.0
		for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
		return o;
	};	
	
	
	
	
	
	
});
