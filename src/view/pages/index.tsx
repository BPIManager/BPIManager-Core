import * as React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from "react-intl";

export default class Index extends React.Component<{},{}> {

  render(){
    return (
      <div className="heroLayout">
        <Container fixed>
          <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
            <FormattedMessage id="Top.Title"/>
          </Typography>
          <Typography variant="h5" align="center" color="textSecondary" paragraph>
            <FormattedMessage id="Index.heroText"/>
          </Typography>
          <Typography align="center" color="textSecondary" paragraph>
            If you're not familiar with Japanese, please go firstly to settings and you can change language there.
          </Typography>
          <div>
            <Grid container spacing={2} justify="center">
              <Grid item>
                <Button variant="contained" color="primary">
                  <FormattedMessage id="Index.importButton"/>
                </Button>
              </Grid>
            </Grid>
          </div>
          <div>
            <Grid container spacing={2} justify="center">
              <Grid item>
                <Typography align="center" color="textSecondary" paragraph>
                  <FormattedMessage id="Index.notes1"/><br/>
                  <FormattedMessage id="Index.notes2"/>
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Container>
      </div>
    );
  }
}
