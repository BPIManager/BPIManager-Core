import * as React from 'react';
import User from "@/view/pages/user";
import { _currentTheme } from '@/components/settings';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from "@material-ui/icons/Close";

export default class ModalUser extends React.Component<{
  isOpen:boolean,
  handleOpen:(flag:boolean)=>void,
  currentUserName:string
},{
  currentUserName:string,
}>{

  constructor(props:{isOpen:boolean,handleOpen:(flag:boolean)=>void,currentUserName:string}){
    super(props);
    console.log(props);
    this.state = {
      currentUserName:props.currentUserName
    }
  }

  updateName = (name:string)=> this.setState({currentUserName:name});

  render(){
    const c = _currentTheme();
    const {isOpen,handleOpen} = this.props;
    const {currentUserName} = this.state;
    return (
      <Dialog
        id="detailedScreen"
        className={c === "dark" ? "darkDetailedScreen" : c === "light" ? "lightDetailedScreen" : "deepSeaDetailedScreen"}
        fullScreen open={isOpen} onClose={handleOpen} style={{overflowX:"hidden",width:"100%"}}>
        <AppBar>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={()=>handleOpen(false)} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className="be-ellipsis" style={{flexGrow:1}}>
              {currentUserName}
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar/>
        <User currentUserName={currentUserName} limited={true} updateName={this.updateName}/>
      </Dialog>
    )
  }

}
