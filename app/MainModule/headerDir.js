angular.module('smApp').directive('headerDir', headerDirective);

function headerDirective(){
	var directive = {
		restrict:'E',
		templateUrl:'/dirs/headerDir.html',
		controller:headerController,
		controllerAs:'vm',
		bindToController:true,
	};
	return directive;
}

headerController.$inject=['UserFactory','$location','ipCookie'];

function headerController(UserFactory,$location,ipCookie){
	var vm=this;

	vm.init=function(){
		vm.theme();
		vm.isAuth();
		vm.isAdmin();
	}

	vm.theme=function(){
		return ipCookie('theme');
	}

	vm.isAuth=function(){
		return UserFactory.isLoginOffline();
	}

	vm.logout=function(){
		UserFactory.logOut();
		$location.path('/login');
		vm.theme();
	}

	vm.isAdmin=function(){
		return UserFactory.isAdmin();
	}

}
