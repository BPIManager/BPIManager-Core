export const _isSingle = ()=>{
  return !localStorage.getItem("isSingle") || localStorage.getItem("isSingle") === "1" || localStorage.getItem("isSingle") === "true" ? 1 : 0;
}

export const _currentStore = ()=>{
  return localStorage.getItem("currentStore") || "27";
}

export const _lang = ()=>{
  return localStorage.getItem("lang") || "ja";
}

export const _currentVersion = ()=>{
  return localStorage.getItem("lastDefFileVer") || "undefined";
}

export const _goalBPI = ()=>{
  return Number(localStorage.getItem("goalBPI")) || 0;
}

export const _goalPercentage = ()=>{
  return Number(localStorage.getItem("goalPercentage")) || 0;
}

export const _currentTheme = ()=>{
  return localStorage.getItem("theme") || "light";
}

export const _area = ()=>{
  return Number(localStorage.getItem("area")) || 0;
}

export const _currentViewComponents = ()=>{
  return localStorage.getItem("viewComponents") || "last,djLevel";
}

export const _currentBPIDefinition = ()=>{
  return Number(localStorage.getItem("BPIDefinition")) || 1;
}

export const _currentDefaultPage = ()=>{
  return localStorage.getItem("defaultPage") || "home";
}

export const _setDefaultPage = (url:string = defaultURL)=>{
  return localStorage.setItem("defaultPage",url);
}

export const _traditionalMode = ()=>{
  return Number(localStorage.getItem("traditionalMode")) || 0;
}

export const _setCurrentViewComponents = (array:string[]):string[]=>{
  array = array.filter((x, i, self)=>self.indexOf(x) === i && x !== "none");
  if(array.length === 0){ array.push("none"); }
  localStorage.setItem("viewComponents",array.join());
  return array;
}

const defaultURL = "https://proxy.poyashi.me/?type=bpi";

export const _currentDefinitionURL = ()=>{
  return localStorage.getItem("defURL") || defaultURL;
}

export const _setCurrentDefinitionURL = (url:string = defaultURL)=>{
  return localStorage.setItem("defURL",url);
}

export const _autoSync = ()=>{
  return localStorage.getItem("autoSync") ? true : false;
}

export const _setAutoSync = (isEnable:boolean)=>{
  return isEnable ? localStorage.setItem("autoSync","true") : localStorage.removeItem("autoSync");
}

export const _setTraditionalMode = (newState:number = 0)=>{
  return localStorage.setItem("traditionalMode",String(newState));
}

export const isEnableTweetButton = ()=>{
  const t = localStorage.getItem("isEnableTweetButton");
  return t ? (t === "true" ? true : false) : true;
}

export const setEnableTweetButton = (newState:boolean)=>{
  return localStorage.setItem("isEnableTweetButton",String(newState));
}

export const _currentStoreWithFullName = ()=>{
  const t:string = localStorage.getItem("currentStore") || "27";
  return t === "26" ? "26 Rootage" : "27 HEROIC VERSE"
}

export const _chartColor = ()=>{
  const c = _currentTheme();
  if(c === "dark" || c === "deepsea"){
    return "#eee";
  }
  if(c === "light"){
    return "#666";
  }

}

export const _chartBarColor = (name:string)=>{
  const c = _currentTheme();
  if(c === "light"){
    if(name === "YOU" || name === "RIVAL"){
      return "#BF4C0A";
    }else if(name === "line"){
      return "#943300";
    }else{
      return "#D9AFA0";
    }
  }
  if(c === "dark"){
    if(name === "YOU" || name === "RIVAL"){
      return "#BF4C0A";
    }else if(name === "line"){
      return "#bbb";
    }else{
      return "#aaa";
    }
  }
  if(c === "deepsea"){
    if(name === "YOU" || name === "RIVAL"){
      return "#3E38F2";
    }else if(name === "line"){
      return "#5C73F2";
    }else{
      return "#829FD9";
    }
  }
}

export const buttonTextColor = ()=>{
  const c = _currentTheme();
  if(c !== "light"){
    return "#fff";
  }
  return "#222";
}

export const _currentGreenPreference = ()=>{
  return Number(localStorage.getItem("greenPreference")) || 0;
}

export const _setGreenPreference = (item:string)=>{
  return localStorage.setItem("greenPreference",item);
}
