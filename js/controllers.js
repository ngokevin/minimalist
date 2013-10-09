angular.module('MinimalistApp')


.controller('MainCtrl', ['$scope', 'ItemService',
                         function($scope, ItemService) {
    // All.
    $scope.lists = ItemService.getLists();
    $scope.listIndex = ItemService.getListIndex();

    // Current.
    $scope.list = ItemService.getList(ItemService.getLastViewedListId());

    // Event handlers.
    $scope.addItem = function() {
        ItemService.addItem($scope.list.id, $scope.entry);
        $scope.entry = '';
    };
    $scope.delItem = function(item) {
        ItemService.delItem($scope.list.id, item);
    };

    $scope.showActions = function(e) {
        $(e.target).addClass('show-actions');
    };
    $scope.hideActions = function(e) {
        setTimeout(function() {
            $(e.target).removeClass('show-actions');
        });
    };

    $scope.toggleListSwitcher = function(e) {
        $('.list-switcher').toggleClass('show');
    };
    $scope.switchList = function(listId) {
        $scope.list = ItemService.getList(listId);
        ItemService.setLastViewedListId(listId);
    };

    $scope.$watch('showAddList', function(newVal) {
        console.log(newVal);
        if (newVal) {
            setTimeout(function() {
                $('.new-list input').focus();
            });
        }
    });
    $scope.addList = function() {
        if ($scope.newListName) {
            var listId = ItemService.addList($scope.newListName);
            $scope.switchList(listId);
        }
        $scope.showAddList = false;
        $scope.newListName = '';
    };
    $scope.delList = function(listId) {
        var switchListId = ItemService.delList(listId || $scope.list.id);
        $scope.switchList(switchListId);
    };

    // Sorting.
    setTimeout(function() {
        $('.list').sortable({
            placeholder: 'ui-state-highlight',
            update: function() {
                var ids = [];
                $('.current-list li').each(function(i, item) {
                    ids.push($(item).data('id'));
                });
                ItemService.setItemIndex($scope.list.id, ids);
            }
        }).disableSelection();
    });

    // Header.
    var fadeHeader = new FadeHeader();
    $scope.$watch('list', function(newList) {
        if ($scope.listIndex.length === 0) {
            return;
        } else if (newList) {
            fadeHeader(newList.listName);
        } else {
            fadeHeader();
        }
    });
}]);


function FadeHeader() {
    // Fades header in and out with a clearTimeout so multiple header
    // fades on quick list switching are cancelled.
    var headerTimeout;

    return function(delay) {
        var header = $('.list-title');
        clearTimeout(headerTimeout);
        header.fadeIn();
        headerTimeout = setTimeout(function() {
            header.fadeOut('slow');
        }, delay || 300);
    };
}
