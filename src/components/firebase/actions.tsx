import fb, { twitter,firestore, google } from ".";
import timeFormatter from "../common/timeFormatter";
import { scoresDB, scoreHistoryDB, songsDB } from "../indexedDB";
import platform from "platform";
import firebase from 'firebase/app';
import { rivalStoreData, scoreData } from "../../types/data";
import bpiCalcuator from '../bpi';
import {getTotalBPI} from '../common';

export default class fbActions{

  async authWithTwitter():Promise<void>{
    fb.auth().signInWithRedirect(twitter);
  }

  async authWithGoogle():Promise<void>{
    return fb.auth().signInWithRedirect(google);
  }

  authInfo():firebase.User|null{
    return fb.auth().currentUser;
  }

  currentIcon():string{
    const t = fb.auth().currentUser;
    if(t){
      return t.photoURL || "";
    }else{
      return "";
    }
  }

  async updateProfileIcon():Promise<firebase.auth.UserCredential|null>{
    return fb.auth().getRedirectResult().then(async function(_result) {
      if(_result && _result.user && _result.additionalUserInfo && _result.additionalUserInfo.profile){
        const pid = _result.additionalUserInfo.providerId;
        const t = fb.auth().currentUser;
        let p = "";
        if(pid === "google.com"){
          p = (_result.additionalUserInfo.profile as {picture:string}).picture;
        }else if(pid === "twitter.com"){
          p = (_result.additionalUserInfo.profile as {profile_image_url_https:string}).profile_image_url_https;
        }
        await firestore.collection("users").doc(_result.user.uid).set({
          photoURL:p
        },{merge: true});
        if(t){
          await t.updateProfile({
            photoURL:p
          });
        }
      }
      return _result;
    }).catch(error => {
      console.log(error);
      alert(error.message ? error.message : error);
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
    if(!this.name || !this.docName){return {error:true,date:null};}
    console.log("writing",this.docName);
    const self = this;
    const s = await new scoresDB().getAll();
    const docRef = firestore.collection(self.name).doc(self.docName);
    const userRef = firestore.collection("users").doc(self.docName);
    return firestore.runTransaction(async function(transaction) {
      await transaction.get(docRef).then(async function(doc){
        const newDoc = {
          timeStamp: timeFormatter(3),
          serverTime:self.time(),
          type: self.type(),
          scores: s,
          scoresHistory : await new scoreHistoryDB().getAllInSpecificVersion(),
        };
        if(doc.exists){
          transaction.update(docRef,newDoc);
        }else{
          transaction.set(docRef,newDoc);
        }
        console.log("signed as :"+isRegisteredAs);
        if(isRegisteredAs !== ""){
          transaction.update(userRef,{
            timeStamp: timeFormatter(3),
            serverTime:self.time(),
            totalBPI:await self.totalBPI(),
          });
        }
      });
    }).then(()=>{
      return {error:false,date:timeFormatter(3)};
    }).catch(e=>{
      console.log(e);
      return {error:true,date:null};
    });
  }

  async totalBPI():Promise<number>{
    const bpi = new bpiCalcuator();
    const s = await new scoresDB().getAll();
    bpi.setTraditionalMode(0);
    const _s = s.filter(item=>item.difficultyLevel === "12");
    bpi.allTwelvesBPI = _s.reduce((group:number[],item:any)=>{group.push(item.currentBPI); return group;},[]);
    bpi.allTwelvesLength = await new songsDB().getSongsNum("12");
    return bpi.totalBPI();
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
      if(displayName.length !== 0 && !/^[a-zA-Z0-9]+$/g.test(displayName)){
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
          arenaRank:arenaRank,
          totalBPI:await this.totalBPI(),
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

  async recentUpdated(last:rivalStoreData|null,endAt:rivalStoreData|null,arenaRank:string,recommended:boolean):Promise<rivalStoreData[]>{
    try{
      let query:firebase.firestore.Query = firestore.collection("users").orderBy("serverTime", "desc");
      if(!recommended){
        if(arenaRank !== "すべて"){
          query = query.where("arenaRank","==",arenaRank);
        }
        if(last){
          query = query.startAfter(last.serverTime);
        }
        if(endAt){
          query = query.endAt(endAt.serverTime);
        }
        if(!endAt){
          query = query.limit(10);
        }
      }
      const total = await getTotalBPI();
      if(recommended){
        query = firestore.collection("users").orderBy("totalBPI", "desc");
        const downLimit = total > 60 ? 50 : total - 5;
        const upLimit = total > 50 ? 100 : total + 5;
        query = query.where("totalBPI",">=",downLimit);
        query = query.where("totalBPI","<=",upLimit);
        query = query.limit(20);
      }
      const res = await query.get();
      if(!res.empty && res.size >= 1){
        const uid = this.authInfo();
        const d = res.docs.reduce((groups:rivalStoreData[],item:firebase.firestore.QueryDocumentSnapshot)=>{
          const body = item.data();
          if(body.displayName && body.displayName !== "" && body.serverTime && (uid && body.uid !== uid.uid)){
            groups.push(body as rivalStoreData);
          }
          return groups;
        },[]);
        return recommended ? d.sort((a,b)=>{
          return Math.abs(total - (Number(a.totalBPI) || -15)) - Math.abs(total - (Number(b.totalBPI) || -15))
        }) : d;
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

  async createShare(score:scoreData,uid:string){
    return  await firestore.collection("shared").add(Object.assign(score,{
      uid:uid,
      updatedAt:timeFormatter(3)
    }));
  }

}
