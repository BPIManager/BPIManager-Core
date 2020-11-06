import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';

interface S {
  isLoading:boolean,
  onGoing:any
}

class Ranking extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      isLoading:true,
      onGoing:null
    }
  }

  render(){
    return (
      <Container fixed  className="commonLayout">
        
      </Container>
    );
  }
}

export default injectIntl(Ranking);
