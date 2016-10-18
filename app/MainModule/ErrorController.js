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
