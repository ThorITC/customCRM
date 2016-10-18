angular.module('smApp').directive('themer',dirFunc);
angular.module('smApp').directive('themeButton',includeFunc);

dirFunc.$inject=['ipCookie'];
function dirFunc(ipCookie){
  var linkFunction = function(scope, element,attributes) {
    element.addClass(ipCookie('theme')+(scope.textTheme?'-text':'')+' '+scope.otherClass);
  };

  return {
    restrict:'C',
    scope:{
      otherClass:'@otherClass',
      textTheme:'@textTheme',
    },
    link:linkFunction,
  }
}

includeFunc.$inject=['ipCookie'];
function includeFunc(ipCookie){
  var linkFunction=function(scope,element,attributes){
    element.addClass(ipCookie('theme')+' waves-effect waves-light btn');
  };

  return {
    restrict:'C',
    link:linkFunction
  }
}
