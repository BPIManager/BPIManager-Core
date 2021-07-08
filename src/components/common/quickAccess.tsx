import React from "react";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import BookmarkIcon from '@material-ui/icons/Bookmark';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import PeopleIcon from '@material-ui/icons/People';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import EventNoteIcon from '@material-ui/icons/EventNote';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';

export const quickAccessTable = [
  {name:"BPIカメラ",com:"camera",icon:<CameraAltIcon/>,href:"/camera"},
  {name:"インポート",com:"import",icon:<SaveAltIcon/>,href:"/data"},
  {name:"楽曲",com:"songs",icon:<QueueMusicIcon/>,href:"/songs"},
  {name:"ライバル",com:"rival",icon:<PeopleIcon/>,href:"/rivals"},
  {name:"Sync",com:"sync",icon:<SyncProblemIcon/>,href:"/sync/settings"},
  {name:"統計",com:"stats",icon:<TrendingUpIcon/>,href:"/stats"},
  {name:"リスト",com:"list",icon:<BookmarkIcon/>,href:"/lists"},
  {name:"AAA達成表",com:"aaatable",icon:<WbIncandescentIcon/>,href:"/AAATable"},
  {name:"データ比較",com:"compare",icon:<FilterNoneIcon/>,href:"/compare"},
  {name:"Notes",com:"notes",icon:<SpeakerNotesIcon/>,href:"/notes"},
  {name:"ランキング",com:"ranking",icon:<EventNoteIcon/>,href:"/ranking/"}
];
