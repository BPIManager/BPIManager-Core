import * as React from 'react';
import { _currentTheme } from '@/components/settings';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from "@mui/icons-material/Close";
import { songsDB, scoresDB } from '@/components/indexedDB';
import { scoreData, songData } from '@/types/data';
import { _currentStore } from '@/components/settings';
import Loader from '../../common/loader';
import { _prefixFromNum } from '@/components/songs/filter';
import SongNotes from '../../songs/songNotes';

export default class ModalNotes extends React.Component<{
  isOpen: boolean,
  handleOpen: (flag: boolean) => void,
  derived: any
}, {
    song: songData | null,
    score: scoreData | null,
    isLoading: boolean,
  }>{

  private songsDB = new songsDB();
  private scoresDB = new scoresDB();

  constructor(props: { isOpen: boolean, handleOpen: (flag: boolean) => void, derived: any }) {
    super(props);
    this.state = {
      song: null,
      score: null,
      isLoading: true,
    }
  }

  async componentDidMount() {
    const { songName, songDiff, isSingle } = this.props.derived;
    const score = await this.scoreFinder(songName, songDiff, isSingle);
    const song = await this.songFinder(songName, songDiff, isSingle);
    return this.setState({ song: song, score: score, isLoading: false });
  }

  scoreFinder = async (title: string, difficulty: string, isSingle: boolean): Promise<scoreData | null> => {
    const items = await this.scoresDB.getItem(title, difficulty, _currentStore(), isSingle ? 1 : 0);
    if (items.length > 0) {
      return items[0];
    }
    return null;
  }

  songFinder = async (title: string, difficulty: string, isSingle: boolean): Promise<songData | null> => {
    const items = await this.songsDB.getOneItemIsSingle(title, difficulty, isSingle ? 1 : 0);
    if (items.length > 0) {
      return items[0];
    }
    return null;
  }

  render() {
    const c = _currentTheme();
    const { isOpen, handleOpen } = this.props;
    const { song, score, isLoading } = this.state;
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
              onClick={() => handleOpen(false)}
              aria-label="close"
              size="large">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className="be-ellipsis" style={{ flexGrow: 1 }}>
              {(!isLoading && song) && (song.title + _prefixFromNum(song.difficulty))}
              {(!isLoading && !song) && "Error"}
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar />
        {isLoading && <Loader />}
        {(!isLoading && song) && <SongNotes song={song} score={score} />}
        {(!isLoading && !song) && (null)}
      </Dialog>
    );
  }

}
