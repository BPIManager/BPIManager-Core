import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import * as H from "history";
import { FileUpload, FileUploadProps } from "./button";
import { useState } from "react";
import { Crop, ReactCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Button from "@mui/material/Button";
import Resizer from "react-image-file-resizer";
import ButtonGroup from "@mui/material/ButtonGroup";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import { storage } from "@/components/firebase";
import fbActions from "@/components/firebase/actions";
import LoadingButton from "@mui/lab/LoadingButton";

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}

export const ImageUpload: React.FC<{
  handleClose: (url?: string) => void;
  userInfo: any;
  rawUserData: any;
  history: H.History;
  whenCompleted?: (...args: any) => any;
}> = (props) => {
  const uid = props.rawUserData.uid || "";
  const [loading, setLoading] = useState<boolean>(false);
  const [scr, setScr] = useState<number>(0);
  const [blob, setBlob] = useState<string>("");
  const [ext, setExt] = useState<string>("");
  const [crop, setCrop] = useState<Crop>({
    unit: "%",
    x: 25,
    y: 25,
    width: 50,
    height: 50,
  });
  const fileToDataUri = (file: File): Promise<string> =>
    new Promise((resolve, _reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event!.target!.result as string);
      };
      reader.readAsDataURL(file);
    });
  const up = (event: HTMLInputEvent) => {
    if (event.target.files !== null && event.target?.files?.length > 0) {
      const target = event.target.files[0];
      if (!/^image\/.+/.exec(target.type))
        return alert("Invalid file type selected");
      if (!target) {
        setBlob("");
        return;
      }

      fileToDataUri(target).then((dataUri: string) => {
        switch (target.type) {
          case "image/jpeg":
            setExt(".jpg");
            break;
          case "image/png":
            setExt(".png");
            break;
          case "image/svg+xml":
            setExt(".svg");
            break;
          default:
            return alert("Invalid file type selected");
        }
        setScr(1);
        setBlob(dataUri);
      });
    }
  };

  const resize = (file: Blob): Promise<string> =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        256,
        256,
        "JPEG",
        80,
        0,
        (uri) => {
          resolve(uri as string);
        },
        "base64"
      );
    });
  const getCroppedImg = async (image: HTMLImageElement, crop: Crop) => {
    const canvas = document.createElement("canvas");
    const pixelRatio = window.devicePixelRatio;
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = crop.width * pixelRatio * scaleX;
    canvas.height = crop.height * pixelRatio * scaleY;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    canvas.toBlob(async (blob) => {
      if (!blob) return alert("Error");
      if (!/image.*/.exec(blob.type)) {
        return alert("Invalid file type selected");
      }
      try {
        const output = await resize(blob);
        const imageRef = ref(storage, uid + "/profile" + ext);
        await uploadString(imageRef, output, "data_url");
        const url = await getDownloadURL(imageRef);
        if (url) {
          //Sync Profile Image Url
          const fbA = new fbActions();
          await fbA.updateProfileUrl(uid, url);
          if (props.whenCompleted) {
            props.whenCompleted(output);
          }
          props.handleClose(url);
        }
      } catch (e) {
        alert("An Error Occured, Please Check Console");
        console.log(e);
      }
    });
  };
  const onCrop = async () => {
    setLoading(true);
    if (!uid) return alert("No uid detected");
    const imageRef = document.getElementById("raw");
    if (!crop) return;
    if (imageRef && crop.width && crop.height) {
      await getCroppedImg(imageRef as HTMLImageElement, crop);
    }
  };

  const fileUploadProp: FileUploadProps = {
    accept: "image/*",
    onChange: (event: any) => up(event),
    onDrop: (event: any) => up(event),
  };
  return (
    <Dialog open={true} onClose={() => (loading ? null : props.handleClose())}>
      <DialogContent
        sx={
          scr === 0
            ? {
                display: "flex",
                justifyContent: "center",
              }
            : {
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                padding: 0,
                margin: 0,
              }
        }
      >
        {scr === 0 && <FileUpload {...fileUploadProp} />}
        {scr === 1 && (
          <>
            <ReactCrop
              disabled={loading}
              aspect={1}
              crop={crop}
              onChange={(c) => setCrop(c)}
            >
              <img src={blob} id="raw" />
            </ReactCrop>
            <ButtonGroup fullWidth>
              <Button
                disabled={loading}
                onClick={() => props.handleClose()}
                sx={{ borderTopLeftRadius: 0 }}
              >
                キャンセル
              </Button>
              <LoadingButton
                loading={loading}
                loadingPosition="start"
                sx={{ borderTopRightRadius: 0 }}
                variant="contained"
                onClick={() => onCrop()}
              >
                アップロード
              </LoadingButton>
            </ButtonGroup>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
