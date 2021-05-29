import * as React from 'react';
import Fab from '@material-ui/core/Fab';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import SettingsIcon from '@material-ui/icons/Settings';
import IconButton from '@material-ui/core/IconButton';

interface Props{
  rawCamData:string
}

export default class CameraLoader extends React.Component<Props,{}> {

  render(){
    return (
      <div style={{display:"flex",justifyContent:"center",flexDirection:"column",position:"relative",height:"85vh"}}>
        <img src={this.props.rawCamData} alt="撮影された画像" style={{display:"block",margin:"10px auto",maxWidth:"100%"}}/>
        <div style={{display:"flex",justifyContent:"center",margin:"15px auto",position:"absolute",bottom:"5%",width:"100%"}}>
          <Fab variant="extended" color="secondary" style={{width:"60%"}}>
            <CameraAltIcon style={{marginRight:"5px"}}/>
            撮影
          </Fab>
        </div>
        <IconButton style={{position:"absolute",bottom:"5%",right:"5%",margin:"15px 0"}}>
          <SettingsIcon/>
        </IconButton>
      </div>
    );
  }
}
