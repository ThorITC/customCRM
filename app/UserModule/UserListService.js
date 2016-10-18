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
