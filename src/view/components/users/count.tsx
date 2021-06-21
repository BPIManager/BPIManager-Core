import * as React from 'react';
import Typography from '@material-ui/core/Typography';
import FolloweeList from './list';
import Link from '@material-ui/core/Link';

interface P{
  ids:string[],
  text:string,
  userName:string
}

interface S{
  showList:boolean
}

class FolloweeCounter extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      showList:false
    }
  }

  toggleShowList = ()=> this.setState({showList:!this.state.showList});

  render(){
    const {ids,text,userName} = this.props;
    return (
      <React.Fragment>
        <Typography component="h6" variant="h6" color="textSecondary">
          {text}
        </Typography>
        <Typography component="h4" variant="h4" color="textPrimary" onClick={this.toggleShowList}>
          <Link color="secondary">{ids.length}</Link>
        </Typography>
        {this.state.showList && <FolloweeList handleClose={this.toggleShowList} ids={ids} text={text} userName={userName}/>}
      </React.Fragment>
    );
  }
}

export default FolloweeCounter;
