import React from "react";

export default class TabPanel extends React.Component<{ value: number, index: number }, {}>{

  render() {
    if (this.props.value !== this.props.index) {
      return (null);
    }
    return this.props.children
  }
}
