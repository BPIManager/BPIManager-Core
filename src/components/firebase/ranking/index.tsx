import fb from "..";
import { getFirestore,query,doc,getDoc,getDocs,collection,where } from "firebase/firestore";

const db = getFirestore(fb);

export default class weeklyStore {

  async currentRanking() {
    const data = await getDocs(query(
      collection(db,"weekly"),
      where("ongoing", "==", true)
    ));
    if (data.empty) {
      return null;
    } else {
      return data.docs[0];
    }
  }

  async getRanking(id: string) {
    const data = await getDoc(doc(db,"weekly",id));
    if (!data.exists) {
      return null;
    } else {
      return data;
    }
  }

  async currentRankingBody(id: string) {
    return await getDoc(
      doc(collection(db,"weekly",id,"ranking"))
    )
  }

}
