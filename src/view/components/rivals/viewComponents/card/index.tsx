import React from "react";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardHeader from "@material-ui/core/CardHeader";
import Card from "@material-ui/core/Card";
import { alternativeImg, arenaRankColor } from "../../../../../components/common";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import Chip from "@material-ui/core/Chip";
import AddIcon from "@material-ui/icons/Add";
import CheckIcon from "@material-ui/icons/Check";
import moment from "moment";
import 'moment/locale/ja';
moment.locale("ja");
export default class UserCard extends React.Component<{
  item:any,
  open:(q:string)=>void,
  processing:boolean,
  isAdded:boolean,
  addUser:(q:any)=>void
},{}>{

  render(){
    const {item,isAdded,processing} = this.props;
    return (
      <Card style={{margin:"10px 0",background:"transparent"}} elevation={0}>
        <CardActionArea>
        <CardHeader
          avatar={
            <Avatar onClick={()=>this.props.open(item.displayName)}>
              <img src={item.photoURL ? item.photoURL : "noimage"} style={{width:"100%",height:"100%"}}
                alt={item.displayName}
                onError={(e)=>(e.target as HTMLImageElement).src = alternativeImg(item.displayName)}/>
            </Avatar>
          }
          action={
            <Button component="a"
              disabled={processing || isAdded}
              color="secondary" variant="outlined"
              startIcon={!isAdded ? <AddIcon/> : <CheckIcon/>}
              onClick={()=>!isAdded && this.props.addUser(item)}>
                {!isAdded ? "追加" : "追加済み"}
            </Button>
          }
          title={<div onClick={()=>this.props.open(item.displayName)}>{item.displayName}&nbsp;<small>{moment(item.timeStamp).fromNow()}</small></div>}
          subheader={<div onClick={()=>this.props.open(item.displayName)}>
            <span>
              <Chip size="small" style={{backgroundColor:arenaRankColor(item.arenaRank),color:"#fff",margin:"5px 0"}} label={item.arenaRank || "-"} />
              {item.totalBPI && <Chip size="small" style={{backgroundColor:"green",color:"#fff",margin:"0 0 0 5px"}} label={"総合BPI:" + item.totalBPI} />}
            </span>
            <span style={{display:"block"}}>{item.profile}</span>
          </div>}
        />
        </CardActionArea>
      </Card>
    )
  }
}
