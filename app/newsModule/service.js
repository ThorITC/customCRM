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
