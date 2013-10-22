'use strict';

describe('ItemService', function(){
    var scope;  // We'll use this scope in our tests.

    // Mock Application to inject our own dependencies.
    beforeEach(angular.mock.module('MinimalistApp'));

    // Mock the controller also, include $rootScope and $controller.
    beforeEach(angular.mock.inject(function($rootScope, $controller) {
        // Create empty scope.
        scope = $rootScope.$new();

        // Declare the controller and inject our empty scope.
        $controller('MinimalistCtrl', {$scope: scope});
    });

    // Tests start here.
});
