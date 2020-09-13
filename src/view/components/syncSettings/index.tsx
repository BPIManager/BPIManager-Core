import * as React from 'react';
import Container from '@material-ui/core/Container';
import SyncLoginScreen from '../sync/login';
import fbActions from '@/components/firebase/actions';
import Loader from '../common/loader';
import ControlTab from './control';

interface S {
  isLoading:boolean,
  isError:boolean,
  userData:any
}

class SyncSettings extends React.Component<{},S> {

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
      return (<Loader hasMargin/>);
    }
    return (
      <Container fixed  className="commonLayout">
        {!userData && <SyncLoginScreen mode={0}/>}
        {userData && <ControlTab userData={userData}/>}
      </Container>
    );
  }
}

export default SyncSettings;
