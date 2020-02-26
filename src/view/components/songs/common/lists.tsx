import { favsDB } from "../../../../components/indexedDB";
import { DBLists } from "../../../../types/lists";

export default class favLists {

  async loadLists():Promise<DBLists[]>{
    return await new favsDB().getAllLists();
  }

  async loadSavedLists(title:string,difficulty:string):Promise<DBLists[]>{
    return await new favsDB().getListsFromSong(title,difficulty);
  }

  async toggleLists(title:string,difficulty:string,target:number,willAdd:boolean):Promise<boolean>{
    try{
      if(willAdd){
        await new favsDB().addItemToList(title,difficulty,target);
      }else{
        await new favsDB().removeItemFromList(title,difficulty,target);
      }
      await new favsDB().setListLength(target,willAdd);
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }


}
