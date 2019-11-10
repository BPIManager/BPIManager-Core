import * as React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from "react-intl";
import { Link } from 'react-router-dom';
import {Link as RefLink} from '@material-ui/core/';
const {LineShareButton,LineIcon,TwitterShareButton,TwitterIcon} = require('react-share');

export default class Index extends React.Component<{},{}> {

  render(){
    return (
      <div className="heroLayout">
        <Container fixed>
          <Typography component="h3" variant="h3" align="center" color="textPrimary" gutterBottom>
            <FormattedMessage id="Top.Title"/>
          </Typography>
          <Typography variant="h5" align="center" color="textSecondary" paragraph>
            <FormattedMessage id="Index.heroText"/>
          </Typography>
          <Typography align="center" color="textSecondary" paragraph>
            ホーム画面/デスクトップに追加してお使いください
          </Typography>
          <div>
            <Grid container spacing={2} justify="center">
              <Grid item>
                <Link to="/data" style={{textDecoration:"none"}}>
                  <Button variant="contained" color="primary">
                    <FormattedMessage id="Index.importButton"/>
                  </Button>
                </Link>
              </Grid>
              <Grid item>
                <Link to="/help" style={{textDecoration:"none"}}>
                  <Button variant="contained" color="secondary">
                    <FormattedMessage id="Index.helpButton"/>
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </div>
          <div style={{marginTop:"10px"}}>
            <Typography align="center" color="textSecondary" variant="caption" paragraph>
              気に入ったらシェアお願いします!
            </Typography>
            <Grid container spacing={1} justify="center">
              <Grid item xs={2}>
                <LineShareButton url={"https://bpi.poyashi.me"}>
                    <LineIcon size={32} round />
                </LineShareButton>
              </Grid>
              <Grid item xs={2}>
                <TwitterShareButton url={"https://bpi.poyashi.me"} title={"BPIManagerを使っています:"}>
                    <TwitterIcon size={32} round />
                </TwitterShareButton>
              </Grid>
            </Grid>
          </div>
          <div style={{marginTop:"15px"}}>
            <Grid container spacing={2} justify="center">
              <Grid item>
                <Typography align="center" color="textSecondary" variant="caption" paragraph>
                  If you're not familiar with Japanese, please go firstly to settings and you can change language there.
                </Typography>
                <Typography align="center" color="textSecondary" paragraph variant="caption">
                  <FormattedMessage id="Index.notes1"/>
                </Typography>
                <Typography align="center" color="textSecondary" paragraph variant="caption">
                  <FormattedMessage id="Index.notes2"/>
                </Typography>
                <Typography align="center" color="textSecondary" paragraph variant="caption">
                  BPIManager beta ver0.0.0.4<br/>
                  If you have encountered unintended behaviours or have opinions to make this tool much better, please contact <RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager</RefLink>.
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Container>
      </div>
    );
  }
}
