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
