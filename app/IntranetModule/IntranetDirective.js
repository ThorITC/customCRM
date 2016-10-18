angular.module('IntranetModule').directive('intraNet',intraNetDirect);

function intraNetDirect(){
  return {
    restrict:'EA',
    scope:{
      timerClass:'@timerClass'
    },
    require: 'ngModel',
    templateUrl:'/dirs/intraDir.html',
    controller:intraController,
    controllerAs:'ic'
  };
};

intraController.$inject=['IntraFactory', '$timeout', 'ipCookie', 'favicoFactory'];
function intraController(IntraFactory, $timeout, ipCookie, favicoFactory){
  var ic = this;
  var myTimeout;

  ic.tickTime=0;

  ic.init=function(){
    if(ipCookie('timerTick')==undefined){
      ipCookie('timerTick',false);
    }
    if(ipCookie('timerDate')==undefined){
      var currentdate=new Date(),
          date = currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear();
      ipCookie('timerDate',date);
    }
    if(ipCookie('tickedTime')==undefined){
      ipCookie('tickedTime',0);
    }
    if(ipCookie('timerTick')){
      timeOut();
    }else{
      if(ipCookie('tickedTime')){
        ic.tickTime=ipCookie('tickedTime');
      }
    }
  };

  ic.intraControl=function(){
    ipCookie('timerTick')?checkOut():checkIn();
  };

  var checkIn=function(){
    var currentdate=new Date(),
        date = currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear();
    if(!ipCookie('timerDate')){
      ipCookie('timerDate',date);
    }else{
      if(ipCookie('timerDate')!=date){
        ipCookie('tickedTime',0);
        ipCookie('timerDate',date);
      }
    }
    ipCookie('timerTick', true);
    ipCookie('time',Date.now());
    IntraFactory.checkIn().then(function(data){
      ipCookie('tickedTime',data.time);
      favicoFactory.changeIcon('checkIn');
      timeOut();
    });
  };

  var checkOut=function(){
    ipCookie('timerTick', false);
    $timeout.cancel(myTimeout);
    ipCookie('tickedTime',ic.tickTime);
    IntraFactory.checkOut().then(function(data){
      favicoFactory.changeIcon('checkOut');
      if(data.code===3){
        ipCookie('tickedTime',data.time);
      }
    });
  };

  var timeOut=function(){
    var currentdate=new Date(),
        date = currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear();
    if(ipCookie('timerDate')!=date){
      ipCookie('tickedTime',0);
      ic.tickTime=0;
      checkOut();
      ipCookie('timerDate',date);
      $timeout.cancel(myTimeout);
    }
    ic.tickTime=~~(((Date.now()-ipCookie('time'))/1000)+parseInt(ipCookie('tickedTime')));
    myTimeout=$timeout(timeOut,1000);
  };
};
