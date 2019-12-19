import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import RivalLists from "../components/rivals/list";

interface S {
  currentView:number
  currentUser:string|null,
}

class Stats extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      currentView:0,
      currentUser:null,
    }
  }

  setCurrentUser = (newUser:string|null)=> this.setState({currentUser:newUser});

  render(){
    return (
      <Container className="commonLayout" id="stat" fixed>
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          <FormattedMessage id="GlobalNav.Rivals"/>
        </Typography>
        <RivalLists/>
      </Container>
    );
  }
}

export default injectIntl(Stats);
