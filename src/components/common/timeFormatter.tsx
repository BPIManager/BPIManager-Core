import moment from "moment";

const timeFormatter = (type = 0,date = new Date()):string =>{
  const m = moment(date);
  switch (type){
    case 0:
    return m.format("YYYY-MM-DD HH:mm");
    case 1:
    return m.format("YYYYMMDD");
    case 2:
    return m.format("HHmmss");
    case 3:
    return m.format("YYYY-MM-DD HH:mm:ss");
  }
  return "";
}

export const timeCompare = (from:moment.Moment,to:moment.Moment) =>{
  return from.diff(to,"seconds");
}

export const toMoment = (t:string|Date|moment.Moment)=>moment(t).format("YYYYMMDD");

export default timeFormatter;
