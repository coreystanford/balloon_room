balloonApp.controller('roomController', ['$scope', '$http', '$stateParams', function($scope, $http, $stateParams) {

  $scope.name = $stateParams.name;

}]);