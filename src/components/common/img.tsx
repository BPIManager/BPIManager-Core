import { noimg, alternativeImg } from ".";

export const imgCheck = (url:string|null,uid?:string)=>{
  if(url === noimg){ return noimg;}
  if(!url){ return !uid ? noimg : alternativeImg(uid); }
  return fetch(url,{method: 'HEAD'}).then(response =>{
    if(response.ok){
        return url;
    }else{
        return !uid ? noimg : alternativeImg(uid);
    }
  }).catch(_err=>{
    return noimg;
  })
}
