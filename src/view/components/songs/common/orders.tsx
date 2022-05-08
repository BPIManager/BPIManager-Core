import React from "react";

import Grid from "@mui/material/Grid";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FormattedMessage } from "react-intl";

interface P {
  handleOrderModeChange: (event: SelectChangeEvent<number>) => void;
  handleOrderTitleChange: (event: SelectChangeEvent<number>) => void;
  orderTitle: number;
  orderMode: number;
  orderTitles: string[];
}

class OrderBox extends React.Component<P, {}> {
  render() {
    const {
      orderTitle,
      orderMode,
      handleOrderModeChange,
      handleOrderTitleChange,
      orderTitles,
    } = this.props;
    return (
      <Grid container spacing={1} style={{ margin: "5px 0" }}>
        <Grid item xs={6}>
          <FormControl style={{ width: "100%" }}>
            <InputLabel>
              <FormattedMessage id="Orders.orderTitle" />
            </InputLabel>
            <Select value={orderTitle} onChange={handleOrderTitleChange}>
              {orderTitles.map((item, i) => (
                <MenuItem key={i} value={i}>
                  {item}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl style={{ width: "100%" }}>
            <InputLabel>
              <FormattedMessage id="Orders.orderMode" />
            </InputLabel>
            <Select value={orderMode} onChange={handleOrderModeChange}>
              <MenuItem value={0}>
                <FormattedMessage id="Orders.asc" />
              </MenuItem>
              <MenuItem value={1}>
                <FormattedMessage id="Orders.desc" />
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    );
  }
}

export default OrderBox;
