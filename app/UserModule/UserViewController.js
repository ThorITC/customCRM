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
