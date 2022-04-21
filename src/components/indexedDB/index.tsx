import storageWrapper from "./db/wrapper";
import __fvdb from "./db/favs";
import __scdb from "./db/scores";
import __schdb from "./db/scoreHistory";
import __sdb from "./db/songs";
import __rldb from "./db/rivalLists";
import __importer from "./db/import";

export default storageWrapper;
export const favsDB = __fvdb;
export const scoresDB = __scdb;
export const scoreHistoryDB = __schdb;
export const songsDB = __sdb;
export const rivalListsDB = __rldb;
export const importer = __importer;
