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
