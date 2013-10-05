angular.module('MinimalistApp')


.controller('MainCtrl', ['$scope', 'EntryService',
                         function($scope, EntryService) {

    $scope.listNames = EntryService.getListNames();
    $scope.lists= EntryService.getLists();

    $scope.listName = EntryService.getLastViewedList();
    $scope.list = EntryService.get($scope.listName);

    $scope.addEntry = function() {
        EntryService.add($scope.listName, $scope.entry);
        $scope.entry = '';
    };

    $scope.delEntry = function(entry) {
        EntryService.del($scope.listName, entry);
    };

    $scope.showActions= function(e) {
        $(e.target).addClass('show-actions');
    };
    $scope.hideActions= function(e) {
        $(e.target).removeClass('show-actions');
    };
}]);
