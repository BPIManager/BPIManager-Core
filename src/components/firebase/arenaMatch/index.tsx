import fb, { auth, twitter, google } from "../";
import { Auth, User, UserCredential, getAdditionalUserInfo, signOut, updateProfile, getRedirectResult, signInWithRedirect } from "firebase/auth";
import {
  getFirestore, query, addDoc, getDoc,
  arrayUnion, runTransaction, setDoc, serverTimestamp, where, doc, orderBy,
  collection, onSnapshot, limit,
} from "firebase/firestore";
import totalBPI from "../../bpi/totalBPI";
import timeFormatter, { subtract } from "../../common/timeFormatter";
import fbActions from "../actions";
import { messanger } from "../message";

const db = getFirestore(fb);

interface createDataType { title: string, description: string | null, arenaRank: string, isPublicKey: boolean, isBPLMode: boolean }

export default class {

  async create(data: createDataType) {
    try {
      if (!data.title) return;
      const fbA = new fbActions();
      const docRef = doc(collection(db, "arenaMatchList"));
      const notifyRef = doc(collection(db, "arenaMatchNotify"),docRef.id);

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
      return docRef.id;
    } catch (e) {
      console.log(e);
      return;
    }
  }

  detail = (docId: string) => doc(collection(db, "arenaMatchList"), docId);
  listenDetail = (docId: string, func: any) => onSnapshot(this.detail(docId), func);

  list = () => query(collection(db, "arenaMatchList"), where("updatedAt", ">", new Date(timeFormatter(3, subtract(1, "day")))), orderBy("updatedAt", "desc"));

  realtime = onSnapshot;

  getMessages = (matchId: string) => query(collection(db, "arenaMatchBody", matchId, "chat"), orderBy("createdAt", "desc"), limit(100));

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

}
