import * as React from 'react';
import Webcam from "react-webcam";
import Fab from '@mui/material/Fab';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SettingsIcon from '@mui/icons-material/Settings';
import IconButton from '@mui/material/IconButton';

interface Props {
  shot: (shot: string) => void,
  toggleSettings: () => void,
  camSettings: any
}

export default class CameraMode extends React.Component<Props, {}> {

  camRef: React.RefObject<any>;

  constructor(props: Props) {
    super(props);
    this.state = {
      rawCamData: ""
    }
    this.camRef = React.createRef();
  }

  capture = () => {
    const scr = this.camRef.current.getScreenshot();
    this.props.shot(scr);
  }

  toggleSettings = () => this.props.toggleSettings();

  render() {
    const { camSettings } = this.props;
    let options = {
      height: 2048,
      width: 1560,
    };
    if (camSettings) {
      options = Object.assign({ deviceId: camSettings.deviceId }, options);
    }
    return (
      <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", position: "relative", height: "85vh" }}>
        <Webcam audio={false} ref={this.camRef}
          style={{ maxHeight: "80vh" }}
          height={100 + '%'}
          width={100 + '%'}
          screenshotFormat="image/jpeg"
          forceScreenshotSourceSize
          videoConstraints={options}
        />
        <div style={{ display: "flex", justifyContent: "center", margin: "15px auto", position: "absolute", bottom: "5%", width: "100%" }}>
          <Fab variant="extended" color="secondary" onClick={this.capture} style={{ width: "60%" }}>
            <CameraAltIcon style={{ marginRight: "5px" }} />
            撮影
          </Fab>
        </div>
        <IconButton
          onClick={this.props.toggleSettings}
          style={{ position: "absolute", bottom: "5%", right: "5%", margin: "15px 0" }}
          size="large">
          <SettingsIcon />
        </IconButton>
      </div>
    );
  }
}
