import * as React from 'react';
import { _currentTheme } from '@/components/settings';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from "@material-ui/icons/Close";
import WeeklyOnGoing from "./ongoing";

export default class WeeklyModal extends React.Component<{
  isOpen:boolean,
  handleOpen:(flag:string)=>void,
  rankingId:string,
},{
  rankingName:string
}>{

  constructor(props:any){
    super(props);
    this.state = {
      rankingName:""
    }
  }

  render(){
    const c = _currentTheme();
    const {isOpen,handleOpen,rankingId} = this.props;
    const {rankingName} = this.state;
    return (
      <Dialog
        id="detailedScreen"
        className={c === "dark" ? "darkDetailedScreen" : c === "light" ? "lightDetailedScreen" : "deepSeaDetailedScreen"}
        fullScreen open={isOpen} onClose={handleOpen} style={{overflowX:"hidden",width:"100%"}}>
        <AppBar>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={()=>handleOpen("")} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className="be-ellipsis" style={{flexGrow:1}}>
              {rankingName}
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar/>
        <WeeklyOnGoing rankingId={rankingId}/>
      </Dialog>
    )
  }

}
