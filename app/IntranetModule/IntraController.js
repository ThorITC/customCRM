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
