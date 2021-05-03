import { songData } from "@/types/data";
import React from "react";
import { songsDB } from "@/components/indexedDB";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Loader from "@/view/components/common/loader";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItem from "@material-ui/core/ListItem";
import Typography from "@material-ui/core/Typography";
import { _prefixFromNum } from "@/components/songs/filter";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";

interface UP{
  isDialogOpen:boolean,
  close:()=>void,
  decide:(input:songData)=>void,
}

export default class SongSearchDialog extends React.Component<UP,{value:string,isLoading:boolean,fullset:songData[],display:songData[]}> {

  constructor(props:UP){
    super(props);
    this.state = {
      value:"",
      isLoading:true,
      fullset:[],
      display:[]
    }
  }

  async componentDidMount(){
    const db = new songsDB();
    const allItems = await db.getAll();
    return this.setState({fullset:allItems,display:allItems,isLoading:false});
  }

  handleClose = () => {
    this.props.close();
  };

  render(){
    const {isDialogOpen,decide} = this.props;
    const {isLoading,display,fullset} = this.state;
    return (
      <div>
        <Dialog
          open={isDialogOpen}
          onClose={this.handleClose}>
          <DialogTitle>楽曲検索</DialogTitle>
          <DialogContent>
          {isLoading && <Loader/>}
          {!isLoading &&
            <div>
              <TextField
                margin="dense"
                id="name"
                label="楽曲名で絞り込み"
                type="text"
                value={this.state.value}
                onChange={(e:React.ChangeEvent<HTMLInputElement>)=>this.setState({value:e.target.value,display:fullset.filter(item=>item.title.toLowerCase().indexOf(e.target.value.toLowerCase()) > -1)})}
                fullWidth
              />
              <List subheader={<li />}>
                {display.map(item=>
                  <ListItem alignItems="flex-start" key={item.title + item.difficulty} button onClick={()=>decide(item)}>
                  <ListItemText
                    primary={"☆" + item.difficultyLevel + " " + item.title + _prefixFromNum(item.difficulty,false)}
                    secondary={
                    <React.Fragment>
                      <Typography
                        component="span"
                        variant="body2"
                        color="textPrimary"
                      >
                        NOTES:{item.notes} / BPM:{item.bpm}
                      </Typography>
                    </React.Fragment>
                    }
                  />
                </ListItem>)}
              </List>
            </div>
          }
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
