<?php
defined( '_JEXEC' ) or die( 'Restricted access' );
?>
<div id="oziogallery2" class="oziogallery2">

<?php if ($this->params->def( 'show_page_title', 1 )) : ?>

    <h1 class="componentheading">
		<?php echo $this->params->get('page_title'); ?>
	</h1>

<?php endif; ?>

<?php if ($this->params->get('showintrotext')) : ?>
	<div class="description no_space floattext">
		<?php echo $this->params->get('introtext'); ?>
	</div>
<?php endif; ?>

<table width="100%" border="0" cellspacing="0" cellpadding="0">
	<thead>
			<tr>
			    <th width="75"id="img" class="sectiontableheader">
				</th>
				<th id="title" class="sectiontableheader">
					<?php echo JText::_('Galleria') ?>
				</th>
			</tr>
	</thead>

	<tbody>
	<?php foreach ($this->items as $item) : ?>

  			<tr class="sectiontableentry" >
                <td width="75" align="center" valign="middle">
					<img src='<?php echo $this->pathimage?>' width="50">
				</td>
    			<td valign="middle">

    				<strong><a href="<?php echo JRoute::_( $item->link . '&Itemid='. $item->id ); ?>"><?php echo $this->escape($item->name); ?></a></strong>	
				</td>
			</tr>
	<?php endforeach; ?>

	</tbody>
</table>

</div>