$(document).ready(function() {

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
                var newListItem = $('<li>' + itemText + '</li>')
                $('#items-list').prepend(newListItem);
            });
        }

        return {
            init: init
        }
    }();
    Fireshirt.init()

});
