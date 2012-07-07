$(function(){
/*
{'lists.sample':
    [
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
*/

    $('.toggle-lists').on('click', function(e){
        e.preventDefault();
        $('.lists', $(this).parent()).toggleClass('show');
    });

    function dbg(s) {
        console.log(s);
    }

    var Fireshirt = function() {
        var currentList;
        var localStorage = window.localStorage;
        var buttonPressed = false;
        var textareaMultiline = false;
        var hoverConfig = {
             over: function(){ $(this).addClass('show-actions'); }, // function = onMouseOver callback
             timeout: 400, // number = milliseconds delay before onMouseOut
             out: function(){ $(this).removeClass('show-actions'); } // function = onMouseOut callback
        };

        function init() {
            initLocalStorage();
            addItemButtons();
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

                    // Build data structure for localStorage.
                    sampleList.each(function(index, listItem) {
                        // Add <li><p>TEXT</p><p>TEXT2</p></li>.
                        listItem = $(listItem);
                        var items = [];
                        listItem.children('p').each(function(index, child) {
                            items.push(child.innerHTML);
                        });
                        newListItem = {'id': listItem.attr('data-id'), 'items': items, 'rank': listItem.attr('data-rank')};
                        listItems.push(newListItem);
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

            listItems.each(function(index) {
                var listItem = getRankedListItem(listName, index);

                newListItem = $('<li></li>');
                $(listItem['items']).each(function(index, pChild) {
                    newListItem.append($('<p>' + pChild + '</p>'));
                    $('#items-list').append(newListItem);
                });
                newListItem.data('id', listItem['id']);
                newListItem.data('rank', listItem['rank']);
                newListItem.append($(getActionElements()));
                list.append(newListItem);
            });

            $("#items-list li").hoverIntent( hoverConfig );
        }


        function getRankedListItem(listName, rank) {
            // Given a list and rank, grab the list item that has the rank.
            var listItems = $(JSON.parse(localStorage[listName]));
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
            var listItems = $(JSON.parse(localStorage[list]));
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
            localStorage[list] = JSON.stringify(listItems);
        }


        function addItemButtons() {
            $('#add-item').on('click', function(e) {
                addNewItem(e);
            });
        }


        // Add item to list when submitting text.
        function addNewItem(e){
            e.preventDefault();

            var $textarea = $('#add-item-text');
            var itemText = $textarea.val();
            var newListItem = $('<li class="new_item"><p>' + itemText + '</p>' + getActionElements() + '</li>');
            $('li.new_item').removeClass('new_item');
            $('#items-list').prepend(newListItem);
            $('li.new_item').hoverIntent(hoverConfig);
            $textarea.focus().val('');

            // Add to localStorage.
            addItemToLocalStorage(currentList, newListItem);

            $textarea.removeClass('medium small');
            textareaMultiline = false;
        }


        function getActionElements() {
            // Return div with action elements to add to list items.
            return '<div class="actions"><span class="delete ss-icon">delete</span><span class="edit ss-icon">write</span></div>';
        }


        function addItemToLocalStorage(listName, listItem) {
            // Adds item to list in localStorage.
            list = JSON.parse(localStorage[listName]);

            // Get list of <p> elements' text to add to item.
            var pChildren = [];
            var children = listItem.children('p');
            children.each(function(index, child) {
                pChildren.push(child.innerHTML);
            });

            newItem = {
                'id': '' + list.length,
                'items': pChildren,
                'rank': '' + list.length // TODO: push to top of rank
            }
            list.unshift(newItem);
            localStorage[listName] = JSON.stringify(list);
            return newItem;
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
                if( !buttonPressed ) $('.items').removeClass('focus-mode');
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
                $('.items').addClass('focus-mode');
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


        function initItemsListSorting() {
            var oldRank = null;
            $(".items_list").sortable({
                placeholder: 'ui-state-highlight',
                change: function(event, ui) {
                    oldRank = ui.item.data('rank');
                },
                update: function(event, ui) {
                    // Get position in link as new rank.
                    var id = ui.item.data('id');
                    var list = $('#items-list li');
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
                    // reRankItem(currentList, parseInt(oldRank), parseInt(newRank));
                },
                placeholder: 'ui-state-highlight'
            });
            $( ".items_list" ).disableSelection();
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

        return {
            init: init
        };
    }();
    Fireshirt.init();

});
