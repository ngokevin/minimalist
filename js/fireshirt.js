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
        var headerTimeout;

        function init() {
            initLists();
            initTextArea();
            initDeleteListButton();
            initNewListButton();
            initListSwitcher();
            initPrevNextSwitcher();
            initAddItemButton();
            initListActionButtons();
            initSorting();
        }


        function initLists() {
            // Grab last view list if exists.
            if (localStorage['lastViewedListId']) {
                currentListId = localStorage['lastViewedListId'];
                currentListName = localStorage['lastViewedListName'];
                fadeHeader(currentListName, 800);
            } else {
                // Create default list if no list exist.
                fadeHeader($('h1').text(), 800);
                currentListName = 'First List';
                localStorage['lists'] = JSON.stringify(['First List']);
                localStorage[currentListName] = JSON.stringify({
                    'id': 0,
                    'list': JSON.stringify([])
                });
                localStorage['lastViewedListId'] = 0;
                localStorage['lastViewedListName'] = currentListName;

                // Display 'Minimalist' at first, but change header in
                // background.
                setTimeout(function() { $('h1').text(currentListName); }, 1200 );
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
            $('.lists-switcher li[data-id=' + currentListId + ']').addClass('active');

            $(".list li").hoverIntent(hoverConfig);

            // Switch to edit mode on double click
            $('.lists').on('dblclick', 'li', function(){
                var $li = $(this);
                $('.edit-mode').removeClass('edit-mode'); // remove edit mode from others
                $li.addClass('edit-mode');
                $('textarea', $li).focus();
            });
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


        function initDeleteListButton(){
            $('.lists-switcher .delete').on('click', function(){
                if (confirm('Delete ' + currentListName + '?')) {
                    if (JSON.parse(localStorage['lists']).length <= 1) {
                        alert('Sorry, I cannot allow you to delete your only list.');
                        return;
                    }

                    // Delete list from localStorage.
                    var lists = JSON.parse(localStorage['lists']);
                    var items = JSON.parse(JSON.parse(localStorage[currentListName])['list']);
                    $(lists).each(function(index, list) {
                        if (list == currentListName) {
                            lists.splice(index, 1);
                            return;
                        }
                    });
                    localStorage['lists'] = JSON.stringify(lists);
                    delete localStorage[currentListName];

                    // Delete list name from list switcher.
                    $('.lists-switcher li[data-id=' + currentListId + ']').remove();

                    // Move to next list.
                    var oldListId = currentListId;
                    var $currentList = $('.current-list');
                    if ($currentList.next('ul').length) {
                        switchPrevNextList($currentList.next('ul'));
                    } else if ($currentList.prev('ul').length) {
                        switchPrevNextList($currentList.prev('ul'));
                    }
                    $('.list[data-id=' + oldListId + ']').remove();
                }
            });
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
                    var listSwitchItem = $('<li>' + listTitle + '</li>');
                    listSwitchItem.attr('data-id', listId).attr('data-name', listTitle);
                    $('.lists-switcher li[data-id=' + currentListId + ']').removeClass('active');
                    listSwitchItem.addClass('active');
                    listSwitcher.prepend(listSwitchItem);

                    // Swap out list.
                    var newList = $('<ul></ul>');
                    newList.addClass('current-list');
                    newList.addClass('list');
                    newList.attr('data-id', listId);
                    newList.attr('data-name', listTitle);
                    $('.current-list').removeClass('current-list').removeAttr('style');
                    $('.lists').append(newList);

                    localStorage['lastViewedListId'] = listId;
                    localStorage['lastViewedListName'] = listTitle;
                    currentListId = listId;
                    fadeHeader(listTitle);

                    // Bind new list swticher button.
                    initListSwitcher();
                }
            });
        }


        function initListSwitcher() {
            // Clicking a new list swaps in list.
            $('.lists-switcher li:not(.new, .delete)').on('click', function(e){
                e.preventDefault();
                var listId = $(this).data('id');
                var title = this.innerHTML;

                // Indicate current list.
                $('.lists-switcher li[data-id="' + currentListId + '"]').removeClass('active');
                $('.lists-switcher li[data-id="' + listId + '"]').addClass('active');

                // Display title briefly.
                hingeAnimation(listId);
                fadeHeader(title, 1000);

                // Change backend variables.
                currentListName = title;
                currentListId = listId;
                localStorage['lastViewedListName'] = title;
                localStorage['lastViewedListId'] = listId;

                // Unshow list switcher.
                $('.lists-switcher').removeClass('show');

                return false;
            });
        }


        function initPrevNextSwitcher() {
            $('.next-list').on('click', function(e){
                // Swap to next list.
                switchPrevNextList($('.current-list').next('ul'));
            });

            $('.prev-list').on('click', function(e){
                // Swap to prev list.
                switchPrevNextList($('.current-list').prev('ul'));
            });
        }


        function switchPrevNextList($switchToList) {
            // Swap to prev or next list if there is one, else just play
            // animation and switch to self.
            if ($switchToList.length > 0) {
                // Change active list in list switcher.
                $('.lists-switcher li[data-id=' + currentListId + ']').removeClass('active');

                currentListName = $switchToList.data('name');
                currentListId = $switchToList.data('id');

                $('.lists-switcher li[data-id=' + currentListId + ']').addClass('active');

                $('.current-list').removeClass('current-list').removeAttr('style');
                $switchToList.addClass('current-list');
                fadeHeader(currentListName, 1000);

                localStorage['lastViewedListName'] = currentListName;
                localStorage['lastViewedListId'] = currentListId;
            } else {
                fadeHeader(currentListName, 1000);
            }
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
                    var newRank;
                    var id = ui.item.data('id');
                    $('.current-list li').each(function(index, element) {
                        if ($(element).data('id') == id) {
                            newRank = index;
                        }
                    });
                    reRankItem(currentListName, parseInt(oldRank), parseInt(newRank));
                }
            });
            $( ".list" ).disableSelection();
        }


        function initAddItemButton() {
            $('#add-item').on('click', function(e) {
                addNewItem(e);
                initListActionButtons();
                initSorting();
            });
        }


        function initListActionButtons(){
            // Delete button
            $('.list').on('click', '.delete', function(e){
                var listItem = $(this).parents('li').remove();
                var id = listItem.data('id');
                listItem.remove();

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

                // Move ranks of other items up.
                $(items).each(function(index, item) {
                    if (item.rank > rank) {
                        item.rank--;
                    }
                });

                listObj['list'] = JSON.stringify(items);
                localStorage[currentListName] = JSON.stringify(listObj);
            }).on('click', '.save', function(e){
                var $li = $(this).closest('li');
                alert('TODO: Save id ' + $li.data('id'));
            });
        }


        function addNewItem(e){
            // Add item to list when submitting text and to localStorage.
            e.preventDefault();

            var $textarea = $('#add-item-text');
            var itemText = escape_($textarea.val());

            var listElement = $('.current-list'), listItems = $([itemText]);
            var newListItem = '<li>';
            listItems.each(function(index, listItem) {
                newListItem += '<p>' + listItem + '</p>';
                newListItem += '<textarea>' + listItem + '</textarea>';
            });
            newListItem += getActionElements() + '</li>';
            newListItem = $(newListItem);

            $textarea.focus().val('');

            // Add to localStorage.
            var newItem = addItemToLocalStorage(currentListName, [itemText]);
            newListItem.attr('data-id', newItem.id);
            newListItem.attr('data-rank', newItem.rank);
            listElement.prepend(newListItem);
            $(newListItem).hoverIntent(hoverConfig);

            $textarea.removeClass('medium small');
            textareaMultiline = false;
        }


        function addObjToList(listName, listElement, item) {
            // Takes in the DOM list and list object and adds list item to
            // given <li> element. Used in initalization.
            $(item).each(function(index, listItem) {
                var newListItem = '<li>';
                // Individual p elements.
                $(JSON.parse(listItem['items'])).each(function(index, item) {
                    newListItem += '<p>' + item + '</p>';
                    newListItem += '<textarea>' + item + '</textarea>';
                });
                newListItem += getActionElements() + '</li>';

                newListItem = $(newListItem);
                newListItem.attr('data-id', listItem['id']);
                newListItem.attr('data-rank', listItem['rank']);
                listElement.append(newListItem);
            });
            initListActionButtons();
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


        function reRankItem(listName, oldRank, newRank) {
            // Rerank a list item, shift other elements' ranks when needed.
            var list = JSON.parse(localStorage[listName])
            var listItems = JSON.parse(JSON.parse(localStorage[listName])['list']);
            var shift = -1;
            if (newRank < oldRank) {
                shift = 1;
            }

            // Rerank items in localStorage and DOM.
            $(listItems).each(function(index, element) {
                var id = parseInt(element['id'])
                var rank = parseInt(element['rank'])

                // Handle promotion.
                if (newRank < oldRank && (rank > oldRank || rank < newRank)) {
                    return;
                }
                // Handle demotion.
                if (newRank > oldRank && (rank < oldRank || rank > newRank)) {
                    return;
                }

                if (rank == oldRank) {
                    element['rank'] = newRank;
                    $('.current-list li[data-id="' + id + '"]').attr('data-rank', element['rank']);
                }
                else {
                    element['rank'] = rank + shift;
                    $('.current-list li[data-id="' + id + '"]').attr('data-rank', element['rank']);
                }
            });

            list['list'] = JSON.stringify(listItems);
            localStorage[listName] = JSON.stringify(list);
        }


        function addItemToLocalStorage(listName, listItems) {
            // Adds item to list in localStorage. Call BEFORE adding item to
            // DOM since we up the rank of every list item.
            var listObj = JSON.parse(localStorage[listName]);
            var list = JSON.parse(listObj['list']);
            newItem = {
                'id': '' + list.length,
                'items': JSON.stringify(listItems),
                'rank': '0'
            }

            // Squeeze item to top rank in localStorage and DOM.
            $(list).each(function(index, item) {
                item.rank++;
            });
            $('.current-list li').each(function(index, item) {
                var item = $(item);
                var rank = parseInt(item.attr('data-rank'));
                item.attr('data-rank', rank + 1);
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
            return '<div class="actions"><span class="delete ss-icon">delete</span><span class="save ss-icon">check</span></div>';
        }


        function fadeHeader(title, delay) {
            // Fades header in and out with a clearTimeout so multiple header
            // fades on quick list switching are cancelled.
            if (!delay) { delay = 700; }

            var header = $('h1');
            clearTimeout(headerTimeout);
            header.text(title).fadeIn();
            headerTimeout = setTimeout(function() {
                header.fadeOut();
            }, delay);
        }


        function hingeAnimation(listId) {
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
        }


        var escape_ = function(s) {
            if (s === undefined) {
                return;
            }
            return s.replace(/&/g, '&amp;').replace(/>/g, '&gt;').replace(/</g, '&lt;')
                    .replace(/'/g, '&#39;').replace(/"/g, '&#34;');
        };


        return {
            init: init
        };
    }();

    Fireshirt.init();

});
