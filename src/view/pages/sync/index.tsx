import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

interface S {
  isLoading:boolean,
  isError:boolean,
  userData:any
}

class SyncIndex extends React.Component<{},S> {

  constructor(props:{}){
    super(props);
    this.state ={
      isLoading:false,
      isError:false,
      userData:null,
    }
  }

  render(){
    const {isLoading,} = this.state;
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>
      );
    }
    return (
      <Container className="commonLayout" fixed>
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          <FormattedMessage id="Settings.title"/>
        </Typography>
        <Paper style={{padding:"15px"}}>
        </Paper>
      </Container>
    );
  }
}

export default Settings;
