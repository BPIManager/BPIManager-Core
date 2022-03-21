import fb from "../";
import {
  getFirestore, query,
  setDoc, serverTimestamp, where, doc, orderBy, updateDoc,
  collection, onSnapshot, limit, deleteDoc
} from "firebase/firestore";
import timeFormatter, { subtract, d_add } from "../../common/timeFormatter";
import fbActions from "../actions";
import { messanger } from "../message";

const db = getFirestore(fb);

interface createDataType { title: string, description: string | null, arenaRank: string, isPublicKey: boolean, isBPLMode: boolean }

export default class fbArenaMatch {

  async create(data: createDataType) {
    try {
      if (!data.title) return;
      const fbA = new fbActions();
      const docRef = doc(collection(db, "arenaMatchList"));
      const notifyRef = doc(collection(db, "arenaMatchNotify"), docRef.id);

      const user = fbA.authInfo();
      if (!user) return;


      const mesToken = await new messanger().getToken();

      const userData = await fbA.setDocName(user.uid).getSelfUserData()
      if (!userData.exists()) return;
      await setDoc(docRef, Object.assign(data, {
        admin: userData.data(),
        uid: user.uid,
        updatedAt: serverTimestamp(),
        matchId: docRef.id,
      }), { merge: true });
      await setDoc(notifyRef, Object.assign(data, {
        uid: user.uid,
        updatedAt: serverTimestamp(),
        matchId: docRef.id,
        mesToken: mesToken,
      }), { merge: true });
      await this.enterChat(docRef.id,
        `正常にルームが作成されました。\n対戦希望のプレイヤーを待つほか、SNSでプレイヤーを募ることができます。\n
        Android 端末をご利用の場合、BPIM を閉じても、他のプレイヤーがチャットしたときに通知でお知らせします。\n
        チャット欄では、各プレイヤーのアイコンをタップしてプレイ情報を閲覧できます。`, {
          displayName: "サーバーからのメッセージ",
          photoURL: "https://bpi.poyashi.me/images/icons/icon-192x192.png",
          arenaRank: "-",
          totalBPI: -15,
          twitter: "BPIManager",
          profile: "SERVER",
          uid: ""
        });
      const d = doc(collection(db, "arenaMatchBody"), docRef.id);
      setDoc(d, {
        uid: user.uid
      }, { merge: true });
      return docRef.id;
    } catch (e) {
      console.log(e);
      alert(String(e))
      return;
    }
  }

  getLatency = async () => {
    try {
      const sendTime = new Date().getTime();
      const f = await fetch("https://worldtimeapi.org/api/timezone/Asia/Tokyo");
      const timeobj = await f.json();
      const endTime = new Date().getTime();
      const fixedTime = parseInt(String(timeobj.unixtime * 1000 + (endTime - sendTime) / 2), 10);
      const localTime = new Date().getTime()
      const offset = fixedTime - localTime;
      return offset;
    } catch (e) {
      console.log(e);
      return 0;
    }
  }

  detail = (docId: string) => doc(collection(db, "arenaMatchList"), docId);
  listenDetail = (docId: string, func: any) => onSnapshot(this.detail(docId), func);

  list = async () => {
    const offset = await this.getLatency();
    return query(
      collection(db, "arenaMatchList"),
      where("updatedAt", ">", new Date(timeFormatter(3, subtract(3, "hour", new Date().getTime() + offset)))),
      orderBy("updatedAt", "desc")
    );
  }

  getSelfMatches = async (myId: string) => {
    const offset = await this.getLatency();
    return query(
      collection(db, "arenaMatchList"),
      where("uid", "==", myId), where("updatedAt", ">", new Date(timeFormatter(3, subtract(3, "hour", new Date().getTime() + offset))))
    );
  }

  realtime = onSnapshot;

  getMessages = (matchId: string) => query(
    collection(db, "arenaMatchBody", matchId, "chat"),
    orderBy("createdAt", "desc"), limit(100)
  );

  randChat = async (matchId: string, userData: any) => {
    const getRand = (r: string[]) => r[Math.floor(Math.random() * r.length)];
    const stages = ["2 STAGE", "3 STAGE", "4 STAGE"];
    const levels = ["制限なし", "先鋒戦 LEVEL 8~10", "中堅戦 LEVEL 10~11", "大将戦 LEVEL12"];
    const fumen = ["制限なし", "NOTES", "CHORD", "PEAK", "CHARGE", "SCRATCH", "SOF-LAN"];

    return this.enterChat(matchId, `/rand :\nステージ:${getRand(stages)}\nレベル:${getRand(levels)}\n譜面傾向:${getRand(fumen)}`, userData);
  }

  enterChat = async (matchId: string, text: string, userData: any) => {
    try {
      const col = collection(db, "arenaMatchBody", matchId, "chat");
      const d = doc(col);
      await setDoc(d, {
        matchId: matchId,
        body: text,
        uid: userData.uid,
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        arenaRank: userData.arenaRank || "-",
        totalBPI: userData.totalBPI || -15,
        twitter: userData.twitter || "",
        profile: userData.profile || "",
        createdAt: serverTimestamp(),
      });
      return d.id;
    } catch (e) {
      console.log(e);
      return;
    }
  }

  setTimer = async (timeAfter: string, matchId: string) => {

    const m = await this.getLatency();
    const now = new Date().getTime() + m;

    const time = d_add(Number(timeAfter), "second", now);
    const docRef = doc(collection(db, "arenaMatchList"), matchId);

    updateDoc(docRef, {
      startAt: new Date(timeFormatter(3, time))
    });

    return 0;
  }

  deleteRoom = async (matchId: string) => {
    await deleteDoc(doc(collection(db, "arenaMatchList"), matchId));
    await deleteDoc(doc(collection(db, "arenaMatchNotify"), matchId));
    return true;
  }

}
