import React from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Divider from "@material-ui/core/Divider";
import Typography from "@material-ui/core/Typography";
import UserCard from "@/view/components/rivals/viewComponents/card";
import ModalUser from "@/view/components/rivals/modal";
import timeFormatter from "@/components/common/timeFormatter";
import { config } from "@/config";
import Link from '@material-ui/core/Link';

interface Props{
  closeModal:()=>void,
  onGoing:any,
  authorData:any,
  onGoingId:string
}

export class Details extends React.Component<Props,{
  isModalOpen:boolean,
  currentUserName:string
}> {

  constructor(props:Props){
    super(props);
    this.state = {
      isModalOpen:false,
      currentUserName:""
    }
  }

  open = (uid:string)=> this.setState({isModalOpen:true,currentUserName:uid})
  handleModalOpen = (flag:boolean)=> this.setState({isModalOpen:flag});

  render(){
    const {closeModal,onGoing,authorData,onGoingId} = this.props;
    const {isModalOpen,currentUserName} = this.state;
    const header = (text:string)=>{
      return (
        <div>
        <Divider style={{marginTop:"5px"}}/>
        <li style={{listStyleType:"none"}}>
          <Typography
            style={{margin:"3px 0px",whiteSpace: "pre-line" }}
            color="textSecondary"
            display="block"
            variant="caption"
          >
          {text}
          </Typography>
        </li>
        </div>
      );
    }
    return (
      <Dialog open={true} onClose={closeModal}>
        <DialogTitle className="narrowDialogTitle">ランキング詳細</DialogTitle>
        <DialogContent className="narrowDialogContent">
          {header("ランキング情報")}
          <p>
            {
              onGoing.info.split('\n').map((str:string, index:number) => (
                <React.Fragment key={index}>{str}<br /></React.Fragment>
              )) || "ランキング情報が記入されていません"
            }
          </p>
          {header("作成者情報")}
          <UserCard hideBottomButtons open={this.open} myId={authorData.uid} item={authorData} processing={false} isAdded={true} addUser={()=>null}/>
          {header("ランキングURL")}
          <Link href={config.baseUrl + "/ranking/id/" + onGoingId} color="secondary" component="a" target="_blank">{config.baseUrl + "/ranking/id/" + onGoingId}</Link>

          {header("開始日付")}
          {timeFormatter(0,onGoing.since.toDate())}
          {header("終了日付")}
          {timeFormatter(0,onGoing.until.toDate())}
        </DialogContent>
        {isModalOpen && <ModalUser isOpen={isModalOpen} currentUserName={currentUserName} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
      </Dialog>
    );
  }
}
