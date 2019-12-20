import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import RivalLists from "../components/rivals/list";
import RivalView from "../components/rivals/view";
import ShowSnackBar from '../components/snackBar';

interface S {
  currentView:number
  currentUser:any,
  message:string,
  showSnackBar:boolean,
}

class Stats extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      currentView:0,
      currentUser:null,
      message:"",
      showSnackBar:false,
    }
  }

  showEachRival = (rivalData:string)=> this.setState({currentView:1,currentUser:rivalData});
  backToMainPage = ()=> this.setState({currentView:0,currentUser:null});
  toggleSnack = (message:string = "ライバルを削除しました")=> this.setState({message:message,showSnackBar:!this.state.showSnackBar});

  render(){
    const {currentView,currentUser,message,showSnackBar} = this.state;
    return (
      <Container className="commonLayout" id="stat" fixed>
        {currentView === 0 && <RivalLists showEachRival={this.showEachRival}/>}
        {currentView === 1 && <RivalView toggleSnack={this.toggleSnack} backToMainPage={this.backToMainPage} rivalData={currentUser}/>}
        <ShowSnackBar message={message} variant="success"
            handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000}/>
      </Container>
    );
  }
}

export default injectIntl(Stats);
