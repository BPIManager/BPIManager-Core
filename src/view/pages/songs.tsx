import React, { useState, useEffect } from 'react';
import SongsList from '@/view/components/songs/played/songsList';
import { scoresDB } from '@/components/indexedDB';
import { scoreData } from '@/types/data';
import Loader from '@/view/components/common/loader';
import AdsCard from '@/components/ad';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import { Link as RLink, RouteComponentProps, withRouter } from "react-router-dom";
import { _showLatestSongs } from '@/components/settings';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const Songs: React.FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const [full, setFull] = useState<scoreData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [defToday, setDefToday] = useState<boolean>(false);

  const updateData = async () => {
    let full: scoreData[] = await new scoresDB().getAll();
    if (!_showLatestSongs()) {
      full = full.filter((item) => item.currentBPI !== Infinity);
    }
    setFull(full);
    setIsLoading(false);
  }

  useEffect(() => {
    const d = !!(props.match.params as any).today || false;
    setDefToday(d);
    updateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  if (!full || isLoading) {
    return (<Loader />);
  }
  if (full.length === 0) {
    return (
      <Container fixed className="commonLayout">
        <div style={{ display: "flex", alignItems: "center", flexDirection: "column" }}>
          <HowToVoteIcon style={{ fontSize: 80, marginBottom: "10px" }} />
          <Typography variant="h4">
            スコアを追加
          </Typography>
        </div>
        <Divider style={{ margin: "10px 0" }} />
        <p>
          BPIM にスコアが登録されていません。
        </p>
        <p>
          「<RLink to="/data" style={{ textDecoration: "none" }}><Link color="secondary" component="span">データ取り込み</Link></RLink>」ページからCSVまたはブックマークレットを用いて一括インポートするか、「<RLink to="/notPlayed" style={{ textDecoration: "none" }}><Link color="secondary" component="span">未プレイ楽曲</Link></RLink>」ページから手動でスコアを登録してください。
        </p>
        <p>
          スコアの取り込みに関するヘルプは<Link href="https://docs2.poyashi.me/docs/imports/" color="secondary" target="_blank">こちら</Link>を参照してください。
        </p>
      </Container>
    )
  }
  return (
    <div>
      <SongsList isFav={false} title="Songs.title" full={full} updateScoreData={updateData} defToday={defToday} />
      <AdsCard />
    </div>
  );
}

export default withRouter(Songs);
