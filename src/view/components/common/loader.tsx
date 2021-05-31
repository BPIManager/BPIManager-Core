import * as React from 'react';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';

export default class Loader extends React.Component<{
  hasMargin?:boolean
  text?:string,
  isInner?:boolean,
  isFull?:boolean
},{}> {

  render(){
    const {hasMargin,text,isInner,isFull} = this.props;
    if(!text){
      return (
        <Container fixed  className={hasMargin ? "loaderCentered" : "loaderCenteredOnly"} style={{maxWidth:"100%"}}>
          <CircularProgress color="secondary" />
        </Container>
      )
    }
    if(isFull){
      return (
        <Container fixed  className={hasMargin ? "loaderCentered" : "loaderCenteredOnly"} style={{maxWidth:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"}}>
          <CircularProgress color="secondary" />
          <p style={{opacity:"0.5"}}>{text}</p>
        </Container>
      )
    }
    if(isInner){
      return (<CircularProgress size={24} style={{color:"#ccc",position:"absolute",top:"50%",left:"50%",marginTop:-12,marginLeft:-12}} />)
    }
    return (
      <Container fixed  className={hasMargin ? "loaderCentered" : "loaderCenteredOnly"} style={{maxWidth:"100%"}}>
        <CircularProgress color="secondary" />
        <p style={{opacity:"0.5"}}>{text}</p>
      </Container>
    );
  }
}
