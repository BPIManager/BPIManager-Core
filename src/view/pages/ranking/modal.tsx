import * as React from 'react';
import { _currentTheme } from '@/components/settings';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from "@mui/icons-material/Close";
import WeeklyOnGoing from "./ongoing";

export default class WeeklyModal extends React.Component<{
  isOpen: boolean,
  handleOpen: (flag: string) => void,
  rankingId: string,
}, {
    rankingName: string
  }>{

  constructor(props: any) {
    super(props);
    this.state = {
      rankingName: ""
    }
  }

  render() {
    const c = _currentTheme();
    const { isOpen, handleOpen, rankingId } = this.props;
    const { rankingName } = this.state;
    return (
      <Dialog
        id="detailedScreen"
        className={c === "dark" ? "darkDetailedScreen" : c === "light" ? "lightDetailedScreen" : "deepSeaDetailedScreen"}
        fullScreen open={isOpen} onClose={handleOpen} style={{ overflowX: "hidden", width: "100%" }}>
        <AppBar>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => handleOpen("")}
              aria-label="close"
              size="large">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className="be-ellipsis" style={{ flexGrow: 1 }}>
              {rankingName}
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        <WeeklyOnGoing rankingId={rankingId} />
      </Dialog>
    );
  }

}
