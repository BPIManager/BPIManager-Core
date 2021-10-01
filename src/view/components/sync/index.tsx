import * as React from 'react';
import Container from '@mui/material/Container';
import SyncLoginScreen from './login';
import fbActions from '@/components/firebase/actions';
import Loader from '../common/loader';
import ControlTab from './controlTabs';

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
      return (<Loader hasMargin text="連携情報を取得中"/>);
    }
    return (
      <React.Fragment>
        {!userData && (
          <Container fixed  className="commonLayout" id="stat">
            <SyncLoginScreen mode={0}/>
          </Container>)}
        {userData && <ControlTab userData={userData}/>}
      </React.Fragment>
    );
  }
}

export default SyncIndex;
