angular.module("userModule").factory('UserFactory',UserMethod);

UserMethod.$inject=['$http','$location','$q','ipCookie','SERVER_URL','API_URL'];
function UserMethod($http,$location,$q,ipCookie,SERVER_URL,API_URL){
	var getUser=function(){
		return JSON.parse(localStorage.getItem('user'));
	}

	var calculateDaysCount=function(fromDate){
		var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds
		var firstDate = new Date(Date.now());
		var secondDate = new Date(fromDate);

		return Math.round(Math.abs((firstDate.getTime() - secondDate.getTime())/(oneDay)));
	}

	var User={
		authUser:function(accountModel){
			var defer=$q.defer(),
				  now = new Date();
			$http.post(API_URL+"/login/",accountModel).success(function(data){
				if(data.error){
					Materialize.toast(data.error,3000);
					defer.resolve(false);
				}else{
					ipCookie('token',data.token);
					if(ipCookie('last_token')==undefined){
						ipCookie('last_token',data.token);
						ipCookie.remove('timerTick');
						ipCookie.remove('time');
						ipCookie.remove('role');
					}else{
						if(ipCookie('last_token')!=data.token){
							ipCookie.remove('timerTick');
							ipCookie.remove('time');
							ipCookie.remove('role');
							ipCookie('last_token',data.token);
						}
					}
					$http.defaults.headers.common.Authorization = 'Token '+ipCookie('token');
					localStorage.setItem('userAuthDate',accountModel.remember?'remember':new Date(now.getFullYear(), now.getMonth(), now.getDate()));
					$http.get(API_URL+'/profile/').then(function(data){
							ipCookie('role',data.data.role.id);
							ipCookie('theme',data.data.theme);
							$location.path('/profile');
					})

					defer.resolve(true);
				}
			}).error(function(){
				defer.reject();
			});
			return defer.promise;
		},
		registerUser:function(userModel){
			$http.post(API_URL+'/singup/',userModel).success(function(data){
				if(data.status==true){
					$location.path('/login')
					Materialize.toast("You has been registered, now you can login",1500);
				}else{
					Materialize.toast(data.status,1500);
				}
			}).error(function(data){
				return data;
			});
		},
		logOut:function(){
			localStorage.removeItem('user');
			localStorage.removeItem('userAuthDate');
			//ipCookie.remove('timerTick');
			ipCookie.remove('token');
			//ipCookie.remove('time');
			ipCookie.remove('theme');
			//ipCookie.remove('role');
		},
		profile:function(){
			var defer=$q.defer();
			$http.get(API_URL+'/profile/').success(function(data){
				data.avatar=SERVER_URL+data.avatar;
				data.background=SERVER_URL+data.background;
				data.reg_date=calculateDaysCount(data.reg_date);
				defer.resolve(data);
			}).error(function(data){
				defer.reject();
			});
			return defer.promise;
		},
		isLogin:function(){
			var defered=$q.defer(),
				  now= new Date(),
					today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).valueOf();

			if(ipCookie('token')==='undefined'){
				defered.reject();
				return defered.promise;
			}
	 		else{
	 			if(localStorage.getItem('userAuthDate')<today-86400000){
	 				if(localStorage.getItem('userAuthDate')!='remember'){
	 					localStorage.removeItem('user');
						ipCookie.remove('token');
	 					localStorage.removeItem('userAuthDate');
	 					defered.reject();
	 					return defered.promise;
	 				}
	 			}
	 		}
	 		$http.get(API_URL+"/profile/")
            .success(function (response) {
            	if(typeof response === 'object'){
            		defered.resolve(true);
            	}else{
                defered.reject();
            	}
            })
            .error(function () {
                defered.reject();
             });
			return defered.promise;
		},
		isLoginOffline:function(){
			return !(ipCookie('token')==undefined);
		},
		isAdmin:function(){
			return ipCookie('role')===1;
		},
		saveSettings:function(settings){
			var defered=$q.defer();
			$http.post(API_URL+'/profile/',settings).then(function(data){
				console.log(data);
				if(!data.data.status){
					defered.reject();
					Materialize.toast('Error in the server-side',1500);
				}else{
					defered.resolve(data);
					Materialize.toast('All changing successful saved',1500);
				}
			},function(error){
				defered.reject();
				Materialize.toast('Unknown error',1500);
			});
			return defered.promise;
		},
		theme:function(newTheme){
			$http.post(API_URL+'/theme/',{theme:newTheme});
		},
		changePassword:function(dataParams){
			var defer=$q.defer();
			$http.post(API_URL+'/change-password/',dataParams).then(function(data){
				defer.resolve(data.data);
			},function(error){
				defer.reject();
			});
			return defer.promise;
		},
		getDepartments:function(){
			var defered=$q.defer();
			$http.get(API_URL+'/departs/').then(function(data){
				defered.resolve(data.data);
			},function(error){
				defered.reject();
			});
			return defered.promise;
		}

	};
	return User;
}
