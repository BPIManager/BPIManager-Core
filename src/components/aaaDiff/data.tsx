import aaaDiffCalc from "./exec";

export interface CLOrigin {"title":string,"difficulty":string,"bpi":number};
export interface CLBody extends CLOrigin{"currentBPI":number,"exScore":number};
export interface CLInt {[key:string]:CLBody[]};
export interface CLOrigInt {[key:string]:CLOrigin[]};

export const AAADifficulty = async()=> await new aaaDiffCalc().exec();
