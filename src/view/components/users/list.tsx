import React, { useState, useEffect } from 'react';
import { _currentStore } from '@/components/settings';
import ModalUser from '../rivals/modal';
import Slide from '@mui/material/Slide';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { TransitionProps } from '@mui/material/transitions';
import Typography from '@mui/material/Typography';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Loader from '../common/loader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import { getAltTwitterIcon } from '@/components/rivals';
import { alternativeImg } from '@/components/common';
import Alert from '@mui/material/Alert/Alert';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Button from '@mui/material/Button';
import { httpsCallable } from "@/components/firebase";

interface P {
  ids: string[],
  text: string
  handleClose: () => void,
  userName: string
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children?: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const FolloweeList: React.FC<P> = ({ ids, text, handleClose, userName }) => {
  const [modal, setModal] = useState<{ open: boolean, uName: string }>({ open: false, uName: "" });
  const [loading, setLoading] = useState(false);
  const [notLoaded, setNotLoaded] = useState<string[]>(ids);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const overridePopstate = () => handleClose();
    loadMore();
    window.history.pushState(null, "UserList", null);
    window.addEventListener("popstate", overridePopstate, false);
    return (() => window.removeEventListener("popstate", overridePopstate, false));
  })

  const openModal = (uName: string) => setModal({ open: true, uName: uName });
  const handleModal = (newState: boolean) => setModal({ ...modal, open: newState });

  const loadMore = async (forceArray: string[] | null = null) => {
    if (loading) return;
    setLoading(true);
    const targetArray = forceArray !== null ? forceArray : notLoaded;
    if (targetArray.length === 0) {
      setLoading(false);
    }
    const res: any = await httpsCallable("", "getFolloweeDetails", {
      userIds: targetArray.slice(0, 10),
      version: _currentStore()
    });
    setLoading(false);
    setNotLoaded(targetArray.slice(10, targetArray.length));
    setUsers((res.data && res.data.body) ? users.concat(res.data.body) : users);
  }

  return (
    <React.Fragment>
      <Dialog fullScreen open={true} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar style={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              size="large">
              <ArrowBackIosIcon />
            </IconButton>
            <Typography variant="h6">
              {userName}さんの{text}
            </Typography>
          </Toolbar>
        </AppBar>
        {users && (
          <List>
            {users.map((item) => {
              return (
                <ListItem key={item.uid} button onClick={() => openModal(item.displayName)}>
                  <ListItemIcon>
                    <Avatar>
                      <img src={item.photoURL ? item.photoURL : "noimg"} style={{ width: "100%", height: "100%" }}
                        alt={item.displayName}
                        onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(item, false, "normal") || alternativeImg(item.displayName)} />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary={item.displayName} secondary={(item.arenaRank || "-") + " / 総合BPI:" + (item.totalBPI || "- ")} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete" size="large">
                      <ChevronRightIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        )}
        {(!loading && users.length === 0) && (
          <Alert severity="warning">
            ライバルが見つかりませんでした。<br />
            （プロフィールを非公開にしているライバルはリストに表示されません）
          </Alert>
        )}
        {loading && <Loader text="ライバルを読み込んでいます" />}
        {notLoaded.length > 0 && (
          <Button disabled={loading} onClick={() => loadMore()} fullWidth>
            更に読み込む
          </Button>
        )}
      </Dialog>
      {modal.open && <ModalUser isOpen={modal.open} currentUserName={modal.uName} handleOpen={(flag: boolean) => handleModal(flag)} />}
    </React.Fragment>
  );

}

export default FolloweeList;
