balloonApp.config(['$stateProvider', '$urlRouterProvider', '$locationProvider', function($stateProvider, $urlRouterProvider, $locationProvider) {

    $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'views/home.html',
          controller: 'homeController'
        })
        .state('room', {
          url: '/:name',
          templateUrl: 'views/balloon_room.html',
          controller: 'roomController'
        });

    // Default route
    $urlRouterProvider.otherwise('/');

}]);