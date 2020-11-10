import { firestore } from "..";
export default class weeklyStore{

  async currentRanking(){
    const data = await firestore.collection("weekly").where("ongoing","==",true).get();
    if(data.empty){
      return null;
    }else{
      return data.docs[0];
    }
  }

    async getRanking(id:string){
      const data = await firestore.collection("weekly").doc(id).get();
      if(!data.exists){
        return null;
      }else{
        return data;
      }
    }

  async currentRankingBody(id:string){
    return await firestore.collection("weekly").doc(id).collection("ranking").get();
  }

}
