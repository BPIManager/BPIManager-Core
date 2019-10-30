export const _isSingle = ()=>{
    return localStorage.getItem("isSingle") ? 1 : 0;
}

export const _currentStore = ()=>{
  return localStorage.getItem("currentStore") || "27";
}
