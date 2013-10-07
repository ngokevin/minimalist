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
            localStorage.setItem('storage', dumps(storage));
            return list;
        },

        delItem: function(listName, id) {
            var list = this.getList(listName);
            delete list.items[id];
            var i = list.itemIndex.indexOf(id);
            list.itemIndex.splice(i, 1);
            localStorage.setItem('storage', dumps(storage));
            return list;
        },

        getLastViewedList: function() {
            return storage.lastViewedList;
        },

        getList: function(listName) {
            if (!(listName in lists)) {
                // Create new list.
                lists[listName] = {
                    items: {},
                    itemIndex: [],
                    name: listName,
                };
                listIndex.push(autoId++);
            }
            return lists[listName];
        },

        getLists: function() {
            return storage.lists;
        },

        getListIndex: function() {
            return storage.listIndex;
        },
    };
});
