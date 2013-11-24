describe('minimalist', function() {
    var items;

    beforeEach(function() {
        browser.get('/');
        items = element.all($('.item'));  // element.by.css('item');
    });

    it('have initial list item', function() {
        expect(items.count()).toEqual(1);
    });

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
