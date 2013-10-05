angular.module('MinimalistApp', [])


.service('EntryService', function() {
    var dumps = JSON.stringify;
    var loads = JSON.parse;

    var storage = {
        lastViewedList: 'First List',
        listNames: ['First List'],
        lists: {'First List': []}
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
        get: function(listName) {
            return lists[listName];
        },
        add: function(listName, entry) {
            if (!(listName in lists)) {
                lists[listName] = [];
                storage.listNames.push(listName);
            }
            lists[listName].push(entry);
            localStorage.setItem('storage', dumps(storage));
            return lists[listName];
        },
        del: function(listName, item) {
            i = lists[listName].indexOf(item);
            lists[listName].splice(i, 1);
            localStorage.setItem('storage', dumps(storage));
            return lists[listName];
        },
        getLastViewedList: function() {
            return storage.lastViewedList;
        },
        getListNames: function() {
            return storage.listNames;
        },
        getLists: function() {
            return storage.lists;
        }
    };
});
