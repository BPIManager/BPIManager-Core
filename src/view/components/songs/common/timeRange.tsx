import * as React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import { toMoment } from '@/components/common/timeFormatter';
import MomentUtils from '@date-io/dayjs';
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import Alert from '@material-ui/lab/Alert';

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
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <Grid container>
              <Grid item xs={12} sm={6}>
                <KeyboardDatePicker
                  margin="normal"
                  label="始点日付"
                  format="YYYY/MM/DD"
                  value={from}
                  fullWidth
                  onChange={this.handleFromInput}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <KeyboardDatePicker
                  margin="normal"
                  label="終点日付"
                  format="YYYY/MM/DD"
                  value={to}
                  fullWidth
                  onChange={this.handleToInput}
                />
              </Grid>
            </Grid>
          </MuiPickersUtilsProvider>
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
