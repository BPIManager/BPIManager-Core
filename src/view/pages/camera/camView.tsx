import * as React from 'react';
import Webcam from "react-webcam";
import Fab from '@material-ui/core/Fab';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';
import { Link } from '@material-ui/core';

interface Props{
  shot:(shot:string)=>void,
  toggleSettings:()=>void,
  camSettings:any
}

export default class CameraMode extends React.Component<Props,{}> {

  camRef:React.RefObject<any>;

  constructor(props:Props){
    super(props);
    this.state = {
      rawCamData:""
    }
    this.camRef = React.createRef();
  }

  capture = ()=>{
    const scr = this.camRef.current.getScreenshot();
    this.props.shot(scr);
  }

  toggleSettings = ()=> this.props.toggleSettings();

  render(){
    const { camSettings } = this.props;
    let options = {
      height: 2048,
      width: 1560,
    };
    if(camSettings){
      options = Object.assign({deviceId:camSettings.deviceId},options);
    }
    return (
      <div style={{display:"flex",justifyContent:"center",flexDirection:"column"}}>
        <Webcam audio={false} ref={this.camRef}
          style={{maxHeight:"80vh"}}
          height = {100 + '%'}
          width = {100 + '%'}
          screenshotFormat="image/jpeg"
          forceScreenshotSourceSize
          videoConstraints={options}
        />
        <div style={{display:"flex",justifyContent:"center",margin:"15px auto"}}>
          <Fab variant="extended" color="secondary" onClick={this.capture}>
            <CameraAltIcon style={{marginRight:"5px"}}/>
            撮影
          </Fab>
          <IconButton style={{position:"absolute",right:"5%"}} onClick={this.props.toggleSettings}>
            <SettingsIcon/>
          </IconButton>
        </div>
        <p style={{textAlign:"center"}}><Link href="https://gist.github.com/potakusan/b40f4c309556a5ea5430612db721f192" color="secondary">この機能の使い方 / Usage</Link></p>
      </div>
    );
  }
}
