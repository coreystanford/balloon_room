balloonApp.controller('homeController', ['$scope', '$http', function($scope, $http) {

	$scope.link = false;

	$scope.openModal = function(){
		$scope.link = true;
	}

	$scope.closeModal = function(){
		$scope.link = false;
	}




}]);