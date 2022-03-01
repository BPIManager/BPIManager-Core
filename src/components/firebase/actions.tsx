import fb, { twitter, firestore, google } from ".";
import timeFormatter from "../common/timeFormatter";
import { scoresDB, scoreHistoryDB } from "../indexedDB";
import platform from "platform";
import firebase from 'firebase/app';
import { rivalStoreData, scoreData, DBRivalStoreData, songData } from "../../types/data";
import bpiCalcuator from '../bpi';
import { _currentStore } from "../settings";
import { messanger } from "./message";
import { difficultyDiscriminator } from "../songs/filter";
import totalBPI from "../bpi/totalBPI";
import { getRadar, radarData } from "../stats/radar";
import statMain from "../stats/main";

export default class fbActions {

  async authWithTwitter(): Promise<void> {
    fb.auth().signInWithRedirect(twitter);
  }

  async authWithGoogle(): Promise<void> {
    return fb.auth().signInWithRedirect(google);
  }

  authInfo(): firebase.User | null {
    return fb.auth().currentUser || JSON.parse(localStorage.getItem("social") || "{}");
  }

  currentIcon(): string {
    const t = fb.auth().currentUser;
    if (t) {
      return t.photoURL || "";
    } else {
      return "";
    }
  }

  async updateProfileIcon(): Promise<firebase.auth.UserCredential | null> {
    const self = this;
    return fb.auth().getRedirectResult().then(async function(_result) {
      if (_result && _result.user && _result.additionalUserInfo && _result.additionalUserInfo.profile) {
        const pid = _result.additionalUserInfo.providerId;
        const t = fb.auth().currentUser;
        let p = "";
        if (pid === "google.com") {
          p = (_result.additionalUserInfo.profile as { picture: string }).picture;
        } else if (pid === "twitter.com") {
          p = (_result.additionalUserInfo.profile as { profile_image_url_https: string }).profile_image_url_https;
        }
        await self.setUserCollection().doc(_result.user.uid).set({
          photoURL: p
        }, { merge: true });
        if (t) {
          await t.updateProfile({
            photoURL: p
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

  auth(): firebase.auth.Auth {
    return fb.auth();
  }

  logout(): Promise<void> {
    localStorage.removeItem("social");
    return fb.auth().signOut();
  }

  getSelfUserData() {
    return this.setUserCollection().doc(this.docName).get();
  }

  setUserCollection(): firebase.firestore.CollectionReference {
    this.v2SetUserCollection();
    return firestore.collection(this.name);
  }

  v2SetUserCollection(): this {
    this.name = "users";
    return this;
  }

  private name: string = "";
  private docName: string = "";

  setColName(name: string): this {
    this.name = name;
    return this;
  }

  setDocName(docName: string): this {
    this.docName = docName;
    return this;
  }

  type(): string {
    return `${platform.os} / ${platform.name}`
  }

  time() {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  setTwitterId(id: string) {
    const docRef = firestore.collection(this.name).doc(this.docName);
    return docRef.set({
      twitter: id,
      uid: this.docName,
    }, { merge: true });
  }

  async save(isRegisteredAs = "") {
    if (!this.name || !this.docName) { return { error: true, date: null, reason: "ログインしていません" }; }
    console.log("writing", this.docName, this.name);
    const self = this;
    const s = await new scoresDB().getAll();
    if (s.length === 0) {
      return { error: true, date: null, reason: "送信できる楽曲データが存在しません" };
    }
    const docRef = firestore.collection(self.name).doc(self.docName);
    const userRef = firestore.collection("users").doc(self.docName);
    return firestore.runTransaction(async function(transaction) {
      await transaction.get(docRef).then(async function(doc) {
        const newDoc = {
          timeStamp: timeFormatter(3),
          serverTime: self.time(),
          type: self.type(),
          scores: s,
          scoresHistory: await new scoreHistoryDB().getAllInSpecificVersion(),
        };
        if (doc.exists) {
          transaction.update(docRef, newDoc);
        } else {
          transaction.set(docRef, newDoc);
        }
        const v = "totalBPIs." + _currentStore();
        const totalBPI = await self.totalBPI();
        const _radar = (await getRadar()).reduce((group: any, item: radarData) => {
          if (!group) group = {};
          group[item.title] = item.TotalBPI;
          return group;
        }, {});
        console.log("signed as :" + isRegisteredAs);
        if (isRegisteredAs !== "") {
          transaction.update(userRef, {
            timeStamp: timeFormatter(3),
            serverTime: self.time(),
            totalBPI: totalBPI,
            [v]: totalBPI,
            radar: _radar,
            versions: firebase.firestore.FieldValue.arrayUnion(_currentStore()),
          });
        }
      });
    }).then(() => {
      return { error: false, date: timeFormatter(3), reason: "Success" };
    }).catch((e: any) => {
      console.log(e);
      return { error: true, date: null, reason: e.message };
    });
  }

  async totalBPI(): Promise<number> {
    const bpi = new bpiCalcuator();
    bpi.setTraditionalMode(0);
    const statsAPI = await new statMain(12).load();
    const totalBPI = bpi.setSongs(statsAPI.at(), statsAPI.at().length);
    return totalBPI;
  }

  async load() {
    try {
      if (!this.name) { return { error: true, data: null } }
      const dName = this.docName;
      const res = await firestore.collection(this.name).doc(dName).get();
      if (res.exists) {
        return res.data();
      } else {
        return null;
      }
    } catch (e: any) {
      console.log(e);
      return null;
    }
  }

  async saveName(displayName: string, profile: string, photoURL: string, arenaRank: string, showNotes?: boolean, isPublic?: boolean, _iidxId?: string, _twitterId?: string) {
    try {
      if (!this.name || !this.docName) { return { error: true, date: null }; }
      if (displayName.length > 16 || profile.length > 140) {
        throw new Error("too long error");
      }
      if (displayName.length !== 0 && !/^[a-zA-Z0-9]+$/g.test(displayName)) {
        throw new Error("invalid inputs error");
      }
      const duplication = await this.searchRival(displayName, true);
      if (duplication !== null && displayName !== "" && duplication.uid !== this.docName) {
        throw new Error("already used error");
      }
      const batch = firestore.batch();
      const from = this.setUserCollection().doc(this.docName);
      if (displayName === "" || !isPublic) {
        await this.setUserCollection().doc(this.docName).update({ isPublic: false });
        firestore.collection("followings").where("from", "==", from).get().then(async (querySnapshot) => {
          querySnapshot.forEach(doc => batch.update(doc.ref, { isPublic: false }));
          batch.commit();
        });
      } else {
        const idMatcher = profile.match(/(\d{4}-\d{4}|\d{8})/);
        let iidxId = idMatcher ? idMatcher[0].replace(/\D/g, "") : "";
        if (_iidxId) iidxId = _iidxId;
        const v = "totalBPIs." + _currentStore();
        await this.setUserCollection().doc(this.docName).update({
          timeStamp: timeFormatter(3),
          isPublic: isPublic || false,
          serverTime: this.time(),
          uid: this.docName,
          iidxId: iidxId,
          twitter: _twitterId,
          displayName: displayName,
          displayNameSearch: displayName.toLowerCase(),
          profile: profile,
          photoURL: photoURL,
          arenaRank: arenaRank,
          showNotes: showNotes || false,
          totalBPI: await this.totalBPI(),
          [v]: await this.totalBPI(),
          versions: firebase.firestore.FieldValue.arrayUnion(_currentStore()),
        });
        firestore.collection("followings").where("from", "==", from).get().then(async (querySnapshot) => {
          querySnapshot.forEach(doc => batch.update(doc.ref, { isPublic: true, }));
          batch.commit();
        });
      }
      return { error: false, date: timeFormatter(3) };
    } catch (e: any) {
      console.log(e);
      return { error: true, date: null };
    }
  }

  async searchByExactId(input: string) {
    try {
      if (!input) { return [0]; }
      const res = await this.setUserCollection().doc(input).get();
      if (res.exists) {
        return res.data();
      } else {
        return null;
      }
    } catch (e: any) {
      console.log(e);
      return null;
    }
  }

  async searchRival(input: string, saving: boolean = false) {
    try {
      if (!input || (input === "" && saving !== true)) { return [0]; }
      const res = await this.setUserCollection().where("displayName", "==", input).get();
      if (!res.empty && res.size === 1) {
        return res.docs[0].data();
      } else {
        return null;
      }
    } catch (e: any) {
      console.log(e);
      return null;
    }
  }

  async searchAllRival(input: string): Promise<any[]> {
    try {
      const zenToHan = (zen: string) => {
        return zen.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
          return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
        });
      }
      if (!input || (input === "")) { return []; }
      const inputID = zenToHan(input).replace(/\D/g, "") || ""; // 数字のみ絞り出し、数字が無い場合（=空欄）は検索しない
      const inputHN = zenToHan(input).toLowerCase();
      let q1 = this.setUserCollection().orderBy("displayNameSearch").startAt(inputHN).endAt(inputHN + "\uf8ff");
      q1 = this.versionQuery(q1);
      const res = await q1.get();
      if (inputID) {
        let q2 = this.setUserCollection().orderBy("iidxId").startAt(inputID).endAt(inputID + "\uf8ff");
        q2 = this.versionQuery(q2);
        const res2 = await q2.get();
        if (!res.empty || !res2.empty) {
          return res.docs.concat(res2.docs);
        }
      }
      return res.docs;
    } catch (e: any) {
      console.log(e);
      return [];
    }
  }

  async recentUpdated(last: rivalStoreData | null, endAt: rivalStoreData | null, arenaRank: string, sortStyle: number = 0): Promise<rivalStoreData[]> {
    let query: firebase.firestore.Query = this.setUserCollection();
    if (sortStyle === 1) {
      query = query.orderBy("totalBPIs." + _currentStore(), "desc");
    } else {
      query = query.orderBy("serverTime", "desc");
    }
    if (arenaRank !== "すべて") {
      query = query.where("arenaRank", "==", arenaRank);
    }
    query = this.versionQuery(query);
    if (last) {
      if (sortStyle === 0) {
        query = query.startAfter(last.serverTime);
      } else if (sortStyle === 1) {
        query = query.startAfter(last["totalBPIs"] ? last["totalBPIs"][_currentStore()] : -15);
      }
    }
    if (endAt) {
      query = query.endAt(endAt.serverTime);
    }
    if (!endAt) {
      query = query.limit(10);
    }
    return await this.getUsers(query);
  }

  versionQuery = (query: firebase.firestore.Query) => {
    return query.where("isPublic", "==", true).where("versions", "array-contains", _currentStore());
  }

  async recommendedByBPI(exactBPI?: number | null, searchBy: string = "総合BPI") {
    const searchQuery = () => {
      switch (searchBy) {
        case "総合BPI":
          return "totalBPIs." + _currentStore();
        default:
          return "radar." + searchBy;
      }
    }
    const q = searchQuery();
    let query: firebase.firestore.Query = this.setUserCollection().orderBy(q, "desc");
    const total = exactBPI || (await new totalBPI().load()).currentVersion();
    const downLimit = total > 60 ? 50 : total - 5;
    const upLimit = total > 50 ? 100 : total + 5;
    query = query.where(q, ">=", downLimit);
    query = query.where(q, "<=", upLimit);
    query = this.versionQuery(query);
    query = query.limit(30);
    if (searchBy !== "総合BPI") {
      return await this.getUsers(query);
    }
    return (await this.getUsers(query)).sort((a, b) => {
      return Math.abs(total - (Number(a.totalBPI) || -15)) - Math.abs(total - (Number(b.totalBPI) || -15))
    })
  }

  async addedAsRivals(): Promise<rivalStoreData[]> {
    try {
      const user = this.authInfo();
      if (!user || !user.uid) {
        throw new Error("No UserData Has Been Retrieved");
      }
      const to: firebase.firestore.DocumentReference = this.setUserCollection().doc(user.uid);
      let query: firebase.firestore.Query = firestore.collection("followings").orderBy("updatedAt", "desc");
      query = query.where("to", "==", to).where("isPublic", "==", true).where("version", "==", _currentStore());
      query = query.limit(20);
      const res = await query.get();
      if (!res.empty) {
        let result: any[] = [];
        for (let i = 0; i < res.docs.length; ++i) {
          const d = res.docs[i].data();
          d.from = (await d.from.get()).data();
          result.push(d.from);
        }
        return result;
      } else {
        throw new Error("No Rivals Found");
      }
    } catch (e: any) {
      console.log(e);
      return [];
    }
  }

  private async getUsers(query: firebase.firestore.Query) {
    try {
      const res = await query.get();
      if (!res.empty && res.size >= 1) {
        const d = res.docs.reduce((groups: rivalStoreData[], item: firebase.firestore.QueryDocumentSnapshot) => {
          const body = item.data();
          if (body.displayName && body.displayName !== "" && body.serverTime) {
            groups.push(body as rivalStoreData);
          }
          return groups;
        }, []);
        return d;
      } else {
        return [];
      }
    } catch (e: any) {
      console.log(e);
      return [];
    }
  }

  async searchRivalByUid(input: string) {
    try {
      if (!input || input === "") { return [0]; }
      const res = await this.setUserCollection().where("uid", "==", input).get();
      if (!res.empty && res.size === 1) {
        return res.docs[0].data();
      } else {
        return null;
      }
    } catch (e: any) {
      console.log(e);
      return null;
    }
  }

  async updateArenaRank(uid:string,newRank:string){
    return await this.setUserCollection().doc(uid).update({
      timeStamp: timeFormatter(3),
      serverTime: this.time(),
      arenaRank: newRank,
    });
  }

  async createShare(score: scoreData, uid: string) {
    return await firestore.collection("shared").add(Object.assign(score, {
      uid: uid,
      updatedAt: timeFormatter(3)
    }));
  }

  async syncLoadRival(isDescribed = false) {
    try {
      const uid = this.docName;
      if (!uid) {
        throw new Error("Not logged in");
      }
      let from: firebase.firestore.DocumentReference = this.setUserCollection().doc(uid);
      const res = await firestore.collection("followings").where("from", "==", from).where("version", "==", _currentStore()).get();
      if (!res.empty) {
        let result: any[] = [];
        for (let i = 0; i < res.docs.length; ++i) {
          const d = res.docs[i].data();
          if (isDescribed) {
            d.to = (await d.to.get()).data();
          }
          result.push(d);
        }
        return result;
      } else {
        return [];
      }
    } catch (e: any) {
      console.log(e);
      return [];
    }
  }

  async syncUploadRival(rivals: DBRivalStoreData[], willAdd = true, isPublic: string = "") {
    const uid = this.docName;
    let from: firebase.firestore.DocumentReference = this.setUserCollection().doc(uid);
    const batch = firestore.batch();
    return firestore.collection("followings").where("from", "==", from).get().then(async (querySnapshot) => {
      querySnapshot.forEach(doc => {
        batch.delete(doc.ref);
      })
      if (willAdd) {
        for (let i = 0; i < rivals.length; ++i) {
          let to: firebase.firestore.DocumentReference = this.setUserCollection().doc(rivals[i]["uid"]);
          const target = firestore.collection("followings").doc();
          batch.set(target, {
            from: from,
            isPublic: !!isPublic,
            to: to,
            updatedAt: this.time(),
            version: _currentStore()
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

  async syncUploadOne(rivalId: string, isPublic: string = ""): Promise<boolean> {
    try {
      const uid = this.docName;
      let from: firebase.firestore.DocumentReference = this.setUserCollection().doc(uid);
      let to: firebase.firestore.DocumentReference = this.setUserCollection().doc(rivalId);
      const data = await firestore.collection("followings").where("from", "==", from).where("to", "==", to).get();
      if (!data.empty) {
        return false;
      }
      firestore.collection("followings").add({
        from: from,
        isPublic: !!isPublic,
        to: to,
        updatedAt: this.time(),
        version: _currentStore()
      });
      return true;
    } catch (e: any) {
      console.log(e);
      return false;
    }
  }

  async syncNotificationItem(syncData: any): Promise<void> {
    let from: firebase.firestore.DocumentReference = this.setUserCollection().doc(syncData.from.id);
    let to: firebase.firestore.DocumentReference = this.setUserCollection().doc(syncData.to.uid);
    const token = await new messanger().getToken();
    this.updateToken(syncData.from.id, token);
    return await firestore.collection("followings").where("from", "==", from).where("to", "==", to).get().then(async (query) => {
      if (!query.empty) {
        const data = query.docs[0];
        data.ref.update({
          notify: syncData.notify
        });
      }
    });
  }

  updateToken = async (id: string, token: string) => firestore.collection("notifyTokens").doc(id).set({ uid: id, token: token });

  async syncDeleteOne(rivalId: string): Promise<boolean> {
    try {
      const uid = this.docName;
      let from: firebase.firestore.DocumentReference = this.setUserCollection().doc(uid);
      let to: firebase.firestore.DocumentReference = this.setUserCollection().doc(rivalId);
      await firestore.collection("followings").where("from", "==", from).where("to", "==", to).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => doc.ref.delete());
      });
      return true;
    } catch (e: any) {
      console.log(e);
      return false;
    }
  }

  toggleAddedNotify = async (uid: string, newState: boolean) => {
    try {
      return await firestore.collection("notifyWhenAddedAsRivals").doc(uid).set({
        addedNotify: newState,
        uid: uid,
        reference: this.setUserCollection().doc(uid)
      });
    } catch (e: any) {
      console.log(e);
    }
  }
  /*
  async dBatch(){
    try{
      let batch = firestore.batch();
      const snapshots = await this.setUserCollection().get();
      snapshots.docs.map((doc,index)=>{
        if((index + 1) % 500 === 0){
          batch.commit();
          batch = firestore.batch();
        }
        const data = doc.data();
        if(data.displayName && data.totalBPI){
          console.log(data.totalBPI);
          const v = "totalBPIs.27";
          batch.update(doc.ref,{
            [v]:data.totalBPI,
            versions:firebase.firestore.FieldValue.arrayUnion("27"),
          })
        }
      });
      batch.commit();
    }catch(e:any){
      console.log(e);
    }
  }
  */

  // user notes function

  loadNotes(songInfo: songData, lastLoaded: any = null, mode: number = 0) {
    const orderBy = mode === 1 ? "userBPI" : mode === 0 ? "wroteAt" : "likeCount";
    if (lastLoaded) {
      return firestore.collection("notes").where("isSingle", "==", songInfo.dpLevel === "0").where("songName", "==", songInfo.title).where("songDiff", "==", difficultyDiscriminator(songInfo.difficulty)).orderBy(orderBy, "desc").startAfter(lastLoaded).get();
    } else {
      return firestore.collection("notes").where("isSingle", "==", songInfo.dpLevel === "0").where("songName", "==", songInfo.title).where("songDiff", "==", difficultyDiscriminator(songInfo.difficulty)).orderBy(orderBy, "desc").get();
    }
  }

  loadFavedNotes(last = null) {
    if (last) {
      return firestore.collection("notes").orderBy("likeCount", "desc").limit(20).startAfter(last).get();
    }
    return firestore.collection("notes").orderBy("likeCount", "desc").limit(20).get();
  }

  loadRecentNotes(last = null) {
    if (last) {
      return firestore.collection("notes").orderBy("wroteAt", "desc").limit(20).startAfter(last).get();
    }
    return firestore.collection("notes").orderBy("wroteAt", "desc").limit(20).get();
  }

  loadMyNotes() {
    const auth = this.authInfo();
    if (!auth) return null;
    const uid = auth.uid;
    if (!uid) return null;
    const doc = this.setUserCollection().doc(uid);
    return firestore.collection("notes").where("uid", "==", doc).orderBy("wroteAt", "desc").get();
  }

  loadUserNotes(uid: string, sort = 0) {
    const s = sort === 0 ? "wroteAt" : "likeCount";
    const doc = this.setUserCollection().doc(uid);
    return firestore.collection("notes").where("uid", "==", doc).orderBy(s, "desc").get();
  }

  loadLikedNotes() {
    const auth = this.authInfo();
    if (!auth) return null;
    const uid = auth.uid;
    if (!uid) return null;
    return firestore.collection("notesLiked").where("uid", "==", uid).orderBy("likedAt", "desc").limit(20).get();
  }

  getUserReference(id: string) {
    return this.setUserCollection().doc(id);
  }

  async likeNotes(targetId: string): Promise<number> {
    const auth = this.authInfo();
    if (!auth) return 0;
    try {
      const target = firestore.collection("notes").doc(targetId);
      const uid = auth.uid;
      const alreadyExists = await firestore.collection("notesLiked").where("uid", "==", uid).where("target", "==", target).get();
      const targetData = (await target.get()).data();
      let batch = firestore.batch();
      if (!targetData) {
        alert("対象データが存在しません。");
        return 0;
      }
      if (alreadyExists.size === 0) {
        //add
        const newLike = firestore.collection("notesLiked").doc();
        batch.update(target, { likeCount: firebase.firestore.FieldValue.increment(1) });
        batch.set(newLike, {
          likedAt: this.time(),
          isSingle: targetData.isSingle,
          songDiff: targetData.songDiff,
          songName: targetData.songName,
          memo: targetData.memo,
          target: target,
          uid: uid,
        });
        batch.commit();
        return 1;
      } else {
        //remove
        batch.update(target, { likeCount: firebase.firestore.FieldValue.increment(-1) });
        alreadyExists.forEach(function(doc) {
          batch.delete(doc.ref);
        });
        batch.commit();
        return -1;
      }
    } catch (e: any) {
      console.log(e);
      return 0;
    }
  }

  // for sitemap generator

  async loadUserList() {
    const t = await this.setUserCollection().get();
    if (t.size > 0) {
      return t.docs;
    } else {
      return [];
    }
  }

  async loadNoteList() {
    const t = await firestore.collection("notes").get();
    if (t.size > 0) {
      return t.docs;
    } else {
      return [];
    }
  }

}
