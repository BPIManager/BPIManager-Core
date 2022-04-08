import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import Tooltip from '@mui/material/Tooltip';
import IconButton from "@mui/material/IconButton";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ShowSnackBar from "@/view/components/snackBar";
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { FormattedMessage } from "react-intl";
import favLists from "../common/lists";
import { DBLists } from "@/types/lists";
import { songData } from "@/types/data";

interface ListItemBody { title: string, num: number, description: string, length: number }

const EditList: React.FC<{
  song: songData
}> = ({ song }) => {

  const [openMenu, setOpenMenu] = useState(false);
  const [successSnack, setSuccessSnack] = useState<{ added: boolean, visible: boolean, target: string }>({ added: true, visible: false, target: "" });
  const [allLists, setAllLists] = useState<ListItemBody[]>([]);
  const [allSavedLists, setAllSavedLists] = useState<number[]>([]);

  const toggleListsMenu = async (willOpen: boolean = false) => {
    if (willOpen) {
      const f = new favLists();
      const title = song ? song.title : "";
      const difficulty = song ? song.difficulty : "";
      const p = await f.loadLists();
      const q = await f.loadSavedLists(title, difficulty);
      setAllLists(p.reduce((groups: ListItemBody[], item: DBLists) => {
        groups.push({ title: item.title, num: item.num, description: item.description, length: item.length });
        return groups;
      }, []));
      setAllSavedLists(q.reduce((groups: number[], item: any) => {
        groups.push(item.listedOn);
        return groups;
      }, []));
    }
    setOpenMenu(willOpen);
  }

  const toggleFavLists = async (target: { title: string, num: number }, willAdd: boolean) => {
    try {
      const title = song ? song.title : "";
      const difficulty = song ? song.difficulty : "";
      const res = await new favLists().toggleLists(title, difficulty, target.num, willAdd);
      if (res) {
        setOpenMenu(false);
        setSuccessSnack({ added: willAdd, target: target.title, visible: true });
        setAllSavedLists(willAdd ? allSavedLists.concat(target.num) : allSavedLists.filter((item: number) => item !== target.num));
      }
    } catch (e: any) {
      console.log(e);
      alert("追加に失敗しました");
    }
  }

  return (
    <Grid item xs={1} style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
      <div style={{ margin: "10px 6px 0" }}>
        <Tooltip title="楽曲をリストに追加/削除">
          <IconButton
            style={{ margin: "0 6px 0" }}
            aria-haspopup="true"
            onClick={() => toggleListsMenu(true)}
            size="large">
            <PlaylistAddCheckIcon />
          </IconButton>
        </Tooltip>
        <SwipeableDrawer
          anchor="bottom"
          className="overlayDrawer"
          open={openMenu}
          onClose={() => toggleListsMenu(false)}
          onOpen={() => toggleListsMenu(true)}
        >
          <List
            subheader={
              <ListSubheader component="div" id="nested-list-subheader">
                楽曲のリスト管理
                </ListSubheader>
            }>
            {allLists.map((item: ListItemBody) => {
              const alreadyExists = allSavedLists.indexOf(item.num) > -1;
              return (
                <ListItem button onClick={() => toggleFavLists(item, !alreadyExists)} key={item.num}>
                  <ListItemIcon>{alreadyExists ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}</ListItemIcon>
                  <ListItemText primary={`${item.title}(${item.length})`} secondary={item.description} />
                </ListItem>
              )
            })}
          </List>
        </SwipeableDrawer>
      </div>
      <ShowSnackBar
        message={
          <span>
          {(successSnack.added ? <FormattedMessage id="Details.FavButtonAdded" /> : <FormattedMessage id="Details.FavButtonRemoved" />)}:{successSnack.target}</span>
        }
        variant="success" handleClose={() => setSuccessSnack({ visible: false, added: false, target: "" })} open={successSnack.visible} autoHideDuration={3000} />
    </Grid>
  );
}

export default EditList;
