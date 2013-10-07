angular.module('MinimalistApp')


.controller('MainCtrl', ['$scope', 'ItemService',
                         function($scope, ItemService) {

    // All.
    $scope.lists= ItemService.getLists();
    $scope.listIndex = ItemService.getListIndex();

    // Current.
    $scope.listId = ItemService.getLastViewedList();
    $scope.list = ItemService.getList($scope.listId);

    $scope.addItem = function() {
        ItemService.addItem($scope.listId, $scope.entry);
        $scope.entry = '';
    };
    $scope.delItem = function(item) {
        ItemService.delItem($scope.listId, item);
    };

    $scope.showActions= function(e) {
        $(e.target).addClass('show-actions');
    };
    $scope.hideActions= function(e) {
        $(e.target).removeClass('show-actions');
    };

}]);
