import moment from "moment";

const timeFormatter = (type = 0,date = new Date()) =>{
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
}

export default timeFormatter;
