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
                    }
                },
                itemIndex: [0],
                name: 'First List',
            },
        },
        listIndex: [0],
        version: 0
    };

    if (localStorage.getItem('storage')) {
        // Load localStorage into context if exists.
        currentStorage = loads(localStorage.getItem('storage'));
        if (currentStorage.version == undefined) {
            storage = migrateFromLegacy(currentStorage);
            updateStorage();
        } else {
            storage = currentStorage;
        }
    } else {
        // Initialize localStorage if doesn't exist.
        localStorage.setItem('storage', dumps(storage));
    }
    var lists = storage.lists;

    function updateStorage() {
        localStorage.setItem('storage', dumps(storage));
    }

    function migrateFromLegacy(legacyLs) {
        // From older version of Minimalist with a different schema.
        delList(0);
        for (var i = 0; i < legacyLs.lists.length; i++) {
            var listName = legacyLs.lists[i];
            var listId = this.storage.addList(listName);

            for (var j = 0; j < legacyLs[listName].list.length; j++) {
                var item = legacyLs[listName].list[j];
                addItem(listId, item.items.join('\n'));
            }
        }
        return storage;
    }

    function addItem(listId, text) {
        // Add item.
        var list = getList(listId);
        var itemId = ++list.items.autoId;
        list.items[itemId] = {
            id: itemId,
            text: text
        };
        list.itemIndex.push(itemId);

        // Sync to localStorage.
        updateStorage();
        return list.items[itemId];
    }

    function addList(listName) {
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
    }

    function delItem(listId, itemId) {
        var list = getList(listId);
        delete list.items[itemId];
        var i = list.itemIndex.indexOf(itemId);
        list.itemIndex.splice(i, 1);
        updateStorage();
    }

    function delList(listId) {
        delete storage.lists[listId];
        var i = storage.listIndex.indexOf(listId);
        storage.listIndex.splice(i, 1);

        var switchListId = storage.listIndex[0];
        if (i > 0) {
            switchListId = storage.listIndex[i - 1];
        }
        setLastViewedListId(listId);
        updateStorage();
        return switchListId;
    }

    function editItem(listId, itemId, text) {
        getList(listId).items[itemId].text = text;
        updateStorage();
    }

    function getLastViewedListId() {
        return storage.lastViewedListId;
    }

    function getList(listId) {
        return lists[listId];
    }

    function getLists() {
        return storage.lists;
    }

    function getListIndex() {
        return storage.listIndex;
    }

    function setLastViewedListId(listId) {
        storage.lastViewedListId = listId;
        updateStorage();
    }

    function setItemIndex(listId, ids) {
        getList(listId).itemIndex = ids;
        updateStorage();
    }

    return {
        addItem: addItem,
        addList: addList,
        delItem: delItem,
        delList: delList,
        editItem: editItem,
        getLastViewedListId: getLastViewedListId,
        getList: getList,
        getLists: getLists,
        getListIndex: getListIndex,
        setLastViewedListId: setLastViewedListId,
        setItemIndex: setItemIndex
    };
});
