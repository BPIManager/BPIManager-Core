import fb, { twitter,firestore, google } from ".";
import timeFormatter from "../common/timeFormatter";
import { scoresDB, scoreHistoryDB, songsDB } from "../indexedDB";
import platform from "platform";
import firebase from 'firebase/app';
import { rivalStoreData, scoreData, DBRivalStoreData } from "../../types/data";
import bpiCalcuator from '../bpi';
import {getTotalBPI} from '../common';
import { _currentStore } from "../settings";
import { messanger } from "./message";

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
        throw new Error("too long error");
      }
      if(displayName.length !== 0 && !/^[a-zA-Z0-9]+$/g.test(displayName)){
        throw new Error("invalid inputs error");
      }
      const duplication = await this.searchRival(displayName,true);
      if(duplication !== null && displayName !== "" && duplication.uid !== this.docName){
        throw new Error("already used error");
      }
      const batch = firestore.batch();
      const from = firestore.collection("users").doc(this.docName);
      if(displayName === ""){
        await firestore.collection("users").doc(this.docName).delete();
        firestore.collection("followings").where("from","==",from).get().then(async (querySnapshot)=>{
          querySnapshot.forEach(doc=>batch.update(doc.ref,{isPublic:false}));
          batch.commit();
        });
      }else{
        const idMatcher = profile.match(/(\d{4}-\d{4}|\d{8})/);
        const iidxId = idMatcher ? idMatcher[0].replace("-","") : "";
        await firestore.collection("users").doc(this.docName).set({
          timeStamp: timeFormatter(3),
          serverTime:this.time(),
          uid:this.docName,
          iidxId:iidxId,
          displayName:displayName,
          profile:profile,
          photoURL:photoURL,
          arenaRank:arenaRank,
          totalBPI:await this.totalBPI(),
        });
        firestore.collection("followings").where("from","==",from).get().then(async (querySnapshot)=>{
          querySnapshot.forEach(doc=>batch.update(doc.ref,{isPublic:true,}));
          batch.commit();
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

  async searchAllRival(input:string,saving:boolean = false){
    try{
      if(!input || (input === "" && saving !== true)){ return null;}
      const res = await firestore.collection("users").orderBy("displayName").startAt(input).endAt(input + "\uf8ff").get();
      const res2 = await firestore.collection("users").orderBy("iidxId").startAt(input).endAt(input + "\uf8ff").get();
      if(!res.empty || !res2.empty){
        return res.docs.concat(res2.docs);
      }else{
        return null;
      }
    }catch(e){
      console.log(e);
      return null;
    }
  }

  async recentUpdated(last:rivalStoreData|null,endAt:rivalStoreData|null,arenaRank:string):Promise<rivalStoreData[]>{
    let query:firebase.firestore.Query = firestore.collection("users").orderBy("serverTime", "desc");
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
    return await this.getUsers(query);
  }

  async recommendedByBPI(exactBPI?:number){
    let query:firebase.firestore.Query = firestore.collection("users").orderBy("totalBPI", "desc");
    const total = exactBPI || await getTotalBPI();
    const downLimit = total > 60 ? 50 : total - 5;
    const upLimit = total > 50 ? 100 : total + 5;
    query = query.where("totalBPI",">=",downLimit);
    query = query.where("totalBPI","<=",upLimit);
    query = query.limit(20);
    return (await this.getUsers(query)).sort((a,b)=>{
      return Math.abs(total - (Number(a.totalBPI) || -15)) - Math.abs(total - (Number(b.totalBPI) || -15))
    })
  }

  async addedAsRivals():Promise<rivalStoreData[]>{
    try{
      const user = this.authInfo();
      if(!user || !user.uid){
        throw new Error("No UserData Has Been Retrieved");
      }
      const to:firebase.firestore.DocumentReference = firestore.collection("users").doc(user.uid);
      let query:firebase.firestore.Query = firestore.collection("followings").orderBy("updatedAt", "desc");
      query = query.where("to","==",to).where("isPublic","==",true).where("version","==",_currentStore());
      query = query.limit(20);
      const res = await query.get();
      if(!res.empty){
        let result:any[] = [];
        for(let i = 0; i < res.docs.length; ++i){
          const d = res.docs[i].data();
          d.from = (await d.from.get()).data();
          result.push(d.from);
        }
        return result;
      }else{
        throw new Error("No Rivals Found");
      }
    }catch(e){
      console.log(e);
      return [];
    }
  }

  private async getUsers(query:firebase.firestore.Query){
    try{
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
        return d;
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

  async syncLoadRival(isDescribed = false){
    try{
      const uid = this.docName;
      if(!uid){
        throw new Error("Not logged in");
      }
      let from:firebase.firestore.DocumentReference = firestore.collection("users").doc(uid);
      const res = await firestore.collection("followings").where("from","==",from).where("version","==",_currentStore()).get();
      if(!res.empty){
        let result:any[] = [];
        for(let i = 0; i < res.docs.length; ++i){
          const d = res.docs[i].data();
          if(isDescribed){
            d.to = (await d.to.get()).data();
          }
          result.push(d);
        }
        return result;
      }else{
        return [];
      }
    }catch(e){
      console.log(e);
      return [];
    }
  }

  async syncUploadRival(rivals:DBRivalStoreData[],willAdd = true,isPublic:string = ""){
    const uid = this.docName;
    let from:firebase.firestore.DocumentReference = firestore.collection("users").doc(uid);
    const batch = firestore.batch();
    return firestore.collection("followings").where("from","==",from).get().then(async (querySnapshot)=>{
      querySnapshot.forEach(doc=>{
        batch.delete(doc.ref);
      })
      if(willAdd){
        for(let i = 0; i < rivals.length; ++i){
          let to:firebase.firestore.DocumentReference = firestore.collection("users").doc(rivals[i]["uid"]);
          const target = firestore.collection("followings").doc();
          batch.set(target,{
            from:from,
            isPublic:!!isPublic,
            to:to,
            updatedAt:this.time(),
            version:_currentStore()
          });
        }
      }
      try {
        await batch.commit();
        return true;
      }
      catch (_e) {
        return false;
      }
    });
  }

  async syncUploadOne(rivalId:string,isPublic:string = ""):Promise<boolean>{
    try{
      const uid = this.docName;
      let from:firebase.firestore.DocumentReference = firestore.collection("users").doc(uid);
      let to:firebase.firestore.DocumentReference = firestore.collection("users").doc(rivalId);
      const data = await firestore.collection("followings").where("from","==",from).where("to","==",to).get();
      if(!data.empty){
        return false;
      }
      firestore.collection("followings").add({
        from:from,
        isPublic:!!isPublic,
        to:to,
        updatedAt:this.time(),
        version:_currentStore()
      });
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }

  async syncNotificationItem(syncData:any):Promise<void>{
    let from:firebase.firestore.DocumentReference = firestore.collection("users").doc(syncData.from.id);
    let to:firebase.firestore.DocumentReference = firestore.collection("users").doc(syncData.to.uid);
    const token = await new messanger().getToken();
    this.updateToken(syncData.from.id,token);
    return await firestore.collection("followings").where("from","==",from).where("to","==",to).get().then(async (query)=>{
      if(!query.empty){
        const data = query.docs[0];
        data.ref.update({
          notify:syncData.notify
        });
      }
    });
  }

  updateToken = async (id:string,token:string)=>firestore.collection("notifyTokens").doc(id).set({uid:id,token:token});

  async syncDeleteOne(rivalId:string):Promise<boolean>{
    try{
      const uid = this.docName;
      let from:firebase.firestore.DocumentReference = firestore.collection("users").doc(uid);
      let to:firebase.firestore.DocumentReference = firestore.collection("users").doc(rivalId);
      await firestore.collection("followings").where("from","==",from).where("to","==",to).get().then((querySnapshot)=>{
        querySnapshot.forEach((doc)=>doc.ref.delete());
      });
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }
/*
  async dBatch(){
    try{
      let batch = firestore.batch();
      const snapshots = await firestore.collection("users").get();
      snapshots.docs.map((doc,index)=>{
        if((index + 1) % 500 === 0){
          batch.commit();
          batch = firestore.batch();
        }
        const data = doc.data();
        if(data.profile){
          const idMatcher = data.profile.match(/(\d{4}-\d{4}|\d{8})/);
          const iidxId = idMatcher ? idMatcher[0].replace("-","") : "";
          batch.update(doc.ref,{
            iidxId:iidxId,
          })
        }
      });
      batch.commit();
    }catch(e){
      console.log(e);
    }

  }
*/
}
