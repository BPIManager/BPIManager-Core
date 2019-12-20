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
  private docName:string = "";

  setColName(name:string):this{
    this.name = name;
    return this;
  }

  setDocName(docName:string):this{
    this.docName = docName;
    return this;
  }

  type():string{
    return `${platform.os} / ${platform.name}`
  }

  async save(isRegistered = ""){
    try{
      if(!this.name || !this.docName){return {error:true,date:null};}
      const lastUpdate = timeFormatter(3);
      await firestore.collection(this.name).doc(this.docName).set({
        timeStamp: lastUpdate,
        type: this.type(),
        scores: await new scoresDB().getAll(),
        scoresHistory : await new scoreHistoryDB().getAllInSpecificVersion(),
      });
      if(isRegistered !== ""){
        await firestore.collection("users").doc(this.docName).update({
          timeStamp: lastUpdate,
        });
      }
      return {error:false,date:timeFormatter(3)};
    }catch(e){
      console.log(e);
      return {error:true,date:null};
    }
  }

  async load(){
    try{
      if(!this.name){return {error:true,data:null}}
      const res = await firestore.collection(this.name).doc(this.docName).get();
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

  async saveName(displayName:string,profile:string,photoURL:string){
    try{
      if(!this.name || !this.docName){return {error:true,date:null};}
      if(displayName.length > 16 || profile.length > 140){
        console.log("too long error");
        return {error:true,date:null};
      }
      if(displayName.length !== 0 && !/[a-zA-Z0-9]+$/g.test(displayName)){
        console.log("invalid inputs error");
        return {error:true,date:null};
      }
      const duplication = await this.searchRival(displayName,true);
      if(duplication !== null && displayName !== "" && duplication.uid !== this.docName){
        console.log("already used error");
        return {error:true,date:null};
      }
      const lastUpdate = timeFormatter(3);
      await firestore.collection("users").doc(this.docName).set({
        timeStamp: lastUpdate,
        uid:this.docName,
        displayName:displayName,
        profile:profile,
        photoURL:photoURL,
      });
      return {error:false,date:timeFormatter(3)};
    }catch(e){
      console.log(e);
      return {error:true,date:null};
    }
  }

  async searchRival(input:string,saving:boolean = false){
    try{
      if(!input || (input === "" && saving !== true)){ return [0];}
      const res = await firestore.collection("users").where("displayName","==",input).get();
      if(!res.empty && res.size === 1){
        return res.docs[0].data();
      }else{
        return null;
      }
    }catch(e){
      console.log(e);
      return null;
    }
  }

  async searchRivalByUid(input:string){
    try{
      if(!input || input === ""){ return [0]; }
      const res = await firestore.collection("users").where("uid","==",input).get();
      if(!res.empty && res.size === 1){
        return res.docs[0].data();
      }else{
        return null;
      }
    }catch(e){
      console.log(e);
      return null;
    }
  }


}
