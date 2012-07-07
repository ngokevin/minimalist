$(document).ready(function() {

    function dbg(s) {
        console.log(s);
    }

    var Fireshirt = function() {
        var currentList;
        var localStorage = window.localStorage;


        function init() {
            initLocalStorage();
            addItemButton();
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
                currentList = getListName('sample');
                if (!localStorage[currentList]) {
                    var listItems = [];
                    var sampleList = $('#items-list li');
                    sampleList.each(function(index, listItem) {
                        // Add <li><p>TEXT</p><p>TEXT2</p></li>.
                        var pChildren = []
                        var children = $(listItem).children();
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


        function getListName(list) {
            return 'lists.' + list;
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
                });
                list.append(newListItem);
            });
        }


        function addItemButton() {
            // Add item to list when submitting text.
            var addButton = $('#add-item');
            addButton.click(function(e) {
                e.preventDefault();
                var itemText = $('#add-item-text').val();
                var newListItem = $('<li><p>' + itemText + '</p></li>')
                $('#items-list').prepend(newListItem);

                // Add to localStorage.
                addItemToList(currentList, newListItem);
            });
        }


        function addItemToList(listName, listItem) {
            // Adds item to list in localStorage.
            list = JSON.parse(localStorage[listName]);
            var pChildren = []
            var children = listItem.children();
            children.each(function(index, child) {
                pChildren.push(child.innerHTML);
            });
            list.unshift(pChildren);
            localStorage[listName] = JSON.stringify(list);
        }


        return {
            init: init
        }
    }();
    Fireshirt.init()

});
