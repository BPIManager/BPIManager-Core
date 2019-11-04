import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import { Subscribe } from 'unstated';
import GlobalContainer from '../../components/context/global';
import Button from '@material-ui/core/Button';
import UpdateIcon from '@material-ui/icons/Update';

interface S {
  isLoading:boolean,
}

class Settings extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      isLoading:false,
    }
  }

  async componentDidMount(){
  }

  render(){
    const {isLoading} = this.state;
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>
      );
    }
    return (
      <Subscribe to={[GlobalContainer]}>
        {({state,setLang,setStore}:GlobalContainer)=> (
          <Container className="commonLayout" fixed>
            <Typography component="h4" variant="h4" color="textPrimary" gutterBottom>
              <FormattedMessage id="Settings.title"/>
            </Typography>
            <Paper style={{padding:"15px"}}>
              <FormControl>
                <InputLabel><FormattedMessage id="Settings.language"/></InputLabel>
                <Select value={state.lang} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
                  if(typeof e.target.value === "string"){
                    setLang(e.target.value)
                  }
                }}>
                  <MenuItem value="ja">日本語</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.noteLang"/>
              </Typography>
              <Divider style={{margin:"10px 0"}}/>
              <FormControl>
                <InputLabel><FormattedMessage id="Settings.dataStore"/></InputLabel>
                <Select value={state.store} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
                  if(typeof e.target.value === "string"){
                    setStore(e.target.value)
                  }
                }}>
                  <MenuItem value="26">26 Rootage</MenuItem>
                  <MenuItem value="27">27 HEROIC VERSE</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.noteMes1"/>
              </Typography>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.inaccurateMes"/>
              </Typography>
              <Divider style={{margin:"10px 0"}}/>
                <FormControl>
                  <Typography variant="caption" display="block" className="MuiFormLabel-root MuiInputLabel-animated MuiInputLabel-shrink">
                    <FormattedMessage id="Settings.Update"/>
                  </Typography>
                  <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<UpdateIcon />}
                  >
                  <FormattedMessage id="Settings.UpdateResourcePacks"/>
                  </Button>
                </FormControl>
                <Typography variant="caption" display="block">
                  <FormattedMessage id="Settings.currentVersion"/>
                </Typography>
                <Typography variant="caption" display="block">
                  <FormattedMessage id="Settings.updateWarning"/>
                </Typography>
            </Paper>
          </Container>
        )}
      </Subscribe>
    );
  }
}

export default injectIntl(Settings);
