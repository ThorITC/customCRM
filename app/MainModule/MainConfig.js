angular.module('smApp').config(['$routeProvider',router]);
function router($routeProvider){
	$routeProvider.when('/login', {
		templateUrl: '/templates/auth-form.html',
		resolve:{
			factory:checkLogin
		},
		controller: 'UserController',
		controllerAs:'vm'
	})
	.when('/singup', {
		templateUrl: '/templates/singup-form.html',
		resolve:{
			factory:checkLogin
		},
		controller: 'UserController',
		controllerAs:'vm'
	})
	.when('/profile',{
		templateUrl:'/templates/personal-data.html',
		resolve:{
			factory:checkPath
		},
		controller:'profileController',
		controllerAs:'vm'
	})
	.when('/settings',{
		templateUrl:'/templates/settings.html',
		resolve:{
			factory:checkPath
		},
		controller:'SettingsController',
		controllerAs:'vm'
	})
	.when('/intranet',{
		templateUrl:'/templates/intra-list.html',
		resolve:{
			factory:checkPath
		},
		controller:'IntraController',
		controllerAs:'vm'
	})
	.when('/users',{
		templateUrl:'/templates/user-list.html',
		resolve:{
			factory:checkPath
		},
		controller:'userListController',
		controllerAs:'vm'
	})
	.when('/user/:id',{
		templateUrl:'/templates/user-view.html',
		resolve:{
			factory:checkPath
		},
		controller:'userViewController',
		controllerAs:'vm'
	})
	.when('/news',{
		templateUrl:'/templates/news.html',
		resolve:{
			factory:checkPath
		},
		controller:'NewsController',
		controllerAs:'vm'
	})
	.when('/article/:id',{
		templateUrl:'/templates/article.html',
		resolve:{
			factory:checkPath
		},
		controller:'NewsController',
		controllerAs:'vm'
	})
	.when('/',{
		resolve:{
			factory:checkPath_
		}
	})
	.when('/error/:code',{
		templateUrl:'/templates/errors.html',

		controller:'errorController',
		controllerAs:'vm'
	})
	.otherwise({ redirectTo: '/' });
}


checkPath_.$inject=['$q','$location','UserFactory'];
function checkPath_($q,$location,UserFactory){
	var defered=$q.defer();
	UserFactory.isLogin().then(function(data){
		if(data){
			defered.resolve(data);
			$location.path('/profile');
		}
	},function(errors){
		defered.reject();
		$location.path('/login');
	});
	return defered.promise;
}


checkPath.$injector=['$q','$location','UserFactory'];
function checkPath($q,$location,UserFactory){
	var defered = $q.defer();
	UserFactory.isLogin().then(function(data){
		if(data){
			defered.resolve(true);
		}
	},function(error){
		defered.reject();
		$location.path('/login');
	});
	return defered.promise;
}

checkLogin.$injector=['$q','$location','UserFactory'];
function checkLogin($q,$location,UserFactory){
	var defered = $q.defer();
	UserFactory.isLogin().then(function(data){
		if(data){
			defered.reject();
			$location.path('/profile');
		}
	},function(error){
		defered.resolve(true);
	});
	return defered.promise;
}
