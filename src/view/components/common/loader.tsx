import * as React from 'react';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgress from '@mui/material/LinearProgress';

export default class Loader extends React.Component<{
  hasMargin?:boolean
  text?:string,
  isInner?:boolean,
  isFull?:boolean,
  isLine?:boolean
},{}> {

  render(){
    const {hasMargin,text,isInner,isFull,isLine} = this.props;
    if(isLine && text){
      return (
        <Container fixed style={{maxWidth:"100%",height:"100%",marginTop:"15px"}}>
          <LinearProgress color="secondary" />
          <p style={{opacity:"0.5",textAlign:"center"}}>{text}</p>
        </Container>
      )
    }
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
