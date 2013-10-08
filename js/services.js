angular.module('MinimalistApp', [])


.service('ItemService', function() {
    var dumps = JSON.stringify;
    var loads = JSON.parse;

    var storage = {
        autoId: 0,
        lastViewedList: 0,
        lists: {
            0: {
                items: {
                    autoId: 0,
                    0: {
                        text: 'First Item'
                    },
                },
                itemIndex: [0],
                name: 'First List',
            }
        },
        listIndex: [0],
        version: 0
    };

    if (localStorage.getItem('storage')) {
        // Load localStorage into context if exists.
        storage = loads(localStorage.getItem('storage'));
    } else {
        // Initialize localStorage if doesn't exist.
        localStorage.setItem('storage', dumps(storage));
    }
    function updateStorage() {
        localStorage.setItem('storage', dumps(storage));
    }

    var lists = storage.lists;

    return {
        addItem: function(listId, text) {
            // Add item.
            var list = this.getList(listId);
            list.items[++list.items.autoId] = {
                text: text
            };
            list.itemIndex.push(list.items.autoId);

            // Sync to localStorage.
            updateStorage();
            return list;
        },

        delItem: function(listId, itemId) {
            var list = this.getList(listId);
            delete list.items[itemId];
            var i = list.itemIndex.indexOf(itemId);
            list.itemIndex.splice(i, 1);
            updateStorage();
            return list;
        },

        getLastViewedList: function() {
            return storage.lastViewedList;
        },

        getList: function(listId) {
            if (!(listId in lists)) {
                // Create new list.
                lists[listId] = {
                    items: {},
                    itemIndex: [],
                    name: 'New List',
                };
                listIndex.push(autoId++);
            }
            return lists[listId];
        },

        getLists: function() {
            return storage.lists;
        },

        getListIndex: function() {
            return storage.listIndex;
        },

        setItemIndex: function(listId, ids) {
            this.getList(listId).itemIndex = ids;
            updateStorage();
        }
    };
});
