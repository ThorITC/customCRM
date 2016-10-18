angular.module('userModule').controller('SettingsController',setCtrl);

setCtrl.$inject=['$scope','UserFactory','ipCookie','FileUploader','API_URL'];
function setCtrl($scope,UserFactory,ipCookie,FileUploader,API_URL){
  var vm=this;
  var currentTheme=null;
  vm.departments=[];
  vm.settings={};
  vm.passwords={};
  vm.maxDate = (new Date(2000,12,31)).toISOString(); 
  $scope.avatar={myImage:'',myCroppedImage:'',imageEdit:false};
  $scope.background={myImage:'',myCroppedImage:'',imageEdit:false};
  var avatarUploader = vm.avatarUploader = new FileUploader({
        url: API_URL+'/loadavatar/',
        autoUpload: false
    });
  var backgroundUploader = vm.backgroundUploader = new FileUploader({
        url: API_URL+'/loadbackground/',
        autoUpload: false
    });

  vm.avatarUploader.onBeforeUploadItem = function (fileItem) {
    fileItem.headers = {
      Authorization: 'Token '+ipCookie('token')
    };
  }
  vm.avatarUploader.onCompleteItem = function(fileItem, response, status, headers) {
        vm.init();
    };

  vm.backgroundUploader.onBeforeUploadItem = function (fileItem) {
    fileItem.headers = {
      Authorization: 'Token '+ipCookie('token')
    };
  }
  vm.backgroundUploader.onCompleteItem = function(fileItem, response, status, headers) {
        vm.init();
    };

  vm.init=function(){
    UserFactory.profile().then(function(data){
      vm.settings=data;
      console.log(data);

    });
    UserFactory.getDepartments().then(function(data){
      vm.departments=data.deps;
    });
    currentTheme=ipCookie('theme');
    vm.passwords.newPassword='';
    vm.passwords.reapetPassword='';
  }

  vm.setDepartment=function(dep_id){
    console.log(dep_id);
    vm.settings.department.id=dep_id;
  }

  vm.save=function(){
    if(vm.settings.dob){
      var splitDate=vm.settings.dob.toString().split('/');
      if(splitDate.length>2){
        vm.settings.dob=new Date(splitDate[2],splitDate[1]-1,splitDate[0]);
      }
    }

    UserFactory.saveSettings(vm.settings).then(function(data){
      if(data.status){
        $scope.avatar.imageEdit=false;
      }
    });
    currentTheme=ipCookie('theme');
    if($scope.avatar.imageEdit){
      var file = base64ToBlob($scope.avatar.myCroppedImage.replace('data:image/png;base64,',''), 'image/jpeg');
      avatarUploader.addToQueue(file);
      avatarUploader.uploadAll();
    }
    if($scope.background.imageEdit){
      var imgData=$scope.background.myCroppedImage;
      imgData=imgData.replace(imgData.substring(0,imgData.indexOf(';base64,')+8),'');
      var file = base64ToBlob(imgData, 'image/jpeg');
      backgroundUploader.addToQueue(file);
      backgroundUploader.uploadAll();
    }
  }

  vm.theme=function(theme){
    ipCookie('theme',theme);
    vm.settings.theme=theme;
    UserFactory.theme(theme);
  }

  vm.changePassword=function(){
    UserFactory.changePassword(vm.passwords).then(function(data){
      if(data.status){
        angular.element(document.querySelector('#changePasswordModal')).closeModal();
        Materialize.toast('Success changing!',1500)
        return;
      }
      switch(data.code){
        case 3:
          {
            vm.passwords.currentPassword='';
          };
          break;
        case 2:
          {
            vm.passwords.newPassword='';
            vm.passwords.reapetPassword='';
          }
      }
      Materialize.toast(data.message,1500);
    });

  }

  var avatarHandleFileSelect=function(evt) {
    var file=evt.currentTarget.files[0];
    var reader = new FileReader();
    reader.onload = function (evt) {
      $scope.$apply(function($scope){
        $scope.avatar.imageEdit=true;
        $scope.avatar.myImage=evt.target.result;
      });
    };
    reader.readAsDataURL(file);
  };

  var backgroundHandleFileSelect=function(evt) {
    var file=evt.currentTarget.files[0];
    var reader = new FileReader();
    reader.onload = function (evt) {
      $scope.$apply(function($scope){
        $scope.background.imageEdit=true;
        $scope.background.myCroppedImage=evt.target.result;
      });
    };
    reader.readAsDataURL(file);
  };

  var base64ToBlob=function(base64Data, contentType) {
        contentType = contentType || '';
        var sliceSize = 1024;
        var byteCharacters = atob(base64Data);
        var bytesLength = byteCharacters.length;
        var slicesCount = Math.ceil(bytesLength / sliceSize);
        var byteArrays = new Array(slicesCount);
         for (var sliceIndex = 0;sliceIndex <slicesCount;++sliceIndex) {
            var begin = sliceIndex * sliceSize;
            var end = Math.min(begin + sliceSize, bytesLength);
            var bytes = new Array(end - begin);
            for (var offset = begin, i = 0 ;offset < end;++i, ++offset) {
                bytes[i] = byteCharacters[offset].charCodeAt(0);
            }
            byteArrays[sliceIndex] = new Uint8Array(bytes);
        }
        return new Blob(byteArrays, {type: contentType });
    };

  angular.element(document.querySelector('#avatarInput')).on('change',avatarHandleFileSelect);
  angular.element(document.querySelector('#backgroundInput')).on('change',backgroundHandleFileSelect);
}
