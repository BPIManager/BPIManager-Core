import fb, { twitter,firestore, google } from ".";
import timeFormatter from "../common/timeFormatter";
import { scoresDB, scoreHistoryDB } from "../indexedDB";
import platform from "platform";

export default class fbActions{

  authWithTwitter():void{
    fb.auth().signInWithRedirect(twitter);
    fb.auth().getRedirectResult().then(_result => {
      return;
    }).catch(error => {
      console.log(error);
    });
    return;
  }

  authWithGoogle():void{
    fb.auth().signInWithRedirect(google);
    fb.auth().getRedirectResult().then(_result => {
      return;
    }).catch(error => {
      console.log(error);
    });
    return;
  }

  auth():firebase.auth.Auth{
    return fb.auth();
  }

  logout():Promise<void>{
    return fb.auth().signOut();
  }

  private name:string = "";
  private uid:string = "";

  setColName(name:string):this{
    this.name = name;
    return this;
  }

  setUid(uid:string):this{
    this.uid = uid;
    return this;
  }

  type():string{
    return `${platform.os} / ${platform.name}`
  }

  async save(){
    try{
      if(!this.name){return {error:true,date:null};}
      await firestore.collection(this.name).doc(this.uid).set({
        timeStamp: timeFormatter(3),
        type: this.type(),
        scores: await new scoresDB().getAll(),
        scoresHistory : await new scoreHistoryDB().getAllInSpecificVersion(),
      });
      return {error:false,date:timeFormatter(3)};
    }catch(e){
      console.log(e);
      return {error:true,date:null};
    }
  }

  async load(){
    try{
      if(!this.name){return {error:true,data:null}}
      const res = await firestore.collection(this.name).doc(this.uid).get();
      if(res.exists){
        return res.data();
      }else{
        return null;
      }
    }catch(e){
      console.log(e);
      return null;
    }
  }


}
