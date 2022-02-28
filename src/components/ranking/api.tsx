import { httpsCallable } from "../firebase";
import { toDate } from '@/components/common/timeFormatter';
import { _currentStore } from "../settings";
import fbActions from "../firebase/actions";

export const getRanking = async (showFinished: boolean = false, offset: number = 0) => {

  let data = {
    includeRank: false,
    currentUser: true,
    version: _currentStore(),
    uId: "",
    onlyJoined: false,
    offset: offset,
    split: 10,
    order: showFinished ? "desc" : "asc",
    endDate: toDate(new Date()),
    showFinished: showFinished,
  };
  return await httpsCallable(`ranking`, `rankSearch`, data);

}

export const expandUserData = async (data: any) => {
  let newData = [];
  for (let i = 0; i < data.length; ++i) {
    const item = data[i];
    const user = await new fbActions().searchByExactId(item.authorId);
    item.authorRef = user;
    newData.push(item);
  }
  return newData;
}
