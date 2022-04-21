import { alternativeImg } from "@/components/common";
import timeFormatter from "@/components/common/timeFormatter";
import { DBLists } from "@/types/lists";
import storageWrapper from "./wrapper";

export default class db extends storageWrapper {
  async getAllLists(): Promise<DBLists[]> {
    try {
      return await this.favLists.toArray();
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async getListFromNum(num: number): Promise<DBLists | null> {
    try {
      const t = await this.favLists.where({ num: num }).toArray();
      if (t.length > 0) {
        return t[0];
      } else {
        return null;
      }
    } catch (e: any) {
      console.error(e);
      return null;
    }
  }

  async addList(
    title: string = "new list",
    description: string = "",
    icon: string = ""
  ) {
    try {
      return this.favLists.add({
        num: new Date().getTime(),
        title: title,
        description: description,
        icon: icon || alternativeImg(title),
        length: 0,
        updatedAt: timeFormatter(3),
      });
    } catch (e: any) {
      console.log(e);
      return "";
    }
  }

  async editList(
    target: number,
    title: string = "new list",
    description: string = "",
    icon: string = ""
  ) {
    try {
      return this.favLists.where({ num: target }).modify({
        title: title,
        description: description,
        icon: icon || alternativeImg(title),
        updatedAt: timeFormatter(3),
      });
    } catch (e: any) {
      console.log(e);
      return "";
    }
  }

  async setListLength(targetNum: number, willInc: boolean) {
    try {
      const len = await this.getListLen(targetNum);
      if (len === -1) {
        throw new Error();
      }
      await this.favLists
        .where("num")
        .equals(targetNum)
        .modify({
          length: willInc ? len + 1 : len - 1,
          updatedAt: timeFormatter(3),
        });
      return true;
    } catch (e: any) {
      console.log(e);
      return false;
    }
  }

  async getListsFromSong(title: string, difficulty: string) {
    try {
      return this.favSongs
        .where("[title+difficulty]")
        .equals([title, difficulty])
        .toArray();
    } catch (e: any) {
      return [];
    }
  }

  async removeList(target: number) {
    try {
      await this.favLists.where({ num: target }).delete();
      await this.favSongs.where("listedOn").equals(target).delete();
    } catch (e: any) {
      return;
    }
  }

  async getListNumber(title: string): Promise<number> {
    try {
      const list = await this.favLists.where("title").equals(title).toArray();
      if (list.length > 0) {
        return list[0].num;
      } else {
        throw new Error();
      }
    } catch (e: any) {
      return -1;
    }
  }

  async getListLen(targetNum: number): Promise<number> {
    try {
      const list = await this.favLists.where("num").equals(targetNum).toArray();
      if (list.length > 0) {
        return list[0].length;
      } else {
        throw new Error();
      }
    } catch (e: any) {
      return -1;
    }
  }

  async getListSum(): Promise<number> {
    try {
      return (await this.favLists.toArray()).length;
    } catch (e: any) {
      return -1;
    }
  }

  async getAllItemsInAList(num: number): Promise<any[]> {
    try {
      return await this.favSongs.where({ listedOn: num }).toArray();
    } catch (e: any) {
      return [];
    }
  }

  async addItemToList(title: string, difficulty: string, target: number) {
    try {
      return this.favSongs.add({
        title: title,
        difficulty: difficulty,
        listedOn: target,
      });
    } catch (e: any) {
      console.log(e);
      return;
    }
  }

  async removeItemFromList(title: string, difficulty: string, target: number) {
    try {
      return this.favSongs
        .where({
          title: title,
          difficulty: difficulty,
          listedOn: target,
        })
        .delete();
    } catch (e: any) {
      console.log(e);
      return;
    }
  }
}
