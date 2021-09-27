import React from "react";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import PeopleIcon from '@mui/icons-material/People';
import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SyncProblemIcon from '@mui/icons-material/SyncProblem';

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
