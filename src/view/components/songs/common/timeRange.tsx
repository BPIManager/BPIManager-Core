import * as React from 'react';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import { toMoment } from '@/components/common/timeFormatter';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import DatePicker from '@mui/lab/DatePicker';
import Alert from '@mui/material/Alert';
import { TextField } from '@mui/material';

interface P {
  handleToggle:()=>void,
  applyTimeFilter:(state:S)=>void,
  dateRange:S
}

interface S {
  from:string,
  to:string
}


class TimeRangeDialog extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      from:toMoment(props.dateRange.from),
      to:toMoment(props.dateRange.to),
    }
  }

  componentDidMount(){
    window.history.pushState(null,"Filter",null);
    window.addEventListener("popstate",this.overridePopstate,false);
  }

  componentWillUnmount(){
    window.removeEventListener("popstate",this.overridePopstate,false);
  }

  overridePopstate = ()=>this.props.handleToggle();

  applyAndClose = ()=>{
    this.props.applyTimeFilter({from:this.state.from,to:this.state.to});
    return this.props.handleToggle();
  }

  handleFromInput = (date:any) => {
    this.setState({from:toMoment(date || new Date())});
  };

  handleToInput = (date:any) => {
    this.setState({to:toMoment(date || new Date())});
  };

  render(){
    const {handleToggle} = this.props;
    const {from,to} = this.state;
    return (
      <Dialog open={true} onClose={handleToggle}>
        <DialogTitle>期間指定</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Grid container>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="始点日付"
                  inputFormat="YYYY/MM/DD"
                  value={from}
                  renderInput={(props) => (
                    <TextField {...props} fullWidth />
                  )}
                  onChange={this.handleFromInput}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="終点日付"
                  inputFormat="YYYY/MM/DD"
                  value={to}
                  renderInput={(props) => (
                    <TextField {...props} fullWidth />
                  )}
                  onChange={this.handleToInput}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
          <Alert severity="info">「始点日付」と「終点日付」の間の期間中にデータを更新した楽曲を表示します。<br/>
          その期間以降にスコアやクリアランプを更新している場合はリストに表示されません。</Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggle} color="primary">
            閉じる
          </Button>
          <Button onClick={this.applyAndClose} color="primary">
            適用
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default TimeRangeDialog;
