import React, { useState, useEffect } from 'react';
import { scoresDB, songsDB } from '@/components/indexedDB';
import { songData } from '@/types/data';
import { difficultyDiscriminator } from '@/components/songs/filter';
import { _isSingle, _showLatestSongs } from '@/components/settings';
import NotPlayList from '@/view/components/songs/notplayed/notPlayList';
import Loader from '@/view/components/common/loader';
import AdsCard from '@/components/ad';

const NotPlayed: React.FC = () => {
  const [full, setFull] = useState<songData[]>([]);
  const updateScoreData = async (whenUpdated: boolean = false, willDeleteItem?: { title: string, difficulty: string }) => {
    if (whenUpdated && willDeleteItem) {
      setFull(full.filter((item: songData) => {
        if (item.title !== willDeleteItem.title) {
          return true;
        } else {
          if (difficultyDiscriminator(item.difficulty) !== willDeleteItem.difficulty) {
            return true;
          }
        }
        return false;
      }))
    }
    const isSingle = _isSingle();
    const songs: songData[] = await new songsDB().getAll(isSingle);
    const db = new scoresDB();
    const scores = await db.getSpecificVersionAll();
    let newFull: songData[] = [];
    for (let i = 0; i < songs.length; ++i) {
      let song = songs[i];
      const res = scores.find((item) => item.title === song.title && item.difficulty === difficultyDiscriminator(song.difficulty) && item.isSingle === isSingle);
      if (!res) {
        if (song.wr === -1 && !_showLatestSongs()) {
          continue;
        }
        newFull.push(song);
      }
    }
    setFull(newFull);
  }


  useEffect(() => {
    updateScoreData()
  }, []);

  if (full.length === 0) {
    return (<Loader />);
  }
  return (
    <div id="_notPlayed">
      <NotPlayList title="NotPlayed.Title" full={full} updateScoreData={updateScoreData} />
      <AdsCard />
    </div>
  );

}

export default NotPlayed;
