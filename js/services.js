angular.module('MinimalistApp', [])


.service('EntryService', function() {
    var dumps = JSON.stringify;
    var loads = JSON.parse;

    var storage = {
        lastViewedList: 0,
        listNames: [],
        lists: {}
    };
    if (localStorage.getItem('storage')) {
        storage = loads(localStorage.getItem('storage'));
    } else {
        localStorage.setItem('storage', dumps(storage));
    }

    return {
        get: function(listName) {
            return storage[listName];
        },
        add: function(listName, entry) {
            storage[listName].push(entry);
            localStorage.setItem('storage', dumps(storage));
            return storage[listName];
        },
        del: function(listName, item) {
            i = storage[listName].indexOf(item);
            storage[listName].splice(i, 1);
            localStorage.setItem('storage', dumps(storage));
            return storage[listName];
        }
    };
});
