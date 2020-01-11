import fb, { twitter,firestore, google } from ".";
import timeFormatter from "../common/timeFormatter";
import { scoresDB, scoreHistoryDB } from "../indexedDB";
import platform from "platform";
import firebase from "firebase";
import { rivalStoreData } from "../../types/data";

export default class fbActions{

  async authWithTwitter():Promise<firebase.auth.UserCredential|null>{
    return fb.auth().signInWithPopup(twitter).then(async(_result) => {
      if(_result && _result.user && _result.additionalUserInfo && _result.additionalUserInfo.profile){
        const p = _result.additionalUserInfo.profile as {profile_image_url_https:string};
        await firestore.collection("users").doc(_result.user.uid).set({
          photoURL:p.profile_image_url_https
        },{merge: true});
      }
      return _result;
    }).catch(error => {
      console.log(error);
      return null;
    });
  }

  async authWithGoogle():Promise<firebase.auth.UserCredential|null>{
    return fb.auth().signInWithPopup(google).then(_result => {
      return _result;
    }).catch(error => {
      console.log(error);
      return null;
    });
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

  time(){
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  async save(isRegisteredAs = ""){
    try{
      if(!this.name || !this.docName){return {error:true,date:null};}
      await firestore.collection(this.name).doc(this.docName).set({
        timeStamp: timeFormatter(3),
        serverTime:this.time(),
        type: this.type(),
        scores: await new scoresDB().getAll(),
        scoresHistory : await new scoreHistoryDB().getAllInSpecificVersion(),
      });
      console.log("signed as :"+isRegisteredAs);
      if(isRegisteredAs !== ""){
        await firestore.collection("users").doc(this.docName).update({
          timeStamp: timeFormatter(3),
          serverTime:this.time(),
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

  async saveName(displayName:string,profile:string,photoURL:string,arenaRank:string){
    try{
      if(!this.name || !this.docName){return {error:true,date:null};}
      if(displayName.length > 16 || profile.length > 140){
        console.log("too long error");
        return {error:true,date:null};
      }
      if(displayName.length !== 0 && !/^[a-zA-Z0-9.]+$/g.test(displayName)){
        console.log("invalid inputs error");
        return {error:true,date:null};
      }
      const duplication = await this.searchRival(displayName,true);
      if(duplication !== null && displayName !== "" && duplication.uid !== this.docName){
        console.log("already used error");
        return {error:true,date:null};
      }
      if(displayName === ""){
        await firestore.collection("users").doc(this.docName).delete();
      }else{
        await firestore.collection("users").doc(this.docName).set({
          timeStamp: timeFormatter(3),
          serverTime:this.time(),
          uid:this.docName,
          displayName:displayName,
          profile:profile,
          photoURL:photoURL,
          arenaRank:arenaRank
        });
      }
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

  async recentUpdated(last:rivalStoreData|null,endAt:rivalStoreData|null,arenaRank:string):Promise<rivalStoreData[]>{
    try{
      let query = firestore.collection("users").orderBy("serverTime", "desc");
      if(last){
        query = query.startAfter(last.serverTime);
      }
      if(endAt){
        query = query.endAt(endAt.serverTime);
      }
      if(arenaRank !== "すべて"){
        query = query.where("arenaRank","==",arenaRank);
      }
      if(!endAt){
        query = query.limit(10);
      }
      const res = await query.get();
      if(!res.empty && res.size >= 1){
        return res.docs.reduce((groups:rivalStoreData[],item:firebase.firestore.QueryDocumentSnapshot)=>{
          const body = item.data();
          if(body.displayName && body.displayName !== "" && body.serverTime){
            groups.push(body as rivalStoreData);
          }
          return groups;
        },[]);
      }else{
        return [];
      }
    }catch(e){
      console.log(e);
      return [];
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
