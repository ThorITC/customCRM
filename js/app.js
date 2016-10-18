angular.module('news', []);

angular.module('news').factory('NewsFactory', newsFact);

newsFact.$inject = ['$http', 'API_URL', '$q'];
function newsFact($http, API_URL, $q){
  var factoryObject = {
    getNews: _getNewsList,
    getArticle: _getArticle
  };

  function _getNewsList(){
    var defer = $q.defer();
    $http.get(API_URL + '/news/').then(function(data){
      defer.resolve(data);
    },function(error){
      defer.reject();
    });
    return defer.promise;
  }

  function _getArticle(id){
    var defer = $q.defer();
    $http.get(API_URL + '/news/', {params: {id: id}}).then(function(data){
      defer.resolve(data);
    }, function(error){
      defer.reject();
    });
    return defer.promise;
  }

  function _addArticle(articleObject){
    var defer = $q.defer();
    $http.post(API_URL + '/news/', {}).then(function(data){
      defer.resolve(data.data);
    }, function(error){
      defer.reject();
    });
    return defer.promise;
  }

  return factoryObject;
}

angular.module('news').controller('NewsController', newsCtrl);

newsCtrl.$inject = ['NewsFactory'];
function newsCtrl(NewsFactory){
  var vm = this;

  vm.init = _init;
  vm.articles = null;

  function _init(){
    NewsFactory.getNews().then(function(data){
      vm.articles = data.data;
    });
  };
}

angular.module("smApp",['userModule','IntranetModule','auto-complete','ngRoute','720kb.tooltips','ui.materialize','ipCookie','ngImgCrop','angularFileUpload','angular-clipboard'/*, 'news'*/]);
angular.module('smApp').constant('SERVER_URL','http://crm-sm.pixodo.org/');
angular.module('smApp').constant('API_URL','http://crm-sm.pixodo.org');
//angular.module('smApp').constant('SERVER_URL','http://server.smcrm.loc/');
//angular.module('smApp').constant('API_URL','http://server.smcrm.loc');
angular.module('smApp').run(function($http,ipCookie){
  if(ipCookie('token')){
    $http.defaults.headers.common.Authorization = 'Token '+ipCookie('token');
  }
});

angular.module('smApp').factory('favicoFactory', favicoFact);

function favicoFact(){
  var src = {
    checkIn: 'images/checkIn.png',
    checkOut: 'images/checkOut.png',
    app: 'images/app.png'
  }
  var favicoObject = {
    changeIcon: _changeIcon
  };

  function _changeIcon(key){
    var icon = src[key] ? src[key] : src['app'];
    document.head || (document.head = document.getElementsByTagName('head')[0]);
    var link = document.createElement('link'),
    oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = icon;
    if (oldLink) {
      document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
  }

  return favicoObject;
}

angular.module('userModule',[]);

angular.module("userModule").factory('AccessFactory',accessFactory);

accessFactory.$inject=['$http','$q','API_URL','cryptFactory'];
function accessFactory($http,$q,API_URL,cryptFactory){
  var groupPassList=function(passwords,type){
    var resultArray=[];
    var putToArray=function(item){
      for(var i=0;i<resultArray.length;i++){
        if(type=='private'){
          if(resultArray[i].group===item.group){
            resultArray[i].items.push(item);
            return;
          }
        }
        else {
          if(resultArray[i].group===item.access.group){
            resultArray[i].items.push(item);
            return;
          }
        }

      }
      resultArray[resultArray.length-1].items.push(item);
    }
    var currentGroup='';
    for(var i=0;i<passwords.length;i++){
      if(currentGroup!=passwords[i].group){
        if(type=='private'){
          currentGroup=passwords[i].group;
        }
        else {
          currentGroup=passwords[i].access.group;
        }
        resultArray.push({group:currentGroup,items:[]});
      }
    }
    resultArray.push({group:'Others',items:[]});
    for(var i=0;i<passwords.length;i++){
      putToArray(passwords[i]);
    }
    var newArray=[];
    for(var i=0;i<resultArray.length;i++){
      if(resultArray[i].items.length!=0)
        newArray.push(resultArray[i]);
    }
    return newArray;
  };

  return {
    addAccess:function(accessObj){
      var defered=$q.defer();
      accessObj.password=cryptFactory.encrypt(accessObj.password,accessObj.username,accessObj.url);
      $http.post(API_URL+'/access/',accessObj).then(function(data){
        defered.resolve(data.data);
      },function(data){
        defered.reject();
      });
      return defered.promise;
    },
    getAccesses:function(type){
      var defered=$q.defer();
      $http.get(API_URL+'/access/',{params:{type:type}}).then(function(data){
        if(type=='public'){
          var objects=data.data;
          for(var i=0;i<objects.length;i++){
            objects[i].access.password=cryptFactory.decrypt(objects[i].access.password,objects[i].access.username,objects[i].access.url);
          }
          defered.resolve(groupPassList(objects,type));
          return;
        }
        var objects=data.data;
        for(var i=0;i<objects.length;i++){
          objects[i].password=cryptFactory.decrypt(objects[i].password,objects[i].username,objects[i].url);
        }
        defered.resolve(groupPassList(objects,type));
      },function(error){
        defered.reject();
      });
      return defered.promise;
    },
    deleteAccess:function(id){
      var defered=$q.defer();
      $http.delete(API_URL+'/access/',{params:{id:id}}).then(function(data){
        defered.resolve(data.data);
      },function(error){
        defered.reject();
      });
      return defered.promise;
    },
    editAccess:function(data){
      var defered=$q.defer();
      if(data.password!=''){
        data.password=cryptFactory.encrypt(data.password,data.username,data.url);
      }
      $http.put(API_URL+'/access/',data).then(function(data){
        defered.resolve(data.data);
      },function(error){
        defered.reject();
      });
      return defered.promise;
    },
    shareAccess:function(data,id){
      var defered=$q.defer();
      $http.post(API_URL+'/share/',{accesses:data,employeeId:id}).then(function(data){
        defered.resolve(data);
      },function(error){
        defered.reject();
      });
      return defered.promise;
    },
    getEmails:function(){
      var defered=$q.defer();
      $http.get(API_URL+'/emails/').then(function(data){
        defered.resolve(data.data);
      },function(data){
        defered.reject();
      });
      return defered.promise;
    }
  };
};

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

angular.module('userModule').controller('userViewController',userViewController);

userViewController.$inject=['$routeParams','userListService','SERVER_URL','IntraFactory'];
function userViewController($routeParams,userListService,SERVER_URL,IntraFactory){
  var vm=this;
  vm.user=null;
  vm.filter='Day';
  var currentTime = new Date();
  vm.currentTime = currentTime;
  vm.month = ['Januar', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  vm.monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  vm.weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  vm.events=[];
  vm.weekdaysLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  vm.disable = [false, 1];
  vm.today = 'Today';
  vm.clear = 'Clear';
  vm.close = 'Close';

  vm.init=function(){
    userListService.getUser($routeParams.id).then(function(data){
      vm.user=data.profile;
      vm.user.avatar=SERVER_URL+vm.user.avatar;
      if(vm.user.position==null){
        vm.user.position={
          position_name:null
        };
      }
      vm.getEvents();
    });
  }

  vm.getEvents=function(){
    IntraFactory.combineEvents(vm.currentTime,vm.filter,$routeParams.id).then(function(data){
      vm.events=data;
    });
  }

  vm.showField=function(field){
    try {
      return vm.user[field]!=null;
    } catch (e) {
      return false;
    }
  }

  vm.changeFilter=function(filter){
    vm.filter=filter;
    vm.getEvents();
  }

  vm.save=function(){
    userListService.saveUserChanges(vm.user).then(function(data){
      Materialize.toast('All changes success saved',1500);
    });
  }
}

angular.module('smApp').controller('errorController',errorController);

errorController.$inject=['$routeParams'];
function errorController($routeParams){
  var vm=this;
  vm.errorInfo={
  };

  vm.init=function(){
    console.log($routeParams.code);
    switch($routeParams.code){
      case '403':{
        vm.errorInfo={
          code:403,
          message:'Forbidden'
        }
      }break;
      default:{vm.errorInfo={
        code:404,
        message:'Not found'
      };}break;
    }
    console.log(vm.errorInfo);
  };
}

angular.module('smApp').directive('compareTo',compareTo);

function compareTo(){
  return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {

            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };

            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
};

angular.module('smApp').controller('mainController',mainCtrl);

mainCtrl.$inject=['$scope']
function mainCtrl($scope){
  var mcv=this;

  mcv.init=function(){
  }
  
  $scope.$on('$locationChangeStart', function(event) {
    angular.element(document.querySelector('body')).removeClass('loaded');
  });
  $scope.$on('$viewContentLoaded', function(){
    angular.element(document.querySelector('body')).addClass('loaded');
  });
}

angular.module('smApp').factory('cryptFactory',cryptFactory);

cryptFactory.$inject=[];
function cryptFactory(){


  var cryptObj={
    encrypt:function(data,key,iv){
      key=key+key.length*key.length;
      var encrypted = CryptoJS.AES.encrypt(
        data,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      return encrypted.toString();
    },
    decrypt:function(data,key,iv){
      key=key+key.length*key.length;
      var decrypted = CryptoJS.AES.decrypt(
        data,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      return decrypted.toString(CryptoJS.enc.Utf8);
    }
  };
  return cryptObj;
}

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

angular.module('userModule').controller('profileController',profileCtrl);

profileCtrl.$inject=['ipCookie','AccessFactory','UserFactory'/*, 'NewsFactory'*/];
function profileCtrl(ipCookie,AccessFactory,UserFactory/*, NewsFactory*/){
  var vm=this;
  var colors={
    pink:'#E91E63',
    indigo:'#3F51B5',
    'light-green':'#8BC34A',
    amber:'#FFC107',
    'blue-grey':'#607D8B',
    cyan:'#00BCD4'
  };

  var shadowColors={
    pink:'#F48FB1',
    indigo:'#9FA8DA',
    'light-green':'#C5E1A5',
    amber:'#FFE082',
    'blue-grey':'#B0BEC5',
    cyan:'#80DEEA'
  };
  vm.showShare=true;
  vm.newAccess={};
  vm.profileData={};
  vm.privatePasswords=[];
  vm.accessToEdit={};
  vm.publicPasswords=[];
  vm.shareAccess=[];
  vm.sharedId=null;
  vm.names =[];
  vm.articles = null;

  vm.init=function(){
    angular.element(document.querySelector('head')).append("<style>.indicator{background:"+colors[ipCookie('theme')]+" !important;}.switch label input[type=checkbox]:checked + .lever{background:"+shadowColors[ipCookie('theme')]+" !important;}.switch label input[type=checkbox]:checked + .lever:after{background-color:"+colors[ipCookie('theme')]+" !important;}[type='checkbox'].filled-in:checked + label:after {border: 2px solid "+colors[ipCookie('theme')]+" !important;background-color: "+colors[ipCookie('theme')]+" !important;}</style>");
    UserFactory.profile().then(function(data){
			vm.profileData=data;
		});
    vm.names=AccessFactory.getEmails();
    vm.getAccesses('private');
    vm.getAccesses('public');
    /*NewsFactory.getNews().then(function(data){
      vm.articles = data.data.splice(0, data.data.length > 4 ? 4 : data.data.length);
    });*/
  };

  vm.getAccesses=function(type){
    if(type==='private')
      vm.privatePasswords=[];
    else{
      vm.publicPasswords=[];
    }
    AccessFactory.getAccesses(type).then(function(data){
        if(type==='private')
          vm.privatePasswords=data;
        else{
          vm.publicPasswords=data;

        }
    });
  }

  vm.addNewAccess=function(){
    AccessFactory.addAccess(vm.newAccess).then(function(data){
      if(data.status){
        Materialize.toast('Access added',1500);
        vm.newAccess=null;
        vm.getAccesses('private');
      }
    });
  }

  vm.getFieldFromDataModel=function(field){
		return vm.profileData[field];
	}

	vm.showField=function(filedName){
		return vm.profileData[filedName]!=null;
	}

  vm.deleteAccess=function(id){
    swal({
      title: "Are you sure?",
      text: "Do you want delete this access?",
      type: "warning",   showCancelButton: true,
    confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, delete it!",
     closeOnConfirm: false },
    function(){   AccessFactory.deleteAccess(id).then(function(data){
      if(data.status){
        swal("Deleted!", "Access has been deleted.", "success");
        vm.getAccesses('private');
      }
    });
  });

  }

  vm.editAccess=function(access){
    vm.accessToEdit=access;
    vm.accessToEdit.password='';
  }

  vm.saveEdited=function(){
    AccessFactory.editAccess(vm.accessToEdit).then(function(data){
      if(data.status){
        vm.getAccesses('private');
      }
    })
  }

  vm.getColor=function(){
    return shadowColors[ipCookie('theme')];
  }

  vm.getMainColor=function(){
    return colors[ipCookie('theme')];
  }

  vm.activeTab=function(tab){
    if(tab==='add'){
      vm.showShare=false;
    }else{
      vm.showShare=true;
    }
  }

  vm.ShowShareField=function(){
    if(vm.shareAccess.length===0){
      return false;
    }else{
      return vm.showShare;
    }
  }

  vm.addAccessToShareArray=function(access){
    var rebuildArray=function(item){
      var resultArray=[];
      for(var i=0;i<vm.shareAccess.length;i++){
        if(vm.shareAccess[i]!==item){
          resultArray.push(vm.shareAccess[i]);
        }
      }
      return resultArray;
    }
    if(vm.shareAccess.indexOf(access)===-1){
      vm.shareAccess.push(access);
    }else{
        vm.shareAccess=rebuildArray(access);
    }
  }

  vm.inShareAccessArray=function(access){
    return !(vm.shareAccess.indexOf(access)===-1);
  }

  vm.shareAccessMethod=function(){
    AccessFactory.shareAccess(vm.shareAccess,vm.sharedId).then(function(data){
      if(data.status){
        Materialize.toast('Success shared',1500);
        vm.shareAccess=[];
        vm.sharedId=null;
      }
    });
  }
}

angular.module('smApp').directive('themer',dirFunc);
angular.module('smApp').directive('themeButton',includeFunc);

dirFunc.$inject=['ipCookie'];
function dirFunc(ipCookie){
  var linkFunction = function(scope, element,attributes) {
    element.addClass(ipCookie('theme')+(scope.textTheme?'-text':'')+' '+scope.otherClass);
  };

  return {
    restrict:'C',
    scope:{
      otherClass:'@otherClass',
      textTheme:'@textTheme',
    },
    link:linkFunction,
  }
}

includeFunc.$inject=['ipCookie'];
function includeFunc(ipCookie){
  var linkFunction=function(scope,element,attributes){
    element.addClass(ipCookie('theme')+' waves-effect waves-light btn');
  };

  return {
    restrict:'C',
    link:linkFunction
  }
}

angular.module('userModule').directive('passwordInput',passwordDirective);

passwordDirective.$inject=[];
function passwordDirective(){
  var elementLink=function(scope,element,attribute){
    element.find('#password-input-id').val(scope.bindData);
  }
  return {
    replace:true,
    restrict:'E',
    scope:{
      bindData:"="
    },
    //require: 'ngModel',
    link:elementLink,
    controller:passwordDirectiveController,
    controllerAs:'vm',
    templateUrl:'/dirs/passwordDir.html',
  }
}

passwordDirectiveController.$inject=['$scope','clipboard'];
function passwordDirectiveController($scope,clipboard){
  var vm=this;
  vm.attribute='password';

  vm.passwordVisabiliti=function(){
    switch(vm.attribute){
      case 'password':vm.attribute='text';
        break;
      case 'text':vm.attribute='password';
        break;
    }
  }

  vm.clipboardCopy=function(){
    clipboard.copyText($scope.bindData);
    Materialize.toast('Password copied',1500);
  }
}

angular.module('userModule').service('userListService',userList);

userList.$inject=['$http','$q','$location','API_URL','SERVER_URL'];
function userList($http,$q,$location,API_URL,SERVER_URL){
  var userListObject={
    getUsers:function(depart){
      var defered=$q.defer();
      $http.get(API_URL+'/users/',{params:{department:depart}}).then(function(data){
        if(data.data.status===false&data.data.code===403){
          $location.path('/error/403');
          return;
        }

        for(var i=0;i<data.data.length;i++){
          data.data[i].avatar=SERVER_URL+data.data[i].avatar;
          data.data[i].background=SERVER_URL+data.data[i].background;
        }
        defered.resolve(data.data);
      },function(error){
        defered.reject();
      });
      return defered.promise;
    },
    getUser:function(id,data,filter){
      if(!data){
        date=new Date(Date.now());
      }
      if(!filter){
        filter='Day';
      }
      var defered=$q.defer();
      $http.get(API_URL+'/user/',{params:{id:id,filter:filter,year:date.getFullYear(),month:date.getMonth()+1,day:date.getDate()}}).then(function(data){
        if(data.data.status===false&data.data.code===403){
          $location.path('/error/403');
          return;
        }
        defered.resolve(data.data);
      },function(error){
        defered.reject();
      });
      return defered.promise;
    },
    saveUserChanges:function(user){
      var defered=$q.defer();
      $http.put(API_URL+'/user/',{id:user.id,position:user.position.position_name}).then(function(data){
        if(data.data.status){
          defered.resolve(data.data);
        }else{
          defered.reject();
        }
      },function(data){
        defered.reject();
      });
      return defered.promise;
    },
    changeActive:function(id){
      $http.put(API_URL+'/users/',{type:'active',id:id});
    }
  };

  return userListObject;
};

angular.module('userModule').controller('userListController',userListController);

userListController.$inject=['userListService','ipCookie','$timeout'];
function userListController(userListService,ipCookie,$timeout){
  var vm=this;
  vm.users=[];
  vm.query='';
  vm.departments=['All','DEV','SEO'];
  vm.choosenDepartment='All';

  vm.init=function(){
    vm.getUsers('All');
  }

  vm.getUsers=function(depart){
    userListService.getUsers(depart).then(function(data){
      vm.users=data;
    });
  }

  vm.setDepart=function(depart){
    vm.choosenDepartment=depart;
    vm.getUsers(depart);
  }

  vm.getColor=function(){
    return ipCookie('theme');
  }

  vm.changeUserActivation=function(id){
    userListService.changeActive(id);
  }
}

angular.module('userModule').controller('SettingsController',setCtrl);

setCtrl.$inject=['$scope','UserFactory','ipCookie','FileUploader','API_URL'];
function setCtrl($scope,UserFactory,ipCookie,FileUploader,API_URL){
  var vm=this;
  var currentTheme=null;
  vm.departments=[];
  vm.settings={};
  vm.passwords={};
  vm.maxDate = (new Date(2000,12,31)).toISOString(); 
  $scope.avatar={myImage:'',myCroppedImage:'',imageEdit:false};
  $scope.background={myImage:'',myCroppedImage:'',imageEdit:false};
  var avatarUploader = vm.avatarUploader = new FileUploader({
        url: API_URL+'/loadavatar/',
        autoUpload: false
    });
  var backgroundUploader = vm.backgroundUploader = new FileUploader({
        url: API_URL+'/loadbackground/',
        autoUpload: false
    });

  vm.avatarUploader.onBeforeUploadItem = function (fileItem) {
    fileItem.headers = {
      Authorization: 'Token '+ipCookie('token')
    };
  }
  vm.avatarUploader.onCompleteItem = function(fileItem, response, status, headers) {
        vm.init();
    };

  vm.backgroundUploader.onBeforeUploadItem = function (fileItem) {
    fileItem.headers = {
      Authorization: 'Token '+ipCookie('token')
    };
  }
  vm.backgroundUploader.onCompleteItem = function(fileItem, response, status, headers) {
        vm.init();
    };

  vm.init=function(){
    UserFactory.profile().then(function(data){
      vm.settings=data;
      console.log(data);

    });
    UserFactory.getDepartments().then(function(data){
      vm.departments=data.deps;
    });
    currentTheme=ipCookie('theme');
    vm.passwords.newPassword='';
    vm.passwords.reapetPassword='';
  }

  vm.setDepartment=function(dep_id){
    console.log(dep_id);
    vm.settings.department.id=dep_id;
  }

  vm.save=function(){
    if(vm.settings.dob){
      var splitDate=vm.settings.dob.toString().split('/');
      if(splitDate.length>2){
        vm.settings.dob=new Date(splitDate[2],splitDate[1]-1,splitDate[0]);
      }
    }

    UserFactory.saveSettings(vm.settings).then(function(data){
      if(data.status){
        $scope.avatar.imageEdit=false;
      }
    });
    currentTheme=ipCookie('theme');
    if($scope.avatar.imageEdit){
      var file = base64ToBlob($scope.avatar.myCroppedImage.replace('data:image/png;base64,',''), 'image/jpeg');
      avatarUploader.addToQueue(file);
      avatarUploader.uploadAll();
    }
    if($scope.background.imageEdit){
      var imgData=$scope.background.myCroppedImage;
      imgData=imgData.replace(imgData.substring(0,imgData.indexOf(';base64,')+8),'');
      var file = base64ToBlob(imgData, 'image/jpeg');
      backgroundUploader.addToQueue(file);
      backgroundUploader.uploadAll();
    }
  }

  vm.theme=function(theme){
    ipCookie('theme',theme);
    vm.settings.theme=theme;
    UserFactory.theme(theme);
  }

  vm.changePassword=function(){
    UserFactory.changePassword(vm.passwords).then(function(data){
      if(data.status){
        angular.element(document.querySelector('#changePasswordModal')).closeModal();
        Materialize.toast('Success changing!',1500)
        return;
      }
      switch(data.code){
        case 3:
          {
            vm.passwords.currentPassword='';
          };
          break;
        case 2:
          {
            vm.passwords.newPassword='';
            vm.passwords.reapetPassword='';
          }
      }
      Materialize.toast(data.message,1500);
    });

  }

  var avatarHandleFileSelect=function(evt) {
    var file=evt.currentTarget.files[0];
    var reader = new FileReader();
    reader.onload = function (evt) {
      $scope.$apply(function($scope){
        $scope.avatar.imageEdit=true;
        $scope.avatar.myImage=evt.target.result;
      });
    };
    reader.readAsDataURL(file);
  };

  var backgroundHandleFileSelect=function(evt) {
    var file=evt.currentTarget.files[0];
    var reader = new FileReader();
    reader.onload = function (evt) {
      $scope.$apply(function($scope){
        $scope.background.imageEdit=true;
        $scope.background.myCroppedImage=evt.target.result;
      });
    };
    reader.readAsDataURL(file);
  };

  var base64ToBlob=function(base64Data, contentType) {
        contentType = contentType || '';
        var sliceSize = 1024;
        var byteCharacters = atob(base64Data);
        var bytesLength = byteCharacters.length;
        var slicesCount = Math.ceil(bytesLength / sliceSize);
        var byteArrays = new Array(slicesCount);
         for (var sliceIndex = 0;sliceIndex <slicesCount;++sliceIndex) {
            var begin = sliceIndex * sliceSize;
            var end = Math.min(begin + sliceSize, bytesLength);
            var bytes = new Array(end - begin);
            for (var offset = begin, i = 0 ;offset < end;++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, {type: contentType });
    };

  angular.element(document.querySelector('#avatarInput')).on('change',avatarHandleFileSelect);
  angular.element(document.querySelector('#backgroundInput')).on('change',backgroundHandleFileSelect);
}

angular.module('IntranetModule',[]);

angular.module('IntranetModule').factory('IntraFactory',IntranetFactory);

IntranetFactory.$inject=['$http','$q','UserFactory','API_URL'];
function IntranetFactory($http,$q,UserFactory,API_URL){
  var weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var calculateTime=function(dateArray){
    var resSumm=0,
        tempEvent=null;
    for(var i=0;i<dateArray.length;i++){
      if(dateArray[i].event_type.id==1){
        tempEvent=dateArray[i];
      }else{
        if(tempEvent==null)
          continue;
        resSumm+=(new Date(dateArray[i].create_date)) - (new Date(tempEvent.create_date));
        dateArray[i].tickedTime=resSumm;
      }
    }
    return dateArray;
  };
  var createWeek=function(dataArray){
    var events=[];
    var tempEvent=null,
        dayIter=-1,
        dayHours=0,
        tempDate=null;
    function propRefresh(date){
      dayIter++;
      events[dayIter]={};
      events[dayIter].dayName=weekdaysFull[date.getDay()];
      events[dayIter].date=date;
      tempDate=date;
    }
    for(var i=0;i<dataArray.length;i++){
      var date=new Date(dataArray[i].create_date);
      if(tempDate==null){
        propRefresh(date);
      }
      if(date.getDate()!=tempDate.getDate()){
        if(dayIter>=0){
          events[dayIter].hours=dayHours;
          dayHours=0;
        }
        propRefresh(date);
      }
      if(dataArray[i].event_type.id==1){
        tempEvent=dataArray[i];
      }else{
        dayHours+=(new Date(dataArray[i].create_date)) - (new Date(tempEvent.create_date));
      }
      if(events[dayIter].events===undefined){
        events[dayIter].events=[];
      }
      events[dayIter].events.push(dataArray[i]);
      if(i==dataArray.length-1)
        events[dayIter].hours=dayHours;
    }
    for(var i=0;i<events.length;i++){
      events[i].events=calculateTime(events[i].events);
    }
    return events;
  };
  var IntraNetObject={
    checkIn:function(){
      var defered=$q.defer();
      $http.post(API_URL+'/event/',{event_type_id:1}).then(function(data){
        defered.resolve(data.data);
      },function(data){
        defered.reject();
      });
      return defered.promise;
    },
    checkOut:function(comment){
      var defered=$q.defer();
      $http.post(API_URL+'/event/',{event_type_id:2,comment:comment}).then(function(data){
        defered.resolve(data.data);
        if(data.data.code!=3){
          swal({
            title: "CheckOut!",
            text: "Why you checkOut?",
            type: "input",
            showCancelButton: !true,
            closeOnConfirm: false,
            animation: "slide-from-top",
          },
           function(inputValue){
             if (inputValue === false)
               return false;
             if (inputValue === "") {
               swal.showInputError("You need to write something!");
               return false
             }
             $http.put(API_URL+'/event/',{comment:inputValue,id:data.data.id}).then(function(data){
               swal("Nice!", "You checkOut from CRM", "success");
             });
           });
       }
     },function(error){
       defered.reject();
     });
     return defered.promise;
    },
    getEvents:function(year,month,day,filter,id){
      var defer=$q.defer();
      $http.get(API_URL+'/event/',{params:{year:year,month:month,day:day,filter:filter,id:(id===undefined?0:id)}}).then(function(data){
        defer.resolve(data);
      },function(error){
        defer.reject();
      })
      return defer.promise;
    },
    getEventsStatistic:function(id){
      if(id===undefined){
        id='my';
      }
      var defer=$q.defer();
      $http.get(API_URL+'/event-stat/',{params:{id:id}}).then(function(data){
        defer.resolve(data);
      },function(error){
        defer.reject();
      });
      return defer.promise;
    },
    combineEvents:function(date,filter,id){
      var defered=$q.defer();
      var events=[];
      if(date===undefined){
        date=new Date(Date.now());
      }
      var tempData=date.toString().split('/');
      if(tempData.length>2){
        date=new Date(tempData[2],tempData[1]-1,tempData[0]);
      }
      this.getEvents(date.getFullYear(),date.getMonth()+1,date.getDate(),filter,id).then(function(data){
        switch(filter){
          case 'Day':events=calculateTime(data.data);
            break;
          case 'Week':{
            events=createWeek(data.data);
          }
            break;
        }
        defered.resolve(events);
      });
      return defered.promise;
    }
  };
  return IntraNetObject;
}

angular.module('IntranetModule').directive('intraNet',intraNetDirect);

function intraNetDirect(){
  return {
    restrict:'EA',
    scope:{
      timerClass:'@timerClass'
    },
    require: 'ngModel',
    templateUrl:'/dirs/intraDir.html',
    controller:intraController,
    controllerAs:'ic'
  };
};

intraController.$inject=['IntraFactory', '$timeout', 'ipCookie', 'favicoFactory'];
function intraController(IntraFactory, $timeout, ipCookie, favicoFactory){
  var ic = this;
  var myTimeout;

  ic.tickTime=0;

  ic.init=function(){
    if(ipCookie('timerTick')==undefined){
      ipCookie('timerTick',false);
    }
    if(ipCookie('timerDate')==undefined){
      var currentdate=new Date(),
          date = currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear();
      ipCookie('timerDate',date);
    }
    if(ipCookie('tickedTime')==undefined){
      ipCookie('tickedTime',0);
    }
    if(ipCookie('timerTick')){
      timeOut();
    }else{
      if(ipCookie('tickedTime')){
        ic.tickTime=ipCookie('tickedTime');
      }
    }
  };

  ic.intraControl=function(){
    ipCookie('timerTick')?checkOut():checkIn();
  };

  var checkIn=function(){
    var currentdate=new Date(),
        date = currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear();
    if(!ipCookie('timerDate')){
      ipCookie('timerDate',date);
    }else{
      if(ipCookie('timerDate')!=date){
        ipCookie('tickedTime',0);
        ipCookie('timerDate',date);
      }
    }
    ipCookie('timerTick', true);
    ipCookie('time',Date.now());
    IntraFactory.checkIn().then(function(data){
      ipCookie('tickedTime',data.time);
      favicoFactory.changeIcon('checkIn');
      timeOut();
    });
  };

  var checkOut=function(){
    ipCookie('timerTick', false);
    $timeout.cancel(myTimeout);
    ipCookie('tickedTime',ic.tickTime);
    IntraFactory.checkOut().then(function(data){
      favicoFactory.changeIcon('checkOut');
      if(data.code===3){
        ipCookie('tickedTime',data.time);
      }
    });
  };

  var timeOut=function(){
    var currentdate=new Date(),
        date = currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear();
    if(ipCookie('timerDate')!=date){
      ipCookie('tickedTime',0);
      ic.tickTime=0;
      checkOut();
      ipCookie('timerDate',date);
      $timeout.cancel(myTimeout);
    }
    ic.tickTime=~~(((Date.now()-ipCookie('time'))/1000)+parseInt(ipCookie('tickedTime')));
    myTimeout=$timeout(timeOut,1000);
  };
};

angular.module('IntranetModule').filter('timeFilter',timeFilter);

function timeFilter(){
  return function(time){
    var sig=1;
    if(time==0)
      return '0:00:00';
    if(time<0)
      {
        sig=-1;
        time*=-1;
      }
    var h = Math.round(time/3600 ^ 0);
    var m = Math.round((time-h*3600)/60 ^ 0);
    var s = Math.round(time-h*3600-m*60);
    s=s>9?s:'0'+s;
    m=m>9?m:'0'+m;
    return (sig<0?'-':'')+(h + ':' + m + ':'+s);
  }
}


angular.module('IntranetModule').filter('milisecFilter',fromMilsToTime);

function fromMilsToTime(){
  return function(s) {
    var sig=1;
    if(!s){
      return '0:00:00';
    }
    if(s<0)
      {
        sig=-1;
        s*=-1;
      }
    function addZ(n) {
      return (n<10? '0':'') + n;
    }
    var ms = Math.round(s % 1000);
    s = (s - ms) / 1000;
    var secs = Math.round(s % 60);
    s = (s - secs) / 60;
    var mins = Math.round(s % 60);
    var hrs = Math.round((s - mins) / 60);
    return (sig<0?'-':'')+hrs + ':' + addZ(mins) + ':' + addZ(secs);
  }
}

angular.module('IntranetModule').controller('IntraController',intrCntr);

intrCntr.$inject=['IntraFactory','ipCookie'];
function intrCntr(IntraFactory,ipCookie){
  var vm=this;
  var currentTime = new Date();
  vm.currentTime = currentTime;
  vm.month = ['Januar', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  vm.monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  vm.weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  vm.filter="";
  vm.eventsInfo={};
  vm.events=[];
  vm.weekdaysLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  vm.disable = [false, 1];
  vm.today = 'Today';
  vm.clear = 'Clear';
  vm.close = 'Close';


  vm.onSet = function () {

    var splitDate=vm.currentTime.toString().split('/');
    if(splitDate.length>2){
      vm.getEvents(new Date(splitDate[2],splitDate[1]-1,splitDate[0]));
    }
  };

  vm.getEvents=function(date){
    IntraFactory.combineEvents(date,vm.filter).then(function(data){
      vm.events=data;
    });
  }

  var getInfo=function(){
    IntraFactory.getEventsStatistic().then(function(data){
      vm.eventsInfo.hoursPerDay=ipCookie('tickedTime')==undefined?0:ipCookie('tickedTime');
      vm.eventsInfo.hoursDayOverflow=(ipCookie('tickedTime')==undefined?0:ipCookie('tickedTime'))-8*60*60;
      vm.eventsInfo.hoursForWeek=parseInt(data.data.hoursForWeek)*1000;
      vm.eventsInfo.hoursWeekOverflow=parseInt(data.data.hoursForWeek)-8*60*60*(new Date().getDay());
      vm.eventsInfo.hoursForMonth=parseInt(data.data.hoursForMonth)*1000;
      vm.eventsInfo.hoursSumm = parseInt(data.data.hoursSumm)*1000;
      vm.eventsInfo.eventsSumm=parseInt(data.data.eventsCount);
    });
  }

  vm.init=function(){
    vm.filter=ipCookie('filterDate')?ipCookie('filterDate'):"Day";
    vm.getEvents();
    getInfo();
  }

  vm.changeFilter=function(filterArg){
    vm.filter=filterArg;
    ipCookie('filterDate',filterArg);
    vm.getEvents();
  }
}
