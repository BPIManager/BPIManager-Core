import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import FolloweeList from './list';
import Link from '@mui/material/Link';

interface P {
  ids: string[],
  text: string,
  userName: string
}

const FolloweeCounter: React.FC<P> = ({ ids, text, userName }) => {
  const [showList, setShowList] = useState(false);
  const toggle = ()=> setShowList(!showList);

  return (
    <React.Fragment>
      <Typography component="span" variant="caption" color="textSecondary" onClick={toggle} style={{ fontWeight: "bold" }}>
        {text}&nbsp;<Link color="secondary">{ids.length}</Link>
      </Typography>
      {showList && <FolloweeList handleClose={toggle} ids={ids} text={text} userName={userName} />}
    </React.Fragment>
  );
}

export default FolloweeCounter;
