$(function(){


	/* Textfield focus/blur
	*********************************************/

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

	/* Sortable list items
	*********************************************/
	$(".items_list").sortable({
		handle: '.move',
		placeholder: 'ui-state-highlight',
		cursorAt: { left: 0 }
	});

	$( ".items_list" ).disableSelection();

	/* Showing/hiding lists
	*********************************************/

	$('.toggle-lists').on('click', function(e){
		e.preventDefault();
		$('.lists', $(this).parent()).toggleClass('show');
	});

	/* Creating items
	*********************************************/
    function dbg(s) {
        console.log(s);
    }

    var Fireshirt = function() {
        var localStorage = window.localStorage;

        function init() {
            addItemButton();
        }


        function addItemButton() {
            var addButton = $('#add-item');
            addButton.click(function(e) {
                e.preventDefault();
                var itemText = $('#add-item-text').val();
                var newListItem = $('<li>' + itemText + '<div class="actions"><span class="delete ss-icon">delete</span><span class="move ss-icon">move</span></div></li>');
                $('#items-list').prepend(newListItem);
            });
        }

        return {
            init: init
        };
    }();
    Fireshirt.init();

});
