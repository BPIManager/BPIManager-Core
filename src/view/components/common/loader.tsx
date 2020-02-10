import * as React from 'react';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';

export default class Loader extends React.Component<{},{}> {

  render(){
    return (
      <Container className="loaderCentered">
        <CircularProgress color="secondary" />
      </Container>
    );
  }
}
