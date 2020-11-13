import * as React from 'react';
import Container from '@material-ui/core/Container';
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
      <Container fixed  className="commonLayout">
        {!userData && <SyncLoginScreen mode={0}/>}
        {userData && <ControlTab userData={userData}/>}
      </Container>
    );
  }
}

export default SyncIndex;
