import dayjs from "dayjs";
import 'dayjs/locale/ja';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isBetween from 'dayjs/plugin/isBetween';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.locale('ja');
dayjs.extend(isBetween);
dayjs.extend(weekOfYear);
dayjs.extend(relativeTime);

const timeFormatter = (type = 0,date:string|Date|number = new Date()):string =>{
  const m = dayjs(date);
  switch (type){
    case 0:
    return m.format("YYYY-MM-DD HH:mm");
    case 1:
    return m.format("YYYYMMDD");
    case 2:
    return m.format("HHmmss");
    case 3:
    return m.format("YYYY-MM-DD HH:mm:ss");
    case 4:
    return m.format("YYYY/MM/DD");
    case 5:
    return m.startOf("week").format("YYYY/MM/DD");
    case 6:
    return m.format("YYYY/MM");
    case 7:
    return m.format("YYYY-MM-DD");
  }
  return "";
}

export const timeCompare = (from:dayjs.Dayjs|string|Date,to:dayjs.Dayjs|string|number,type:"s"|"day" = "s") =>{
  return dayjs(from).diff(to,type);
}
export const untilDate = (to:dayjs.Dayjs|string|number,withSuffix:boolean = true) =>{
  const date = Math.abs(dayjs().diff(to,"d"));

  if(withSuffix === false){
    return date;
  }

  if(date === 0){
    return Math.abs(dayjs().diff(to,"hour")) + "時間"
  }
  return date + "日";
}

export const toUnixTime = (t:string|dayjs.Dayjs|Date)=>dayjs(t).unix();

export const toDate = (t:string|dayjs.Dayjs|Date)=>dayjs(t).toDate().toString();

export const toMoment = (t:string|Date|dayjs.Dayjs)=>dayjs(t).format("YYYYMMDD");

export const toMomentHHMM = (t:string|Date|dayjs.Dayjs)=>dayjs(t).format("YYYYMMDD HH:mm");

export const isSameDay = (a:string|Date|dayjs.Dayjs,b:string|Date|dayjs.Dayjs = new Date())=>{
  return toMoment(a) === toMoment(b);
}

export const isSameWeek = (a:string|Date|dayjs.Dayjs,b:string|Date|dayjs.Dayjs)=>{
  return dayjs(a).week() === dayjs(b).week();
}

export const _isBetween = (date:string|Date,rfrom:string|Date,rto:string)=>{
  return dayjs(date).isBetween(rfrom,rto,"day", '[]');
}

export const subtract = (num:number,r:"day"|"month")=>{
  return dayjs().subtract(num, r);
}

export const d_add = (num:number,r:"day"|"month")=>{
  return dayjs().add(num, r);
}

export const isBefore = (date:string,month:number = 1) =>{
  return dayjs(date).isBefore(subtract(month, 'month'))
}

export const isBeforeSpecificDate = (date:string|Date|dayjs.Dayjs|number,comparison:string|Date|dayjs.Dayjs|number)=>{
  return dayjs(date).isBefore(comparison);
}

export const updatedTime = (timeStamp:string,withoutSuffix:boolean = false)=>{
  return dayjs(timeStamp).fromNow(withoutSuffix);
}

export default timeFormatter;
