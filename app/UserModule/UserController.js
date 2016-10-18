angular.module('userModule').controller("UserController",userController);

userController.$inject=['$location','UserFactory'];
function userController($location,UserFactory){
	var vm=this;

	vm.auth=function(user){
		UserFactory.authUser(user).then(function(data){},function(data){});
	}

	vm.singUp=function(newUser){
		if(newUser.agree){
			UserFactory.registerUser(newUser);
		}else{
			Materialize.toast("You don't agree with our terms",1500);
		}
	}
}
