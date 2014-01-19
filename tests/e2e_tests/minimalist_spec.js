describe('minimalist', function() {
    var $items;
    var $textarea;
    var $submit;

    beforeEach(function() {
        browser.get('http://minimalist.local');
        // element = namespace. all = grouping. by = selector.
        // NOTE: element($) doesn't work very well for me.
        $items = element.all(by.css('.current-list .item p'));
        $textarea = element(by.css('#add-item-text'));
        $submit = element(by.css('#add-item'));
    });

    afterEach(function() {
        browser.executeScript('localStorage.clear();');
    });

    it('has an initial list item', function() {
        expect($items.count()).toEqual(1);
    });

    it('add items', function() {
        for (var i = 1; i <= 3; i++) {
            addItem('list0-' + i);
        }
        setTimeout(function() {
            expect($items.count()).toEqual(4);
            expect($items.get(1).getText()).toEqual('list0-1');
            expect($items.get(3).getText()).toEqual('list0-3');
        });
    });

    it('delete items', function() {
        addItem('list0-1');
        addItem('list0-2');
        delItem(0);
        setTimeout(function() {
            // initial 1 + add 2 + del 1 = 2 items left.
            expect($items.count()).toEqual(2);
        });
    });

    it('add list', function() {
        addList('list1');
        addItem('list1-1');
        addItem('list1-2');
        setTimeout(function() {
            expect($items.count()).toEqual(2);
            expect($$('.list-switcher .list-switch').count()).toEqual(2);
        });
    });

    it('delete lists', function() {
        addList('list1');
        addList('list2');
        delList();
        setTimeout(function() {
            expect($$('.list-switcher .list-switch').count()).toEqual(2);
        });
    });

    it('switch lists', function() {
        addList('list1');
        addItem('list1-1');
        addItem('list1-2');
        switchList(0);
        setTimeout(function() {
            expect($items.count()).toEqual(1);
        });
    });

    it('switch prev list', function() {
        addList('list1');
        addList('list2');
        prevList();
        setTimeout(function() {
            expect($('h1').getText()).toEqual('list1');
        });
    });

    it('switch prev list', function() {
        addList('list1');
        addList('list2');
        nextList();
        setTimeout(function() {
            expect($('h1').getText()).toEqual('First List');
        });
    });

    it('edit items', function() {
        editItem(0, 'list0-0');
        setTimeout(function() {
            expect($items.get(0).getText()).toEqual('list0-0');
        });
    });

    function $$(selector) {
        // Shortcut for element group selector.
        // NOTE: can't click a whole group.
        return element.all(by.css(selector));
    }

    function $(selector) {
        // Shortcut for element single selector.
        return element(by.css(selector));
    }

    function addItem(text) {
        $textarea.sendKeys(text);
        $submit.click();
    }

    function delItem(n) {
        // Click the delete button of the nth item of the current list.
        var $deletes = $$('.list .item .delete');
        $deletes.get(n).click();
    }

    function addList(listName) {
        // NOTE: "Element is not currently visible and so may not be interacted with."
        // Must click around first to get the stuff to show.
        $('.toggle-lists').click();
        $('.list-switcher .new').click();
        $('.new-list input').sendKeys(listName);
        $('.submit-new-list').click();
    }

    function delList() {
        $('.toggle-lists').click();
        $('.list-switcher .delete').click();
    }

    function switchList(n) {
        $('.toggle-lists').click();
        $$('.list-switcher li').get(n).click();
    }

    function editItem(n, text) {
        $$('.list .item .edit').get(n).click();
        $$('.list .item textarea').get(n).clear();
        $$('.list .item textarea').get(n).sendKeys(text);
        $$('.list .item .submit-edit').get(n).click();
    }

    function prevList() {
        $('.prev-list').click();
    }

    function nextList() {
        $('.next-list').click();
    }
});
