angular.module('MinimalistApp', [])


.service('EntryService', function() {
    var entries = [];
    if (localStorage.getItem('entries')) {
        entries = parse(localStorage.getItem('entries'));
    } else {
        localStorage.setItem('entries', stringify(entries));
    }

    return {
        get: function() {
            return entries;
        },
        add: function(entry) {
            var added = false;
            for (var i = 0; i < entries.length; i++) {
                // Add while maintaing order based on sleep times.
                if (entry.sleep < entries[i].sleep) {
                    entries.splice(i, 0, entry);
                    added = true;
                    break;
                }
            }
            if (!added) {
                // In case there were no entries to compare.
                entries.push(entry);
            }
            localStorage.setItem('entries', stringify(entries));
            return entries;
        },
        del: function(sleepDate) {
            for (var i = 0; i < entries.length; i++) {
                if (entries[i].sleep == sleepDate) {
                    entries.splice(i, 1);
                    break;
                }
            }
            localStorage.setItem('entries', stringify(entries));
            return entries;
        }
    };

    function parse(entries) {
        entries = $.extend(true, [], JSON.parse(entries));
        for (var i = 0; i < entries.length; i++) {
            entries[i].sleep = new Date(entries[i].sleep);
            entries[i].wake = new Date(entries[i].wake);
        }
        return entries;
    }

    function stringify(entries) {
        entries = $.extend(true, [], entries);
        for (var i = 0; i < entries.length; i++) {
            entries[i].sleep = Date.parse(entries[i].sleep);
            entries[i].wake = Date.parse(entries[i].wake);
        }
        return JSON.stringify(entries);
    }
});
