angular.module('MinimalistApp')


.controller('MainCtrl', ['$scope', 'ItemService',
                         function($scope, ItemService) {
    // All.
    $scope.lists = ItemService.getLists();
    $scope.listIndex = ItemService.getListIndex();

    // Current.
    $scope.list = ItemService.getList(ItemService.getLastViewedListId());

    // Dictionary used to dynamically hide stuff.
    $scope.editMode = {};
    function setEditMode(listId, itemId, val) {
        if (!(listId in $scope.editMode)) {
            $scope.editMode[listId] = {};
        }
        $scope.editMode[listId][itemId] = val;
    }

    // Event handlers.
    $scope.addItem = function() {
        ItemService.addItem($scope.list.id, $scope.entry);
        $scope.entry = '';
    };
    $scope.delItem = function(item) {
        ItemService.delItem($scope.list.id, item);
    };

    $scope.showEditMode = function(e) {
        var listId = $(e.target).closest('ul').data('id');
        var $item = $(e.target).closest('li');

        setEditMode(listId, $item.data('id'), true);
        $('textarea', $item).focus();
        $item.enableSelection();
    };
    $scope.submitEdit = function(e) {
        var listId = $(e.target).closest('ul').data('id');
        var $item = $(e.target).closest('li');

        setEditMode(listId, $item.data('id'), false);
        $('textarea', $item).blur();
        // $item.disableSelection();
        // $('.list').disableSelection();

        ItemService.editItem($scope.list.id, $item.data('id'),
                             $item.find('textarea').val());
    };

    $scope.showActions = function(e) {
        if (!Modernizr.touch) {
            $(e.target).addClass('show-actions');
        }
    };
    $scope.hideActions = function(e) {
        if (!Modernizr.touch) {
            setTimeout(function() {
                $(e.target).removeClass('show-actions');
            });
        }
    };
    $scope.tapActions = _.debounce(function(e) {
        if (Modernizr.touch) {
            $target = $(e.target).closest('.item');

            // Transition.
            $target.addClass('clicked');
            setTimeout(function() {
                $target.removeClass('clicked');
            }, 400);

            $('.item').not($target).removeClass('show-actions');
            $target.toggleClass('show-actions');
        }
    });
    $scope.switchList = function(listId) {
        $scope.list = ItemService.getList(listId);
        ItemService.setLastViewedListId(listId);
    };

    $scope.prevList = function() {
        var listIndex = $scope.listIndex;
        var i = listIndex.indexOf($scope.list.id);
        if (i === 0) {
            $scope.switchList(listIndex[listIndex.length - 1]);
        } else {
            $scope.switchList(listIndex[i - 1]);
        }
    };
    $scope.nextList = function() {
        var listIndex = $scope.listIndex;
        var i = listIndex.indexOf($scope.list.id);
        if (i === listIndex.length - 1) {
            $scope.switchList(listIndex[0]);
        } else {
            $scope.switchList(listIndex[i + 1]);
        }
    };

    var clicked;
    $scope.$watch('showAddList', function(newVal) {
        $(document).mousedown(function(e) {
            clicked = $(e.target);
        });

        if (newVal) {
            setTimeout(function() {
                $('.new-list input').focus().blur(function() {
                    if (!clicked.hasClass('submit-new-list')) {
                        // Unshow new list input if click out.
                        $scope.showAddList = false;
                        $scope.$apply();
                    }
                });
            });
        }
    });
    $scope.addList = function() {
        if ($scope.newListName) {
            var listId = ItemService.addList($scope.newListName);
            $scope.switchList(listId);
            $scope.newListName = '';
            $scope.showAddList = false;
            $scope.showListSwitcher= false;
        }
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
        }).find('li').disableSelection();
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
