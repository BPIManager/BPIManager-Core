import * as React from 'react';

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { FormattedMessage } from "react-intl";

interface P {
  handleOrderModeChange:(event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>)=>void,
  handleOrderTitleChange:(event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>)=>void,
  orderTitle:number,
  orderMode:number,
  orderTitles:string[]
}

class OrderBox extends React.Component<P,{}> {

  render(){
    const {orderTitle,orderMode,handleOrderModeChange,handleOrderTitleChange,orderTitles} = this.props;
    return (
    <Grid container spacing={1} style={{margin:"5px 0"}}>
      <Grid item xs={6}>
        <FormControl style={{width:"100%"}}>
          <InputLabel><FormattedMessage id="Orders.orderTitle"/></InputLabel>
          <Select value={orderTitle} onChange={handleOrderTitleChange}>
          {orderTitles.map((item,i)=>
            <MenuItem key={i} value={i}>{item}</MenuItem>
          )}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <FormControl style={{width:"100%"}}>
          <InputLabel><FormattedMessage id="Orders.orderMode"/></InputLabel>
          <Select value={orderMode} onChange={handleOrderModeChange}>
            <MenuItem value={0}><FormattedMessage id="Orders.asc"/></MenuItem>
            <MenuItem value={1}><FormattedMessage id="Orders.desc"/></MenuItem>
          </Select>
        </FormControl>
      </Grid>
    </Grid>
    );
  }
}

export default OrderBox;
