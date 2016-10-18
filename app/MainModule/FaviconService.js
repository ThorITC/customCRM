angular.module('smApp').factory('favicoFactory', favicoFact);

function favicoFact(){
  var src = {
    checkIn: 'images/checkIn.png',
    checkOut: 'images/checkOut.png',
    app: 'images/app.png'
  }
  var favicoObject = {
    changeIcon: _changeIcon
  };

  function _changeIcon(key){
    var icon = src[key] ? src[key] : src['app'];
    document.head || (document.head = document.getElementsByTagName('head')[0]);
    var link = document.createElement('link'),
    oldLink = document.getElementById('dynamic-favicon');
    link.id = 'dynamic-favicon';
    link.rel = 'shortcut icon';
    link.href = icon;
    if (oldLink) {
      document.head.removeChild(oldLink);
    }
    document.head.appendChild(link);
  }

  return favicoObject;
}
