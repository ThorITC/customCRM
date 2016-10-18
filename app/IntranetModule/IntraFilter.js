angular.module('IntranetModule').filter('timeFilter',timeFilter);

function timeFilter(){
  return function(time){
    var sig=1;
    if(time==0)
      return '0:00:00';
    if(time<0)
      {
        sig=-1;
        time*=-1;
      }
    var h = Math.round(time/3600 ^ 0);
    var m = Math.round((time-h*3600)/60 ^ 0);
    var s = Math.round(time-h*3600-m*60);
    s=s>9?s:'0'+s;
    m=m>9?m:'0'+m;
    return (sig<0?'-':'')+(h + ':' + m + ':'+s);
  }
}


angular.module('IntranetModule').filter('milisecFilter',fromMilsToTime);

function fromMilsToTime(){
  return function(s) {
    var sig=1;
    if(!s){
      return '0:00:00';
    }
    if(s<0)
      {
        sig=-1;
        s*=-1;
      }
    function addZ(n) {
      return (n<10? '0':'') + n;
    }
    var ms = Math.round(s % 1000);
    s = (s - ms) / 1000;
    var secs = Math.round(s % 60);
    s = (s - secs) / 60;
    var mins = Math.round(s % 60);
    var hrs = Math.round((s - mins) / 60);
    return (sig<0?'-':'')+hrs + ':' + addZ(mins) + ':' + addZ(secs);
  }
}
