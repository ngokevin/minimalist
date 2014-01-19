describe('minimalist', function() {
    var $items;
    var $textarea;
    var $submit;

    beforeEach(function() {
        browser.get('http://minimalist.local');
        // element = namespace. all = grouping. by = selector.
        // NOTE: element($) doesn't work very well for me.
        $items = element.all(by.css('.item p'));
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
            addItem('lol' + i);
        }
        setTimeout(function() {
            expect($items.count()).toEqual(4);
            expect($items.get(1).getText()).toEqual('lol1');
            expect($items.get(3).getText()).toEqual('lol3');
        });
    });

    it('delete items', function() {
        addItem('lol');
        addItem('lol');
        delItem(0);
        setTimeout(function() {
            // initial 1 + add 2 + del 1 = 2 items left.
            expect($items.count()).toEqual(2);
        });
    });

    it('add a list', function() {
        addList('lol list');
        setTimeout(function() {
            expect($$('.list-switcher .list-switch').count()).toEqual(2);
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
});
