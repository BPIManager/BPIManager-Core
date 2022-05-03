export const saveAsImage = (url: string) => {
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = "result_" + new Date().getTime() + ".jpg";
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};
