import { Avatar, Modal } from "@mui/material";
import React, { useState } from "react";

export const UserIcon: React.FC<{
  defaultURL: string;
  altURL: string;
  text: string;
  size?: number | string;
  style?: React.CSSProperties;
  disableZoom?: boolean;
  _legacy?: boolean;
  className?: string;
}> = ({ defaultURL, _legacy, altURL, text, size, style, disableZoom, className }) => {
  const [open, setOpen] = useState<boolean>(false);
  const toggle = () => {
    if (disableZoom) return;
    setOpen(!open);
  };
  const imgBody = <img src={defaultURL || "noimage"} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt={text} onError={(e) => ((e.target as HTMLImageElement).src = altURL)} />;
  return (
    <>
      <Avatar sx={_legacy ? {} : { ...style, width: size || "100%", height: size || "100%" }} className={className || ""} onClick={toggle}>
        {imgBody}
      </Avatar>
      <Modal open={open} onClose={toggle} sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Avatar sx={{ width: "45%", height: "auto" }} onClick={toggle}>
          {imgBody}
        </Avatar>
      </Modal>
    </>
  );
};
