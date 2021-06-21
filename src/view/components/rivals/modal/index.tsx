import * as React from 'react';
import User from "@/view/pages/user";
import { _currentTheme } from '@/components/settings';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";

export default class ModalUser extends React.Component<{
  isOpen:boolean,
  handleOpen:(flag:boolean)=>void,
  currentUserName:string,
  exact?:boolean,
  initialView?:number
},{
  currentUserName:string,
}>{

  constructor(props:{isOpen:boolean,handleOpen:(flag:boolean)=>void,currentUserName:string}){
    super(props);
    this.state = {
      currentUserName:props.currentUserName
    }
  }

  componentDidMount(){
    window.history.pushState(null,"Detail",null);
    window.addEventListener("popstate",this.overridePopstate,false);
  }

  componentWillUnmount(){
    window.removeEventListener("popstate",this.overridePopstate,false);
  }

  overridePopstate = ()=>this.props.handleOpen(false);

  updateName = (name:string)=> this.setState({currentUserName:name});

  render(){
    const c = _currentTheme();
    const {isOpen,handleOpen,initialView} = this.props;
    const {currentUserName} = this.state;
    return (
      <Dialog
        id="detailedScreen"
        className={c === "dark" ? "darkDetailedScreen" : c === "light" ? "lightDetailedScreen" : "deepSeaDetailedScreen"}
        fullScreen open={isOpen} onClose={handleOpen} style={{overflowX:"hidden",width:"100%"}}>
        <AppBar>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={()=>handleOpen(false)} aria-label="close">
              <ArrowBackIosIcon />
            </IconButton>
            <Typography variant="h6" className="be-ellipsis" style={{flexGrow:1}}>
              {currentUserName}
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar/>
        <User initialView={initialView || 0} currentUserName={currentUserName} limited={true} exact={this.props.exact || false} updateName={this.updateName}/>
      </Dialog>
    )
  }

}
