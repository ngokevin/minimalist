$(function(){
/*
Lists have data attributes data-id and data-name.

{
    'lastViewedList': 0,
    'lists': ['sample'],
    'sample': {
            'id': 0,
            'list': [
                {
                    'id': 1,
                    'items': ['item1', 'item2'],
                    'rank': 2
                },
                {
                    'id': 2,
                    'items': ['item3', 'item4'],
                    'rank': 1
                }
            ]
    }
}
*/

    $('.toggle-lists').on('click', function(e){
        e.preventDefault();
        $('.lists-switcher', $(this).parent()).toggleClass('show');
    });

    function dbg(s) {
        console.log(s);
    }

    var Fireshirt = function() {
        var currentListName, currentListId;
        var localStorage = window.localStorage;
        var buttonPressed = false;
        var textareaMultiline = false;
        var hoverConfig = {
             over: function(){ $(this).addClass('show-actions'); }, // function = onMouseOver callback
             timeout: 400, // number = milliseconds delay before onMouseOut
             out: function(){ $(this).removeClass('show-actions'); } // function = onMouseOut callback
        };

        function init() {
            initLists();
            initTextArea();
            initNewListButton();
            initListSwitcher();
            initAddItemButton();
            initDeleteItemButton();
            initSorting();
        }


        function initLists() {
            // Grab last view list if exists.
            if (localStorage['lastViewedListId']) {
                currentListId = localStorage['lastViewedListId'];
                currentListName = localStorage['lastViewedListName'];
                $('h1').text(currentListName).delay(800).fadeOut();
            } else {
                // Create default list if no list exist.
                $('h1').delay(800).fadeOut();
                currentListName = 'First List';
                localStorage['lists'] = JSON.stringify(['First List']);
                localStorage[currentListName] = JSON.stringify({
                    'id': 0,
                    'list': JSON.stringify([])
                });
                localStorage['lastViewedListId'] = 0;
                localStorage['lastViewedListName'] = currentListName;
            }
            currentListId = JSON.parse(localStorage[currentListName])['id'];

            // Loads in all lists from localStorage, sets currentList as active
            // list.
            var listNames = JSON.parse(localStorage['lists']);
            $(listNames).each(function(index, listName) {
                // Create list.
                var listObj = JSON.parse(localStorage[listName]);
                var newList = $('<ul></ul>').addClass('list');
                newList.attr('data-id', listObj['id']);
                newList.attr('data-name', listName);

                // Populate list.
                $(JSON.parse(listObj['list'])).each(function(index, listItems){
                    var item = getRankedListItem(listName, index);
                    addObjToList(listName, newList, item);
                });

                // Show last viewed list.
                if (parseInt(listObj['id']) == currentListId) {
                    newList.addClass('current-list');
                }

                // Add to list switcher.
                var newListSwitcherItem = $('<li>' + listName + '</li>');
                newListSwitcherItem.attr('data-id', newList.data('id'));
                newListSwitcherItem.attr('data-name', listName);
                $('.lists-switcher').prepend(newListSwitcherItem);

                $('.lists').append(newList);
            });

            $(".list li").hoverIntent(hoverConfig);
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
                $('.lists').addClass('focus-mode');
            }).on('blur', function(){
                var $this = $(this);

                // Remove placeholder text
                if( $this.val() === '' ){
                    $this.val($this.attr('title'));
                }

                // Remove focus mode
                if( !buttonPressed ) $('.lists').removeClass('focus-mode');
            }).on('keyup', function(e) {
                var $this = $(this);
                var valLength = $this.val().length;

                // Change font size in textarea
                if( !textareaMultiline ){
                    if( valLength >= 130 ){
                        $this.addClass('small');
                    } else if( valLength >= 27 ){
                        $this.addClass('medium');
                    } else {
                        $this.removeClass('medium small');
                    }
                }

                // Insert new line on shift+header
                if (e.keyCode == 13 && e.shiftKey) {
                       var content = this.value;
                       var caret = getCaret(this);
                       this.value = content.substring(0,caret)+
                                     ""+content.substring(caret,content.length-1);
                        $this.addClass('small');
                        textareaMultiline = true;
                       e.stopPropagation();
                       return;
                }

                // Submit form on enter
                if(e.keyCode == 13){
                    e.stopPropagation();
                    addNewItem(e);
                }
            });

            $('.new_item input[type="submit"]').on('mousedown click', function(){
                $('.lists').addClass('focus-mode');
                buttonPressed = true;
            }).on('mouseup click', function(){
                buttonPressed = false;
            });

            // Vertically align textfield
            if($(window).width() > 800){
                var $form = $('form.new_item');
                var windowHeight = $(window).height();
                $form.css('marginTop', (windowHeight - $form.height())/2.2);
            }
        }


        function initNewListButton(){
            // On click, prompt list name, create new list, add to list
            // switcher, add to localStorage, switch to new empty list.
            $('.lists-switcher .new').on('click', function(){
                var listTitle = prompt('List Name', '');

                if (listTitle !== null){
                    currentListName = listTitle;

                    // Add list to localStorage.
                    var lists = JSON.parse(localStorage['lists']);
                    var listId = lists.length;
                    lists.push(listTitle);
                    localStorage['lists'] = JSON.stringify(lists);
                    localStorage[currentListName] = JSON.stringify({
                        'id': listId,
                        'list': JSON.stringify([])
                    });
                    // Add new list name to list switcher.
                    var listSwitcher = $('.lists-switcher');
                    var listSwitchItem = listSwitcher.prepend($('<li>' + listTitle + '</li>'));
                    listSwitchItem.attr('data-id', listId).attr('data-name', listTitle);

                    // Swap out list.
                    var newList = $('<ul></ul>');
                    newList.addClass('current-list');
                    newList.addClass('list');
                    newList.attr('data-id', listId);
                    newList.attr('data-name', listTitle);
                    $('.current-list').removeClass('current-list');
                    $('.lists').append(newList);

                    localStorage['lastViewedListId'] = listId;
                    localStorage['lastViewedListName'] = listTitle;
                    currentListId = listId;
                }
            });
        }


        function initListSwitcher() {
            // Clicking a new list swaps in list.
            $('.lists-switcher li:not(.new)').on('click', function(e){
                e.preventDefault();

                // Display title briefly.
                var title = this.innerHTML
                $('h1').text(title).fadeIn().delay(500).fadeOut();
                var listId = $(this).data('id');

                // Change backend variables.
                currentListName = title;
                currentListId= listId;
                localStorage['lastViewedListName'] = title;
                localStorage['lastViewedListId'] = listId;

                // Animation.
                if($('.current-list li').length){
                    // If has items, do a hinge out animation.
                    $('.current-list').bind('animationend webkitAnimationEnd MSAnimationEnd oAnimationEnd', function(e){
                        $(this).removeClass('current-list hinge-close').removeAttr('style');
                        $('.lists ul[data-id="' + listId + '"]').fadeIn().addClass('current-list');
                    }).addClass('hinge-close');
                } else {
                    $('.current-list').removeClass('current-list hinge-close').removeAttr('style');
                    $('.lists ul[data-id="' + listId + '"]').fadeIn().addClass('current-list');
                }

                // Unshow list switcher.
                $('.lists-switcher').removeClass('show');

                return false;
            });

            $('.next-list').on('click', function(e){
                // Swap to next list.
                var $currentList = $('.current-list');
                var $nextList = $currentList.next('ul');
                var title = $nextList.data('name');
                var listId = $nextList.data('id');

                $('h1').text(title).fadeIn().delay(500).fadeOut();
                if( $nextList.length ){
                    $currentList.removeClass('current-list').removeAttr('style');
                    $nextList.addClass('current-list');
                }

                currentListName = title;
                currentListId= listId;
                localStorage['lastViewedListName'] = title;
                localStorage['lastViewedListId'] = listId;
            });

            $('.prev-list').on('click', function(e){
                // Swap to prev list.
                var $currentList = $('.current-list');
                var $prevList = $currentList.prev('ul');
                var title = $prevList.data('name');
                var listId = $prevList.data('id');

                $('h1').text(title).fadeIn().delay(500).fadeOut();
                if( $prevList.length ){
                    $currentList.removeClass('current-list').removeAttr('style');
                    $prevList.addClass('current-list');
                }

                currentListName = title;
                currentListId= listId;
                localStorage['lastViewedListName'] = title;
                localStorage['lastViewedListId'] = listId;
            });
        }


        function initSorting() {
            var oldRank = null;
            $(".list").sortable({
                placeholder: 'ui-state-highlight',
                change: function(event, ui) {
                    oldRank = ui.item.data('rank');
                },
                update: function(event, ui) {
                    // Get position in link as new rank.
                    var id = ui.item.data('id');
                    var list = $('.current-list li');
                    var newRank;
                    list.each(function(index, element) {
                        var element = $(element);
                        if (parseInt(element.data('id')) == id) {
                            if (element.prev('li').length > 0) {
                                newRank = element.prev('li').data('rank');
                            } else {
                                newRank = element.next('li').data('rank');
                            }
                        }
                    });
                    // reRankItem(currentListName, parseInt(oldRank), parseInt(newRank));
                }
            });
            $( ".list" ).disableSelection();
        }


        function initAddItemButton() {
            $('#add-item').on('click', function(e) {
                addNewItem(e);
            });
        }


        function initDeleteItemButton(){
            $('.list').on('click', '.actions .delete', function(e){
                var listItem = $(this).parents('li.new_item').remove();
                var id = listItem.data('id');
                listItem.remove()

                // Remove from localStorage based on data-id.
                var rank;
                var listObj = JSON.parse(localStorage[currentListName]);
                var items = JSON.parse(JSON.parse(localStorage[currentListName])['list']);
                $(items).each(function(index, item) {
                    if (item.id == id) {
                        rank = item.rank;
                        items.splice(index, 1);
                        return;
                    }
                });

                // Move ranks of items up.
                $(items).each(function(index, item) {
                    if (item.rank > rank) {
                        item.rank--;
                    }
                });

                listObj['list'] = JSON.stringify(items);
                localStorage[currentListName] = JSON.stringify(listObj);
            });
        }


        function addNewItem(e){
            // Add item to list when submitting text and to localStorage.
            e.preventDefault();

            var $textarea = $('#add-item-text');
            var itemText = $textarea.val();

            // Add to current list
            var listElement = $('.current-list'), listItems = $([itemText]);
            var newListItem = '<li class="new_item">';
            listItems.each(function(index, listItem) {
                newListItem += '<p>' + listItem + '</p>';
            });
            newListItem += getActionElements() + '</li>';
            newListItem = $(newListItem);
            listElement.prepend(newListItem);
            initDeleteItemButton();

            $('li.new_item').hoverIntent(hoverConfig);
            $textarea.focus().val('');

            // Add to localStorage.
            var newItem = addItemToLocalStorage(currentListName, [itemText]);
            newListItem.attr('data-id', newItem.id);
            newListItem.attr('data-rank', newItem.rank);

            $textarea.removeClass('medium small');
            textareaMultiline = false;
        }


        function addObjToList(listName, listElement, item) {
            // Takes in the DOM list and list object and adds list item to
            // given <li> element. Used in initalization.
            $(item).each(function(index, listItem) {
                var newListItem = '<li class="new_item">';
                // Individual p elements.
                $(JSON.parse(listItem['items'])).each(function(index, item) {
                    newListItem += '<p>' + item + '</p>';
                });
                newListItem += getActionElements() + '</li>';

                newListItem = $(newListItem);
                newListItem.attr('data-id', listItem['id']);
                newListItem.attr('data-rank', listItem['rank']);
                listElement.append(newListItem);
            });
            initDeleteItemButton();
        }


        function getRankedListItem(listName, rank) {
            // Given a list and rank, grab the list item that has the rank.
            var listItems = $(JSON.parse(JSON.parse(localStorage[listName])['list']));
            var ret;
            listItems.each(function(index) {
                if (parseInt(listItems[index]['rank']) == rank) {
                    ret = listItems[index];
                }
            });
            return ret;
        }


        function reRankItem(list, oldRank, newRank) {
            // Rerank a list item, shift other elements' ranks if necessary.
            var listItems = $(JSON.parse(localStorage[list])['list']);
            var shift = 0;
            if (newRank < oldRank) {
                // Promoting.
                shift = 1;
            } else {
                // Demoting
                shift = -1;
            }

            dbg(listItems);
            var rank;
            listItems.each(function(index, element) {
                rank = parseInt(element['rank'])
                if ((rank < oldRank || parseInt(rank) > newRank)) {
                    return;
                }
                if (rank == oldRank) {
                    element['rank'] = newRank;
                } else {
                    element['rank'] = rank + shift;
                }
            });
            dbg(listItems);
            localStorage[list]['list'] = JSON.stringify(listItems);
        }


        function addItemToLocalStorage(listName, listItems) {
            // Adds item to list in localStorage.
            var listObj = JSON.parse(localStorage[listName]);
            var list = JSON.parse(listObj['list']);

            newItem = {
                'id': '' + list.length,
                'items': JSON.stringify(listItems),
                'rank': '0'
            }
            // Squeeze item to top rank.
            $(list).each(function(index, item) {
                item.rank++;
            });

            list.push(newItem);
            listObj['list'] = JSON.stringify(list);

            localStorage[listName] = JSON.stringify(listObj);
            return newItem;
        }


        function getCaret(el) {
          if (el.selectionStart) {
             return el.selectionStart;
          } else if (document.selection) {
             el.focus();

           var r = document.selection.createRange();
           if (r === null) {
            return 0;
           }

            var re = el.createTextRange(),
            rc = re.duplicate();
            re.moveToBookmark(r.getBookmark());
            rc.setEndPoint('EndToStart', re);

            return rc.text.length;
          }
          return 0;
        }


        function getActionElements() {
            // Return div with action elements to add to list items.
            return '<div class="actions"><span class="delete ss-icon">delete</span><span class="edit ss-icon">write</span></div>';
        }


        return {
            init: init
        };
    }();

    $('.new_item').css('visibility', 'hidden');
    Fireshirt.init();
    $('.new_item').css('visibility', 'visible');
});
