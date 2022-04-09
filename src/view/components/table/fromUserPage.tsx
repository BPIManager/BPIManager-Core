import React from 'react';
import { rivalScoreData } from '@/types/data';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ClearLampTable from './table';

interface P {
  backToMainPage: () => void | null
  name: string,
  data: rivalScoreData[]
}

const ClearLampView: React.FC<P> = ({ backToMainPage, name, data }) => {
  return (
    <React.Fragment>
      <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
        <Button onClick={backToMainPage} style={{ minWidth: "auto", padding: "6px 0px" }}><ArrowBackIcon /></Button>
        &nbsp;{name}
      </Typography>
      <ClearLampTable data={data} />
    </React.Fragment>
  );
}

export default ClearLampView;
