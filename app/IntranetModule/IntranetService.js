angular.module('IntranetModule').factory('IntraFactory',IntranetFactory);

IntranetFactory.$inject=['$http','$q','UserFactory','API_URL'];
function IntranetFactory($http,$q,UserFactory,API_URL){
  var weekdaysFull = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var calculateTime=function(dateArray){
    var resSumm=0,
        tempEvent=null;
    for(var i=0;i<dateArray.length;i++){
      if(dateArray[i].event_type.id==1){
        tempEvent=dateArray[i];
      }else{
        if(tempEvent==null)
          continue;
        resSumm+=(new Date(dateArray[i].create_date)) - (new Date(tempEvent.create_date));
        dateArray[i].tickedTime=resSumm;
      }
    }
    return dateArray;
  };
  var createWeek=function(dataArray){
    var events=[];
    var tempEvent=null,
        dayIter=-1,
        dayHours=0,
        tempDate=null;
    function propRefresh(date){
      dayIter++;
      events[dayIter]={};
      events[dayIter].dayName=weekdaysFull[date.getDay()];
      events[dayIter].date=date;
      tempDate=date;
    }
    for(var i=0;i<dataArray.length;i++){
      var date=new Date(dataArray[i].create_date);
      if(tempDate==null){
        propRefresh(date);
      }
      if(date.getDate()!=tempDate.getDate()){
        if(dayIter>=0){
          events[dayIter].hours=dayHours;
          dayHours=0;
        }
        propRefresh(date);
      }
      if(dataArray[i].event_type.id==1){
        tempEvent=dataArray[i];
      }else{
        dayHours+=(new Date(dataArray[i].create_date)) - (new Date(tempEvent.create_date));
      }
      if(events[dayIter].events===undefined){
        events[dayIter].events=[];
      }
      events[dayIter].events.push(dataArray[i]);
      if(i==dataArray.length-1)
        events[dayIter].hours=dayHours;
    }
    for(var i=0;i<events.length;i++){
      events[i].events=calculateTime(events[i].events);
    }
    return events;
  };
  var IntraNetObject={
    checkIn:function(){
      var defered=$q.defer();
      $http.post(API_URL+'/event/',{event_type_id:1}).then(function(data){
        defered.resolve(data.data);
      },function(data){
        defered.reject();
      });
      return defered.promise;
    },
    checkOut:function(comment){
      var defered=$q.defer();
      $http.post(API_URL+'/event/',{event_type_id:2,comment:comment}).then(function(data){
        defered.resolve(data.data);
        if(data.data.code!=3){
          swal({
            title: "CheckOut!",
            text: "Why you checkOut?",
            type: "input",
            showCancelButton: !true,
            closeOnConfirm: false,
            animation: "slide-from-top",
          },
           function(inputValue){
             if (inputValue === false)
               return false;
             if (inputValue === "") {
               swal.showInputError("You need to write something!");
               return false
             }
             $http.put(API_URL+'/event/',{comment:inputValue,id:data.data.id}).then(function(data){
               swal("Nice!", "You checkOut from CRM", "success");
             });
           });
       }
     },function(error){
       defered.reject();
     });
     return defered.promise;
    },
    getEvents:function(year,month,day,filter,id){
      var defer=$q.defer();
      $http.get(API_URL+'/event/',{params:{year:year,month:month,day:day,filter:filter,id:(id===undefined?0:id)}}).then(function(data){
        defer.resolve(data);
      },function(error){
        defer.reject();
      })
      return defer.promise;
    },
    getEventsStatistic:function(id){
      if(id===undefined){
        id='my';
      }
      var defer=$q.defer();
      $http.get(API_URL+'/event-stat/',{params:{id:id}}).then(function(data){
        defer.resolve(data);
      },function(error){
        defer.reject();
      });
      return defer.promise;
    },
    combineEvents:function(date,filter,id){
      var defered=$q.defer();
      var events=[];
      if(date===undefined){
        date=new Date(Date.now());
      }
      var tempData=date.toString().split('/');
      if(tempData.length>2){
        date=new Date(tempData[2],tempData[1]-1,tempData[0]);
      }
      this.getEvents(date.getFullYear(),date.getMonth()+1,date.getDate(),filter,id).then(function(data){
        switch(filter){
          case 'Day':events=calculateTime(data.data);
            break;
          case 'Week':{
            events=createWeek(data.data);
          }
            break;
        }
        defered.resolve(events);
      });
      return defered.promise;
    }
  };
  return IntraNetObject;
}
