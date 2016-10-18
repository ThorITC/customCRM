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
