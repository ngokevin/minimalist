angular.module('MinimalistApp', [])


.service('ItemService', function() {
    var dumps = JSON.stringify;
    var loads = JSON.parse;

    var storage = {
        autoId: 0,
        lastViewedListId: 0,
        lists: {
            0: {
                id: 0,
                items: {
                    autoId: 0,
                    0: {
                        id: 0,
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
            var itemId = ++list.items.autoId;
            list.items[itemId] = {
                id: itemId,
                text: text
            };
            list.itemIndex.push(itemId);

            // Sync to localStorage.
            updateStorage();
            return list.items[itemId];
        },

        addList: function(listName) {
            // Create new list.
            var listId = ++storage.autoId;
            lists[listId] = {
                id: listId,
                items: {
                    autoId: -1,
                },
                itemIndex: [],
                name: listName,
            };
            storage.listIndex.push(listId);
            updateStorage();
            return listId;
        },

        delItem: function(listId, itemId) {
            var list = this.getList(listId);
            delete list.items[itemId];
            var i = list.itemIndex.indexOf(itemId);
            list.itemIndex.splice(i, 1);
            updateStorage();
        },

        delList: function(listId) {
            delete storage.lists[listId];
            var i = storage.listIndex.indexOf(listId);
            storage.listIndex.splice(i, 1);

            var switchListId = storage.listIndex[0];
            if (i > 0) {
                switchListId = storage.listIndex[i - 1];
            }
            this.setLastViewedListId(listId);
            updateStorage();
            return switchListId;
        },

        getLastViewedListId: function() {
            return storage.lastViewedListId;
        },

        getList: function(listId) {
            return lists[listId];
        },

        getLists: function() {
            return storage.lists;
        },

        getListIndex: function() {
            return storage.listIndex;
        },

        setLastViewedListId: function(listId) {
            storage.lastViewedListId = listId;
            updateStorage();
        },

        setItemIndex: function(listId, ids) {
            this.getList(listId).itemIndex = ids;
            updateStorage();
        }
    };
});
