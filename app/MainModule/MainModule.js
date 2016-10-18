angular.module("smApp",['userModule','IntranetModule','auto-complete','ngRoute','720kb.tooltips','ui.materialize','ipCookie','ngImgCrop','angularFileUpload','angular-clipboard'/*, 'news'*/]);
angular.module('smApp').constant('SERVER_URL','http://crm-sm.pixodo.org/');
angular.module('smApp').constant('API_URL','http://crm-sm.pixodo.org');
//angular.module('smApp').constant('SERVER_URL','http://server.smcrm.loc/');
//angular.module('smApp').constant('API_URL','http://server.smcrm.loc');
angular.module('smApp').run(function($http,ipCookie){
  if(ipCookie('token')){
    $http.defaults.headers.common.Authorization = 'Token '+ipCookie('token');
  }
});
