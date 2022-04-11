import { scoresDB } from '@/components/indexedDB';
import { _isSingle } from "@/components/settings";
import { scoreData } from '@/types/data';
import { versionConverter } from "@/components/common/versions";
export interface scoreByVersion {
  name: string,
  value: number,
}

export const apply = (sort: number, isDesc: boolean, data: scoreData[] = []) => {
  return data.sort((a, b): number => {
    const p = (): boolean => {
      switch (sort) {
        case 0:
          return b.title.localeCompare(a.title, "ja", { numeric: true }) > -1;
        case 1:
          return Number(b.storedAt) - Number(a.storedAt) > 0;
        default:
        case 2:
          return b.exScore - a.exScore > 0;
        case 3:
          return b.currentBPI - a.currentBPI > 0
      }
    }
    return (isDesc ? p() : !p()) ? 1 : -1
  });
}

export const myBest = async (targetLevel: string = "12", sort: number = 0, isDesc: boolean = true, fullName: boolean = false): Promise<{
  scoreData: any[],
  scoreByVersion: any[]
}> => {
  const isSingle = _isSingle();
  let scoreDataKeys: { [key: string]: scoreData } = {};
  const data = (await new scoresDB(isSingle).getAllVersions()).filter(item => item.difficultyLevel === targetLevel);
  for (let key in data) {
    const d = data[key];
    const title = d["title"] + d["difficulty"];
    if (!scoreDataKeys[title] || d["exScore"] > scoreDataKeys[title]["exScore"]) {
      scoreDataKeys[title] = d;
    }
  }
  let v: { [key: string]: number } = {};
  return {
    scoreData: apply(sort, isDesc, Object.keys(scoreDataKeys).reduce((group: scoreData[], item) => {
      group.push(scoreDataKeys[item]);
      if (v[scoreDataKeys[item]["storedAt"]]) {
        v[scoreDataKeys[item]["storedAt"]]++;
      } else {
        v[scoreDataKeys[item]["storedAt"]] = 1;
      }
      return group;
    }, [])),
    scoreByVersion: Object.keys(v).reduce((group: scoreByVersion[], item: string) => {
      group.push({
        name: fullName ? (versionConverter[item] || "UNKNOWN") : item,
        value: v[item]
      })
      return group;
    }, [])
  };
}
