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
