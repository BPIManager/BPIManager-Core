import { noimg } from "@/components/common";
import { _currentStore, _isSingle } from "@/components/settings";
import { DBRivalStoreData, rivalScoreData } from "@/types/data";
import storageWrapper from "./wrapper";

export default class db extends storageWrapper {
  async getAll(): Promise<DBRivalStoreData[]> {
    try {
      return this.rivalLists
        .where("[isSingle+storedAt]")
        .equals([_isSingle(), _currentStore()])
        .toArray();
    } catch (e: any) {
      return [];
    }
  }

  async getRivalLength(): Promise<number> {
    try {
      return (
        await this.rivalLists
          .where("[isSingle+storedAt]")
          .equals([_isSingle(), _currentStore()])
          .toArray()
      ).length;
    } catch (e: any) {
      return 0;
    }
  }

  async getAllUserScores(): Promise<rivalScoreData[]> {
    try {
      return this.rivals
        .where({ isSingle: _isSingle(), storedAt: _currentStore() })
        .toArray();
    } catch (e: any) {
      return [];
    }
  }

  async getAllScores(uid: string): Promise<rivalScoreData[]> {
    try {
      return this.rivals
        .where({
          rivalName: uid,
          isSingle: _isSingle(),
          storedAt: _currentStore(),
        })
        .toArray();
    } catch (e: any) {
      return [];
    }
  }

  async getAllScoresWithTitle(
    title: string,
    difficulty: string
  ): Promise<rivalScoreData[]> {
    try {
      return (await this.rivals.toArray()).filter(
        (item) =>
          item.isSingle === _isSingle() &&
          item.storedAt === _currentStore() &&
          item.title === title &&
          item.difficulty === difficulty
      );
    } catch (e: any) {
      return [];
    }
  }

  async getAllRivalUid() {
    return (await this.getAll()).reduce(
      (groups: string[], item: DBRivalStoreData) => {
        groups.push(item.uid);
        return groups;
      },
      []
    );
  }

  async getDisplayData(uid: string): Promise<{ name: string; icon: string }> {
    try {
      const t = await this.rivalLists.where({ uid: uid }).toArray();
      if (t.length > 0) {
        return { name: t[0]["rivalName"], icon: t[0]["photoURL"] };
      } else {
        return { name: "UNKNOWN", icon: noimg };
      }
    } catch (e: any) {
      return { name: "UNKNOWN", icon: noimg };
    }
  }

  async addUser(meta: any, body: any[]): Promise<any> {
    return await this.transaction(
      "rw",
      this.rivals,
      this.rivalLists,
      async () => {
        this.rivalLists.put(meta);
        return Promise.all(
          body.map((item) =>
            this.rivals.put({
              rivalName: meta.uid,
              title: item.title,
              difficulty: item.difficulty,
              difficultyLevel: item.difficultyLevel,
              exScore: item.exScore,
              missCount: item.missCount,
              clearState: item.clearState,
              storedAt: item.storedAt,
              isSingle: item.isSingle,
              updatedAt: item.updatedAt,
            })
          )
        );
      }
    ).catch((e) => {
      console.log(e);
      return null;
    });
  }

  async removeUser(meta: any): Promise<any> {
    return await this.transaction(
      "rw",
      this.rivals,
      this.rivalLists,
      async () => {
        this.rivalLists.delete(meta.uid);
        return Promise.all(
          (await this.rivals.where("rivalName").equals(meta.uid).toArray()).map(
            (item) =>
              this.rivals.delete([
                item.title,
                item.difficulty,
                item.storedAt,
                item.isSingle,
                item.rivalName,
              ])
          )
        );
      }
    ).catch((e) => {
      console.log(e);
      return null;
    });
  }

  async deleteAll() {
    return await this.transaction(
      "rw",
      this.rivals,
      this.rivalLists,
      async () => {
        this.rivalLists.clear();
        this.rivals.clear();
      }
    );
  }
}
