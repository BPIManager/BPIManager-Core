import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import SyncLoginScreen from './login';
import SyncControlScreen from './control';
import fbActions from '../../../components/firebase/actions';
import Loader from '../common/loader';

interface S {
  isLoading:boolean,
  isError:boolean,
  userData:any
}

class SyncIndex extends React.Component<{},S> {

  constructor(props:{}){
    super(props);
    this.state ={
      isLoading:true,
      isError:false,
      userData:null,
    }
  }

  componentDidMount(){
    new fbActions().auth().onAuthStateChanged((user: any)=> {
      this.setState({userData:user,isLoading:false})
    });
  }

  render(){
    const {isLoading,userData} = this.state;

    if(isLoading){
      return (<Loader/>);
    }
    return (
      <Container className="commonLayout" fixed>
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          Sync
        </Typography>
        <Paper style={{padding:"15px"}}>
          {!userData && <SyncLoginScreen/>}
          {userData && <SyncControlScreen userData={userData}/>}
        </Paper>
      </Container>
    );
  }
}

export default SyncIndex;
