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

export const _currentViewComponents = ()=>{
  return localStorage.getItem("viewComponents") || "last,djLevel";
}

export const _setCurrentViewComponents = (array:string[]):string[]=>{
  array = array.filter((x, i, self)=>self.indexOf(x) === i && x !== "none");
  if(array.length === 0){ array.push("none"); }
  localStorage.setItem("viewComponents",array.join());
  return array;
}

const defaultURL = "https://files.poyashi.me/json/songsWithDP.json";

export const _currentDefinitionURL = ()=>{
  return localStorage.getItem("defURL") || defaultURL;
}

export const _setCurrentDefinitionURL = (url:string = defaultURL)=>{
  return localStorage.setItem("defURL",url);
}

export const _currentStoreWithFullName = ()=>{
  const t:string = localStorage.getItem("currentStore") || "27";
  return t === "26" ? "26 Rootage" : "27 HEROIC VERSE"
}

export const _chartColor = ()=>{
  return _currentTheme() === "dark" ? "#eee" : "#333"
}
