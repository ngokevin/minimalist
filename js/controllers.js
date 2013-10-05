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
}]);
