import * as React from 'react';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';

export default class Loader extends React.Component<{
  hasMargin?:boolean
  text?:string,
  isInner?:boolean
},{}> {

  render(){
    const {hasMargin,text,isInner} = this.props;
    if(isInner){
      return (<CircularProgress size={24} style={{color:"#ccc",position:"absolute",top:"50%",left:"50%",marginTop:-12,marginLeft:-12}} />)
    }
    return (
      <Container className={hasMargin ? "loaderCentered" : "loaderCenteredOnly"}>
        <CircularProgress color="secondary" />
        <p style={{opacity:"0.5"}}>{text}</p>
      </Container>
    );
  }
}
