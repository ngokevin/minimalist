describe('minimalist', function() {
    var $items;
    var $textarea;
    var $submit;

    beforeEach(function() {
        browser.get('http://ngokevin.com/~ngoke/minimalist-dev');
        // element = namespace. all = grouping. by = selector.
        // TODO: element($) doesn't work very well.
        $items = element.all(by.css('.item'));
        $textarea = element(by.css('#add-item-text'));
        $submit = element(by.css('#add-item'));
    });

    it('has an initial list item', function() {
        expect($items.count()).toEqual(1);
    });

    it('add items', function() {
        addItem();
        setTimeout(function() {
            expect($items.count()).toEqual(2);
        });
    });

    function addItem() {
        $textarea.sendKeys('lol');
        $submit.click();
    }

    /*
    it('should list todos', function() {
        expect(todoList.count()).toEqual(2);
        expect(todoList.get(1).getText()).toEqual('build an angular app');
    });

    it('should add a todo', function() {
        var addTodo = element(by.model('todoText'));
        var addButton = element(by.css('[value="add"]'));

        addTodo.sendKeys('write a protractor test');
        addButton.click();

        expect(todoList.count()).toEqual(3);
        expect(todoList.get(2).getText()).toEqual('write a protractor test');
    });
    */
});
