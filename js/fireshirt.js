$(function(){

    function dbg(s) {
        console.log(s);
    }

    var Fireshirt = function() {
        var currentList;
        var localStorage = window.localStorage;


        function init() {
            initLocalStorage();
            addItemButton();
            initTextArea();
            initItemsListSorting();
        }


        function initLocalStorage() {
            // Grab last view list if exists.
            if (localStorage['lastViewedList']) {
                currentList = localStorage['lastViewedList'];
                initList(currentList);
            }
            else {
                // Grab the sample list from the HTML and add to localStorage
                // if not already in localStorage.
                currentList = 'lists.sample';
                if (!localStorage[currentList]) {
                    var listItems = [];
                    var sampleList = $('#items-list li');
                    sampleList.each(function(index, listItem) {
                        // Add <li><p>TEXT</p><p>TEXT2</p></li>.
                        var pChildren = []
                        var children = $(listItem).children('p');
                        children.each(function(index, child) {
                            pChildren.push(child.innerHTML);
                        });
                        listItems.push(pChildren);
                    });
                    localStorage[currentList] = JSON.stringify(listItems);
                }
                localStorage['lastViewedList'] = currentList;
            }
        }


        function initList(listName) {
            // Removes current list, grabs a list from localStorage and spits
            // it to the page.
            var listItems = $(JSON.parse(localStorage[listName]));
            var list = $('#items-list');
            list.empty();

            listItems.each(function(index, listItem) {
                newListItem = $('<li></li>');
                $(listItem).each(function(index, pChild) {
                    newListItem.append($('<p>' + pChild + '</p>'));
                    $('#items-list').prepend(newListItem);
                });
                newListItem.append($(getActionElements()));
                list.append(newListItem);
            });
        }


        function addItemButton() {
            // Add item to list when submitting text.
            var addButton = $('#add-item');
            addButton.click(function(e) {
                e.preventDefault();
                var itemText = $('#add-item-text').val();
                var newListItem = $('<li><p>' + itemText + '</p>' + getActionElements() + '</li>');
                $('#items-list').prepend(newListItem);

                // Add to localStorage.
                addItemToLocalStorage(currentList, newListItem);
            });
        }


        function getActionElements() {
            // Return div with action elements to add to list items.
            return '<div class="actions"><span class="delete ss-icon">delete</span><span class="move ss-icon">move</span></div>';
        }


        function addItemToLocalStorage(listName, listItem) {
            // Adds item to list in localStorage.
            list = JSON.parse(localStorage[listName]);
            var pChildren = []
            var children = listItem.children('p');
            children.each(function(index, child) {
                pChildren.push(child.innerHTML);
            });
            list.unshift(pChildren);
            localStorage[listName] = JSON.stringify(list);
        }


        function initTextArea() {
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
        }


        function initItemsListSorting() {
            $(".items_list").sortable({
                handle: '.move',
                placeholder: 'ui-state-highlight',
                cursorAt: { left: 0 }
            });
            $( ".items_list" ).disableSelection();
        };


        return {
            init: init
        };
    }();
    Fireshirt.init();

});
