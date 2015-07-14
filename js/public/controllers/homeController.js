balloonApp.controller('homeController', ['$scope', '$http', function($scope, $http) {

	$scope.input = true;

	$scope.openModal = function(){
		$scope.input = false;
	}

	$scope.closeModal = function(){
		$scope.input = true;
	}

}]);