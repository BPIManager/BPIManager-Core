import { noimg, alternativeImg } from ".";

export const imgCheck = (url: string | null, uid?: string) => {

  if (!url) {
    return !uid ? noimg : alternativeImg(uid);

  } else if (url === noimg) {
    return noimg;
  }

  return fetch(url, { method: 'HEAD' }).then(response => {
    if (response.ok) {
      return url;
    } else {
      return !uid ? noimg : alternativeImg(uid);
    }
  }).catch(_err => {
    return noimg;
  })
}
