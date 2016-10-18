angular.module('userModule').controller('profileController',profileCtrl);

profileCtrl.$inject=['ipCookie','AccessFactory','UserFactory'/*, 'NewsFactory'*/];
function profileCtrl(ipCookie,AccessFactory,UserFactory/*, NewsFactory*/){
  var vm=this;
  var colors={
    pink:'#E91E63',
    indigo:'#3F51B5',
    'light-green':'#8BC34A',
    amber:'#FFC107',
    'blue-grey':'#607D8B',
    cyan:'#00BCD4'
  };

  var shadowColors={
    pink:'#F48FB1',
    indigo:'#9FA8DA',
    'light-green':'#C5E1A5',
    amber:'#FFE082',
    'blue-grey':'#B0BEC5',
    cyan:'#80DEEA'
  };
  vm.showShare=true;
  vm.newAccess={};
  vm.profileData={};
  vm.privatePasswords=[];
  vm.accessToEdit={};
  vm.publicPasswords=[];
  vm.shareAccess=[];
  vm.sharedId=null;
  vm.names =[];
  vm.articles = null;

  vm.init=function(){
    angular.element(document.querySelector('head')).append("<style>.indicator{background:"+colors[ipCookie('theme')]+" !important;}.switch label input[type=checkbox]:checked + .lever{background:"+shadowColors[ipCookie('theme')]+" !important;}.switch label input[type=checkbox]:checked + .lever:after{background-color:"+colors[ipCookie('theme')]+" !important;}[type='checkbox'].filled-in:checked + label:after {border: 2px solid "+colors[ipCookie('theme')]+" !important;background-color: "+colors[ipCookie('theme')]+" !important;}</style>");
    UserFactory.profile().then(function(data){
			vm.profileData=data;
		});
    vm.names=AccessFactory.getEmails();
    vm.getAccesses('private');
    vm.getAccesses('public');
    /*NewsFactory.getNews().then(function(data){
      vm.articles = data.data.splice(0, data.data.length > 4 ? 4 : data.data.length);
    });*/
  };

  vm.getAccesses=function(type){
    if(type==='private')
      vm.privatePasswords=[];
    else{
      vm.publicPasswords=[];
    }
    AccessFactory.getAccesses(type).then(function(data){
        if(type==='private')
          vm.privatePasswords=data;
        else{
          vm.publicPasswords=data;

        }
    });
  }

  vm.addNewAccess=function(){
    AccessFactory.addAccess(vm.newAccess).then(function(data){
      if(data.status){
        Materialize.toast('Access added',1500);
        vm.newAccess=null;
        vm.getAccesses('private');
      }
    });
  }

  vm.getFieldFromDataModel=function(field){
		return vm.profileData[field];
	}

	vm.showField=function(filedName){
		return vm.profileData[filedName]!=null;
	}

  vm.deleteAccess=function(id){
    swal({
      title: "Are you sure?",
      text: "Do you want delete this access?",
      type: "warning",   showCancelButton: true,
    confirmButtonColor: "#DD6B55",   confirmButtonText: "Yes, delete it!",
     closeOnConfirm: false },
    function(){   AccessFactory.deleteAccess(id).then(function(data){
      if(data.status){
        swal("Deleted!", "Access has been deleted.", "success");
        vm.getAccesses('private');
      }
    });
  });

  }

  vm.editAccess=function(access){
    vm.accessToEdit=access;
    vm.accessToEdit.password='';
  }

  vm.saveEdited=function(){
    AccessFactory.editAccess(vm.accessToEdit).then(function(data){
      if(data.status){
        vm.getAccesses('private');
      }
    })
  }

  vm.getColor=function(){
    return shadowColors[ipCookie('theme')];
  }

  vm.getMainColor=function(){
    return colors[ipCookie('theme')];
  }

  vm.activeTab=function(tab){
    if(tab==='add'){
      vm.showShare=false;
    }else{
      vm.showShare=true;
    }
  }

  vm.ShowShareField=function(){
    if(vm.shareAccess.length===0){
      return false;
    }else{
      return vm.showShare;
    }
  }

  vm.addAccessToShareArray=function(access){
    var rebuildArray=function(item){
      var resultArray=[];
      for(var i=0;i<vm.shareAccess.length;i++){
        if(vm.shareAccess[i]!==item){
          resultArray.push(vm.shareAccess[i]);
        }
      }
      return resultArray;
    }
    if(vm.shareAccess.indexOf(access)===-1){
      vm.shareAccess.push(access);
    }else{
        vm.shareAccess=rebuildArray(access);
    }
  }

  vm.inShareAccessArray=function(access){
    return !(vm.shareAccess.indexOf(access)===-1);
  }

  vm.shareAccessMethod=function(){
    AccessFactory.shareAccess(vm.shareAccess,vm.sharedId).then(function(data){
      if(data.status){
        Materialize.toast('Success shared',1500);
        vm.shareAccess=[];
        vm.sharedId=null;
      }
    });
  }
}
