$(function(){

	$('.new_item textarea').on('focus', function(){

		var $this = $(this);
		var placeholder = $this.attr('title');

		// Remove placeholder text
		if( $this.val() == placeholder ){
			$this.val('');
		}

		// Focus mode
		$('.items').addClass('focus-mode');

	}).on('blur', function(){

		var $this = $(this);

		// Remove placeholder text
		if( $this.val() === '' ){
			$this.val($this.attr('title'));
		}

		// Remove focus mode
		$('.items').removeClass('focus-mode');

	});

	$( ".items_list" ).sortable();
	$( ".items_list" ).disableSelection();

});