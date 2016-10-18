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
