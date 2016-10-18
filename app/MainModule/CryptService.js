angular.module('smApp').factory('cryptFactory',cryptFactory);

cryptFactory.$inject=[];
function cryptFactory(){


  var cryptObj={
    encrypt:function(data,key,iv){
      key=key+key.length*key.length;
      var encrypted = CryptoJS.AES.encrypt(
        data,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      return encrypted.toString();
    },
    decrypt:function(data,key,iv){
      key=key+key.length*key.length;
      var decrypted = CryptoJS.AES.decrypt(
        data,
        key,
        {
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7
        }
      );
      return decrypted.toString(CryptoJS.enc.Utf8);
    }
  };
  return cryptObj;
}
