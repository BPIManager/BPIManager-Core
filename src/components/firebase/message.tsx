import firebase from 'firebase/app';
import 'firebase/messaging';
import fbActions from './actions';
const pubkey = "BK9k1aToNoODFR7kAWGLmyKy4B7oEhhk17RJwQ08xw5XzSmYnP7195rEcMhwlBqJ3KfTlQjCg4zxGa7VBFA6rus";

if(firebase.messaging.isSupported()){
  try{
    const messaging = firebase.messaging();
    messaging.usePublicVapidKey(pubkey);
    messaging.onTokenRefresh(function() {
      messaging.getToken().then(function(refreshedToken) {
        new messanger().refreshToken(refreshedToken);
      });
    });

    messaging.onMessage(payload => {
      console.log("Message received. ", payload);
    });
  }catch(e){
    console.log(e);
    alert("FCMの初期化中にエラーが発生しました。");
  }
}

export class messanger{
  private messaging = firebase.messaging();

  checkPermission(){
    return Notification.permission === "granted";
  }

  getToken(){
    return this.messaging.getToken();
  }

  refreshToken(refreshedToken?:string){
    try{
      new fbActions().auth().onAuthStateChanged(async(user: any)=> {
        const token = refreshedToken || await this.getToken();
        new fbActions().updateToken(user.uid,token);
      });
    }catch(e){
      alert(e);
    }

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
