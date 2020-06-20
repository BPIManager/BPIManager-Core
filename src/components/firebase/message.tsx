import firebase from 'firebase/app';
import 'firebase/messaging';
import fbActions from './actions';
const messaging = firebase.messaging();
messaging.usePublicVapidKey("BK9k1aToNoODFR7kAWGLmyKy4B7oEhhk17RJwQ08xw5XzSmYnP7195rEcMhwlBqJ3KfTlQjCg4zxGa7VBFA6rus");
messaging.onTokenRefresh(function() {
  messaging.getToken().then(function(refreshedToken) {
    new messanger().refreshToken(refreshedToken);
  });
});

messaging.onMessage(payload => {
  console.log("Message received. ", payload);
});

export class messanger{

  checkPermission(){
    return Notification.permission === "granted";
  }

  getToken(){
    return messaging.getToken();
  }

  refreshToken(refreshedToken?:string){
    new fbActions().auth().onAuthStateChanged(async(user: any)=> {
      const token = refreshedToken || await this.getToken();
      new fbActions().updateToken(user.uid,token);
    });

  }

  async requestPermission(){
    try{
      if("Notification" in window){
        if(Notification.permission === "granted"){
          return true;
        }
        Notification.requestPermission((permission)=>{
          if (permission === "granted") {
            return true;
          }else {
            return false;
          }
        });
      }else{
        alert("非対応ブラウザです。");
        return false;
      }
    }catch(e){
      console.log(e);
      return false;
    }
  }
}
