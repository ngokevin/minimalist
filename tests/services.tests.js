describe('ItemService', function(){

    var store = {};
    var ls = function() {
        return JSON.parse(store.storage);
    }

    beforeEach(function() {
        // setUp.
        module('MinimalistApp');

        // LocalStorage mock.
        spyOn(localStorage, 'getItem').andCallFake(function(key) {
            return store[key];
        });
        Object.defineProperty(sessionStorage, "setItem", { writable: true });
        spyOn(localStorage, 'setItem').andCallFake(function(key, value) {
            store[key] = value;
        });
    });

    afterEach(function () {
        store = {};
    });

    it('has an initial data structure.', function() {
        inject(function(ItemService) {
            expect(ItemService.getLists()).toEqual({
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
            });
        });
    });

    it('can add items.', function() {
        inject(function(ItemService) {
            ItemService.addItem(0, '2nd Item');
            // Text.
            expect(ls().lists[0].items[1].text).toEqual('2nd Item');
            // Item index.
            expect(ls().lists[0].itemIndex[1]).toEqual(1);
            // Auto ID.
            expect(ls().lists[0].items.autoId).toEqual(1);
        });
    });

    it('can add lists.', function() {
        inject(function(ItemService) {
            ItemService.addList('2nd List');
            // Name.
            expect(ls().lists[1].name).toEqual('2nd List');
            // List index.
            expect(ls().listIndex[1]).toEqual(1);
            // Auto ID.
            expect(ls().autoId).toEqual(1);
        });
    });

    it('can delete items.', function() {
        inject(function(ItemService) {
            ItemService.addItem(0, '2nd Item');
            ItemService.delItem(0, 0);
            // Pop item.
            expect(ls().lists[0].items[0]).toEqual(undefined);
            expect(ls().lists[0].items[1].text).toEqual('2nd Item');
            // Item index popped.
            expect(ls().lists[0].itemIndex).toEqual([1]);
            // Auto ID stays the same.
            expect(ls().lists[0].items.autoId).toEqual(1);
        });
    });

    it('can delete lists.', function() {
        inject(function(ItemService) {
            ItemService.addList('2nd List');
            ItemService.delList(0);
            // Pop list.
            expect(ls().lists[0]).toEqual(undefined);
            expect(ls().lists[1].name).toEqual('2nd List');
            // Item index popped.
            expect(ls().listIndex).toEqual([1]);
            // Auto ID stays the same.
            expect(ls().autoId).toEqual(1);
        });
    });

    it('can edit items.', function() {
        inject(function(ItemService) {
            ItemService.editItem(0, 0, 'Edited Item');
            expect(ls().lists[0].items[0].text).toEqual('Edited Item');
            expect(ls().lists[0].itemIndex).toEqual([0]);
        });
    });

    it('can rearrange items.', function() {
        inject(function(ItemService) {
            ItemService.addItem(0, '2nd Item');
            ItemService.setItemIndex(0, [1, 0]);
            expect(ls().lists[0].itemIndex).toEqual([1, 0]);
            expect(ls().lists[0].items[0].text).toEqual('First Item');
        });
    });

    it('migrate from legacy to version 0.', function() {
        store = {
            lastViewedList: 0,
            lists: ['sample'],
            sample: {
                id: 0,
                list: [
                    {
                        id: 1,
                        items: ['item1', 'item2'],
                        rank: 2
                    },
                    {
                        id: 2,
                        items: ['item3', 'item4'],
                        rank: 1
                    }
                ]
            }
        }
        inject(function(ItemService) {
            var sample = ItemService.getList(0);
            expect(sample.itemIndex.length, 2);
            expect(sample.items[0].text).toEqual('item1\nitem2');
            expect(sample.items[1].text).toEqual('item3\nitem4');
        });
    });
});
