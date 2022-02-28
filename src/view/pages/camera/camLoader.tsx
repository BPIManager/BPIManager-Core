import * as React from 'react';
import Fab from '@mui/material/Fab';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';

interface Props {
  rawCamData: string
}

export default class CameraLoader extends React.Component<Props, {}> {

  render() {
    return (
      <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", position: "relative", height: "85vh" }}>
        <img src={this.props.rawCamData} alt="撮影された画像" style={{ display: "block", margin: "10px auto", maxWidth: "100%" }} />
        <div style={{ display: "flex", justifyContent: "center", margin: "15px auto", position: "absolute", bottom: "5%", width: "100%" }}>
          <Fab variant="extended" color="secondary" style={{ width: "60%" }}>
            <CameraAltIcon style={{ marginRight: "5px" }} />
            撮影
          </Fab>
        </div>
        <IconButton
          style={{ position: "absolute", bottom: "5%", right: "5%", margin: "15px 0" }}
          size="large">
          <SettingsIcon />
        </IconButton>
      </div>
    );
  }
}
