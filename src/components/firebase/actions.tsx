import fb, { auth, twitter, google } from ".";
import {
  Auth,
  User,
  UserCredential,
  getAdditionalUserInfo,
  signOut,
  updateProfile,
  getRedirectResult,
  signInWithRedirect,
} from "firebase/auth";
import {
  getFirestore,
  FieldValue,
  DocumentReference,
  Query,
  QueryDocumentSnapshot,
  addDoc,
  arrayUnion,
  runTransaction,
  setDoc,
  serverTimestamp,
  updateDoc,
  getDoc,
  doc,
  increment,
  collection,
  writeBatch,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  startAfter,
  startAt,
  endAt,
  limit,
  WriteBatch,
  DocumentData,
  deleteField,
} from "firebase/firestore";
import timeFormatter from "../common/timeFormatter";
import { scoresDB, scoreHistoryDB } from "../indexedDB";
import platform from "platform";
import { rivalStoreData, DBRivalStoreData, songData } from "../../types/data";
import bpiCalcuator from "../bpi";
import { _currentStore, _setLastSyncDate } from "../settings";
import { messanger } from "./message";
import { difficultyDiscriminator } from "../songs/filter";
import totalBPI from "../bpi/totalBPI";
import { getRadar, radarData } from "../stats/radar";
import statMain from "../stats/main";

const db = getFirestore(fb);

export default class fbActions {
  async authWithTwitter(): Promise<void> {
    return signInWithRedirect(auth, twitter);
  }

  async authWithGoogle(): Promise<void> {
    return signInWithRedirect(auth, google);
  }

  authInfo(): User | null {
    return (
      auth.currentUser || JSON.parse(localStorage.getItem("social") || "{}")
    );
  }

  currentIcon(): string {
    const t = auth.currentUser;
    if (t) {
      return t.photoURL || "";
    } else {
      return "";
    }
  }

  async updateProfileIcon(): Promise<UserCredential | null> {
    return getRedirectResult(auth)
      .then(async function (_result) {
        if (auth.currentUser) {
          if (_result && _result.user) {
            const d = getAdditionalUserInfo(_result);
            if (d && d.profile) {
              const pid = d.providerId;
              let p = "";
              if (pid === "google.com") {
                p = (d.profile as { picture: string }).picture;
              } else if (pid === "twitter.com") {
                p = (d.profile as { profile_image_url_https: string })
                  .profile_image_url_https;
              }
              await setDoc(
                doc(db, "users", _result.user.uid),
                {
                  photoURL: p,
                },
                {
                  merge: true,
                }
              );
              await updateProfile(auth.currentUser, {
                photoURL: p,
              });
            }
          }
        }
        return _result;
      })
      .catch((error) => {
        console.log(error);
        alert(error.message ? error.message : error);
        return null;
      });
  }

  auth(): Auth {
    return auth;
  }

  logout(): Promise<void> {
    localStorage.removeItem("social");
    return signOut(auth);
  }

  getSelfUserData() {
    return getDoc(doc(collection(db, this.setUserCollection()), this.docName));
  }

  setUserCollection(): string {
    this.v2SetUserCollection();
    return this.name;
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
    return `${platform.os} / ${platform.name}`;
  }

  time(): FieldValue {
    return serverTimestamp();
  }

  setTwitterId(id: string) {
    const docRef = doc(collection(db, this.setUserCollection(), this.docName));
    return setDoc(
      docRef,
      {
        twitter: id,
        uid: this.docName,
      },
      { merge: true }
    );
  }

  async save(isRegisteredAs = "") {
    if (!this.name || !this.docName) {
      return { error: true, date: null, reason: "ログインしていません" };
    }
    console.log("writing", this.docName, this.name);
    const self = this;
    const s = await new scoresDB().getAll();
    if (s.length === 0) {
      return {
        error: true,
        date: null,
        reason: "送信できる楽曲データが存在しません",
      };
    }
    const docRef = doc(collection(db, self.name), self.docName);
    const userRef = doc(collection(db, "users"), self.docName);
    return await runTransaction(db, async function (transaction) {
      await transaction.get(docRef).then(async function (doc) {
        const newDoc = {
          timeStamp: timeFormatter(3),
          serverTime: self.time(),
          type: self.type(),
          scores: s,
          scoresHistory: await new scoreHistoryDB().getAllInSpecificVersion(),
        };
        if (doc.exists()) {
          transaction.update(docRef, newDoc);
        } else {
          transaction.set(docRef, newDoc);
        }
        const v = "totalBPIs." + _currentStore();
        const totalBPI = await self.totalBPI();
        const _radar = (await getRadar()).reduce(
          (group: any, item: radarData) => {
            if (!group) group = {};
            group[item.title] = item.TotalBPI;
            return group;
          },
          {}
        );
        console.log("signed as :" + isRegisteredAs);
        if (isRegisteredAs !== "") {
          transaction.update(userRef, {
            timeStamp: timeFormatter(3),
            serverTime: self.time(),
            totalBPI: totalBPI,
            [v]: totalBPI,
            radar: _radar,
            versions: arrayUnion(_currentStore()),
          });
        }
      });
    })
      .then(() => {
        return { error: false, date: timeFormatter(3), reason: "Success" };
      })
      .catch((e: any) => {
        console.log(e);
        return { error: true, date: null, reason: e.message };
      });
  }

  async totalBPI(): Promise<number> {
    const bpi = new bpiCalcuator();
    bpi.setTraditionalMode(0);
    const statsAPI = await new statMain(12).load();
    const totalBPI = await bpi.setSongs(statsAPI.at());
    return totalBPI;
  }

  async load() {
    try {
      if (!this.name) {
        return { error: true, data: null };
      }
      const dName = this.docName;
      const res = await getDoc(doc(db, this.name, dName));
      if (res.exists()) {
        return res.data();
      } else {
        return null;
      }
    } catch (e: any) {
      console.log(e);
      return null;
    }
  }

  async saveUserData(newData: any) {
    try {
      if (!this.name || !this.docName) {
        return { error: true, date: null };
      }

      if (newData.displayName.length > 16 || newData.profile.length > 140) {
        throw new Error("too long error");
      }
      if (
        newData.displayName.length !== 0 &&
        !/^[a-zA-Z0-9]+$/g.test(newData.displayName)
      ) {
        throw new Error("invalid inputs error");
      }

      const duplication = await this.searchRival(newData.displayName, true);

      if (
        duplication !== null &&
        newData.displayName !== "" &&
        duplication.uid !== this.docName
      ) {
        throw new Error("already used error");
      }

      const batch = writeBatch(db);
      const targetDoc = doc(db, this.setUserCollection(), this.docName);
      if (newData.displayName === "" || !newData.isPublic) {
        await updateDoc(targetDoc, { isPublic: false });
        this.setFollowState(batch, targetDoc, false);
      } else {
        const idMatcher = newData.profile.match(/(\d{4}-\d{4}|\d{8})/);
        let iidxId = idMatcher ? idMatcher[0].replace(/\D/g, "") : "";
        if (iidxId) newData.iidxId = iidxId;
        const totalBPI = await this.totalBPI();

        const data = {
          timeStamp: timeFormatter(3),
          isPublic: newData.isPublic || false,
          serverTime: this.time(),
          uid: this.docName,
          iidxId: newData.iidxId,
          twitter: newData.twitter,
          twitterSearch: newData.twitter ? newData.twitter.toLowerCase() : "",
          displayName: newData.displayName,
          displayNameSearch: newData.displayName.toLowerCase(),
          profile: newData.profile,
          photoURL: newData.photoURL,
          arenaRank: newData.arenaRank,
          area: newData.area || "-",
          showNotes: newData.showNotes || false,
          scores: deleteField(),
          scoresHistory: deleteField(),
          totalBPI: totalBPI,
          versions: arrayUnion(_currentStore()),
        };

        const target = await getDoc(targetDoc);
        if (target.exists()) {
          const v = "totalBPIs." + _currentStore();
          await updateDoc(targetDoc, {
            ...data,
            [v]: totalBPI,
          });
        } else {
          await setDoc(
            targetDoc,
            {
              ...data,
              totalBPIs: {
                [_currentStore()]: totalBPI,
              },
            },
            { merge: true }
          );
        }
        this.setFollowState(batch, targetDoc, true);
      }
      return { error: false, date: timeFormatter(3) };
    } catch (e: any) {
      console.log(e);
      return { error: true, date: null };
    }
  }

  async setFollowState(
    batch: WriteBatch,
    from: DocumentReference<DocumentData>,
    state: boolean
  ) {
    const _query = query(
      collection(db, "followings"),
      where("from", "==", from)
    );
    getDocs(_query).then(async (querySnapshot) => {
      querySnapshot.forEach((doc) =>
        batch.update(doc.ref, { isPublic: state })
      );
      batch.commit();
    });
  }

  async searchByExactId(input: string) {
    try {
      if (!input) {
        return [0];
      }
      const res = await getDoc(doc(db, this.setUserCollection(), input));
      if (res.exists()) {
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
      if (!input || (input === "" && saving !== true)) {
        return [0];
      }
      const _query = query(
        collection(db, this.setUserCollection()),
        where("displayName", "==", input)
      );
      const res = await getDocs(_query);
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
        return zen.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
          return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
        });
      };
      if (!input || input === "") {
        return [];
      }
      let ans: any[] = [];
      const inputID = zenToHan(input).replace(/\D/g, "") || ""; // 数字のみ絞り出し、数字が無い場合（=空欄）は検索しない
      const inputHN = zenToHan(input).toLowerCase();
      let q1 = [
        orderBy("displayNameSearch"),
        startAt(inputHN),
        endAt(inputHN + "\uf8ff"),
        ...this.versionQuery(),
      ];
      const res = await getDocs(
        query(collection(db, this.setUserCollection()), ...q1)
      );
      ans = ans.concat(res.docs);
      let qt = [
        orderBy("twitterSearch"),
        startAt(inputHN),
        endAt(inputHN + "\uf8ff"),
        ...this.versionQuery(),
      ];
      const at = await getDocs(
        query(collection(db, this.setUserCollection()), ...qt)
      );
      if (!at.empty) {
        ans = ans.concat(at.docs);
      }
      if (inputID) {
        let q2 = [
          orderBy("iidxId"),
          startAt(inputID),
          endAt(inputID + "\uf8ff"),
          ...this.versionQuery(),
        ];
        const res2 = await getDocs(
          query(collection(db, this.setUserCollection()), ...q2)
        );
        if (!res.empty || !res2.empty) {
          return ans.concat(res2.docs);
        }
      }
      return ans;
    } catch (e: any) {
      console.log(e);
      return [];
    }
  }

  async recentUpdated(
    last: rivalStoreData | null,
    _endData: rivalStoreData | null,
    arenaRank: string,
    sortStyle: number = 0
  ): Promise<rivalStoreData[]> {
    const qus: any[] = [];
    if (sortStyle === 1) {
      qus.push(orderBy("totalBPIs." + _currentStore(), "desc"));
    } else {
      qus.push(orderBy("serverTime", "desc"));
    }
    if (arenaRank !== "すべて") {
      qus.push(where("arenaRank", "==", arenaRank));
    }
    qus.push(...this.versionQuery());
    if (last) {
      if (sortStyle === 0) {
        qus.push(startAfter(last.serverTime));
      } else if (sortStyle === 1) {
        qus.push(
          startAfter(
            last["totalBPIs"] ? last["totalBPIs"][_currentStore()] : -15
          )
        );
      }
    }
    if (_endData) {
      qus.push(endAt(_endData.serverTime));
    }
    if (!_endData) {
      qus.push(limit(10));
    }
    let _query: Query = query(collection(db, this.setUserCollection()), ...qus);
    return await this.getUsers(_query);
  }

  versionQuery = () => {
    return [
      where("isPublic", "==", true),
      where("versions", "array-contains", _currentStore()),
    ];
  };

  async recommendedByBPI(
    exactBPI?: number | null,
    searchBy: string = "総合BPI",
    _limit: number = 30,
    willAsc: boolean = false
  ) {
    const searchQuery = () => {
      switch (searchBy) {
        case "総合BPI":
          return "totalBPIs." + _currentStore();
        default:
          return "radar." + searchBy;
      }
    };
    const qus: any[] = [];
    const q = searchQuery();
    let total =
      exactBPI || (await (await new totalBPI().load()).currentVersion());
    if (searchBy !== "総合BPI") {
      const radar = await getRadar();
      const target = radar.find((item) => item.title === searchBy);
      if (target && target.TotalBPI) {
        total = target.TotalBPI;
      }
    }
    const downLimit = total > 60 ? 50 : total - 1;
    const upLimit = total > 50 ? 100 : total + 5;
    qus.push(where(q, ">=", downLimit));
    qus.push(where(q, "<=", upLimit));
    qus.push(...this.versionQuery());
    if (willAsc && searchBy === "総合BPI") {
      qus.push(orderBy(q, "asc"));
    } else {
      qus.push(orderBy(q, "desc"));
    }
    let _query: Query = query(collection(db, this.setUserCollection()), ...qus);
    const res = await this.getUsers(_query);
    if (searchBy !== "総合BPI") {
      return res.slice(0, 30);
    }
    return res
      .sort((a: any, b: any) => {
        return (
          Math.abs(total - (Number(a.totalBPI) || -15)) -
          Math.abs(total - (Number(b.totalBPI) || -15))
        );
      })
      .slice(0, _limit);
  }

  async addedAsRivals(): Promise<rivalStoreData[]> {
    try {
      const user = this.authInfo();
      if (!user || !user.uid) {
        throw new Error("No UserData Has Been Retrieved");
      }
      const to: DocumentReference = doc(db, this.setUserCollection(), user.uid);
      const qus = [
        orderBy("updatedAt", "desc"),
        where("to", "==", to),
        where("isPublic", "==", true),
        where("version", "==", _currentStore()),
        limit(20),
      ];
      const res = await getDocs(query(collection(db, "followings"), ...qus));
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

  private async getUsers(query: Query) {
    try {
      const res = await getDocs(query);
      if (!res.empty && res.size >= 1) {
        const d = res.docs.reduce(
          (groups: rivalStoreData[], item: QueryDocumentSnapshot) => {
            const body = item.data();
            if (
              body.displayName &&
              body.displayName !== "" &&
              body.serverTime
            ) {
              groups.push(body as rivalStoreData);
            }
            return groups;
          },
          []
        );
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
      if (!input || input === "") {
        return [0];
      }
      const res = await getDoc(doc(db, this.setUserCollection(), input));
      if (res.exists()) {
        return res.data();
      } else {
        return null;
      }
    } catch (e: any) {
      console.log(e);
      return null;
    }
  }

  async updateArenaRank(uid: string, newRank: string) {
    return await updateDoc(doc(db, this.setUserCollection(), uid), {
      timeStamp: timeFormatter(3),
      serverTime: this.time(),
      arenaRank: newRank,
    });
  }

  async syncLoadRival(isDescribed = false) {
    try {
      const uid = this.docName;
      if (!uid) {
        throw new Error("Not logged in");
      }
      let from: DocumentReference = doc(db, this.setUserCollection(), uid);
      const res = await getDocs(
        query(
          collection(db, "followings"),
          where("from", "==", from),
          where("version", "==", _currentStore())
        )
      );
      if (!res.empty) {
        let result: any[] = [];
        for (let i = 0; i < res.docs.length; ++i) {
          const d = res.docs[i].data();
          if (isDescribed) {
            d.to = (await getDoc(d.to)).data();
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

  async syncUploadRival(
    rivals: DBRivalStoreData[],
    willAdd = true,
    isPublic: string = ""
  ) {
    const uid = this.docName;
    let from: DocumentReference = doc(db, this.setUserCollection(), uid);
    const batch = writeBatch(db);
    const _query = query(
      collection(db, "followings"),
      where("from", "==", from)
    );
    return getDocs(_query).then(async (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      if (willAdd) {
        for (let i = 0; i < rivals.length; ++i) {
          let to: DocumentReference = doc(
            db,
            this.setUserCollection(),
            rivals[i]["uid"]
          );
          const target = doc(collection(db, "followings"));
          batch.set(target, {
            from: from,
            isPublic: !!isPublic,
            to: to,
            updatedAt: this.time(),
            version: _currentStore(),
          });
        }
      }
      try {
        await batch.commit();
        return true;
      } catch (_e) {
        return false;
      }
    });
  }

  async syncUploadOne(
    rivalId: string,
    isPublic: string = ""
  ): Promise<boolean> {
    try {
      const uid = this.docName;
      let from: DocumentReference = doc(db, this.setUserCollection(), uid);
      let to: DocumentReference = doc(db, this.setUserCollection(), rivalId);
      const data = await getDocs(
        query(
          collection(db, "followings"),
          ...[where("from", "==", from), where("to", "==", to)]
        )
      );
      if (!data.empty) {
        return false;
      }
      addDoc(collection(db, "followings"), {
        from: from,
        isPublic: !!isPublic,
        to: to,
        updatedAt: this.time(),
        version: _currentStore(),
      });
      return true;
    } catch (e: any) {
      console.log(e);
      return false;
    }
  }

  async syncNotificationItem(syncData: any): Promise<void> {
    let from: DocumentReference = doc(
      db,
      this.setUserCollection(),
      syncData.from.id
    );
    let to: DocumentReference = doc(
      db,
      this.setUserCollection(),
      syncData.to.uid
    );
    const token = await new messanger().getToken();
    this.updateToken(syncData.from.id, token);
    const _query = query(
      collection(db, "followings"),
      where("from", "==", from),
      where("to", "==", to)
    );
    return await getDocs(_query).then(async (query) => {
      if (!query.empty) {
        const data = query.docs[0];
        updateDoc(data.ref, {
          notify: syncData.notify,
        });
      }
    });
  }

  updateToken = async (id: string, token: string) =>
    await setDoc(doc(db, "notifyTokens", id), { uid: id, token: token });

  async syncDeleteOne(rivalId: string): Promise<boolean> {
    try {
      const uid = this.docName;
      let from: DocumentReference = doc(db, this.setUserCollection(), uid);
      let to: DocumentReference = doc(db, this.setUserCollection(), rivalId);
      await getDocs(
        query(
          collection(db, "followings"),
          where("from", "==", from),
          where("to", "==", to)
        )
      ).then((querySnapshot) => {
        querySnapshot.forEach((doc) => deleteDoc(doc.ref));
      });
      return true;
    } catch (e: any) {
      console.log(e);
      return false;
    }
  }

  toggleAddedNotify = async (uid: string, newState: boolean) => {
    try {
      return await setDoc(
        doc(db, "notifyWhenAddedAsRivals", uid),
        {
          addedNotify: newState,
          uid: uid,
          reference: doc(db, this.setUserCollection(), uid),
        },
        { merge: true }
      );
    } catch (e: any) {
      console.log(e);
    }
  };

  // user notes function

  loadNotes(songInfo: songData, lastLoaded: any = null, mode: number = 0) {
    const _orderBy =
      mode === 1 ? "userBPI" : mode === 0 ? "wroteAt" : "likeCount";
    const qus = [
      where("isSingle", "==", songInfo.dpLevel === "0"),
      where("songName", "==", songInfo.title),
      where("songDiff", "==", difficultyDiscriminator(songInfo.difficulty)),
      orderBy(_orderBy, "desc"),
    ];
    if (lastLoaded) qus.push(startAfter(lastLoaded));
    return getDocs(query(collection(db, "notes"), ...qus));
  }

  loadFavedNotes(last = null) {
    const qus = [orderBy("likeCount", "desc"), limit(20)];
    if (last) qus.push(startAfter(last));
    return getDocs(query(collection(db, "notes"), ...qus));
  }

  loadRecentNotes(last = null) {
    const qus = [orderBy("wroteAt", "desc"), limit(20)];
    if (last) qus.push(startAfter(last));
    return getDocs(query(collection(db, "notes"), ...qus));
  }

  loadMyNotes() {
    const auth = this.authInfo();
    if (!auth) return null;
    const uid = auth.uid;
    if (!uid) return null;
    const _d = doc(db, this.setUserCollection(), uid);
    return getDocs(
      query(
        collection(db, "notes"),
        ...[where("uid", "==", _d), orderBy("wroteAt", "desc")]
      )
    );
  }

  loadUserNotes(uid: string, sort = 0) {
    const s = sort === 0 ? "wroteAt" : "likeCount";
    const _d = doc(db, this.setUserCollection(), uid);
    return getDocs(
      query(
        collection(db, "notes"),
        ...[where("uid", "==", _d), orderBy(s, "desc")]
      )
    );
  }

  loadLikedNotes() {
    const auth = this.authInfo();
    if (!auth) return null;
    const uid = auth.uid;
    if (!uid) return null;
    return getDocs(
      query(
        collection(db, "notesLiked"),
        ...[where("uid", "==", uid), orderBy("likedAt", "desc"), limit(20)]
      )
    );
  }

  getUserReference(id: string) {
    return doc(db, this.setUserCollection(), id);
  }

  async likeNotes(targetId: string): Promise<number> {
    const auth = this.authInfo();
    if (!auth) return 0;
    try {
      const target = doc(db, "notes", targetId);
      const uid = auth.uid;
      const alreadyExists = await getDocs(
        query(
          collection(db, "notesLiked"),
          ...[where("uid", "==", uid), where("target", "==", target)]
        )
      );
      const targetData = (await getDoc(target)).data();
      let batch = writeBatch(db);
      if (!targetData) {
        alert("対象データが存在しません。");
        return 0;
      }
      if (alreadyExists.size === 0) {
        //add
        const newLike = doc(collection(db, "notesLiked"));
        batch.update(target, { likeCount: increment(1) });
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
        batch.update(target, { likeCount: increment(-1) });
        alreadyExists.forEach(function (doc) {
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

  deleteAll() {}

  async setSaveMeta(
    uid: string,
    store: string,
    isSingle: number,
    whenDownload: boolean = false
  ) {
    if (!whenDownload) {
      const targetDoc = doc(db, "savedataMeta", uid);
      await setDoc(
        targetDoc,
        {
          [store + "_" + isSingle]: serverTimestamp(),
        },
        { merge: true }
      );
    }
    const x = await this.loadSaveMeta(uid);
    if (x && x[store + "_" + isSingle]) {
      _setLastSyncDate(x[store + "_" + isSingle].toDate());
    }
    return;
  }

  async loadSaveMeta(uid: string) {
    const targetDoc = doc(db, "savedataMeta", uid);
    return await (await getDoc(targetDoc)).data();
  }
}
