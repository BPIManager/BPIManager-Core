import React from 'react';
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";

interface P {
  meta: any
}

class Settings extends React.Component<P, {
}> {

  state = {

  }

  async componentDidMount() {

  }

  render() {
    const { meta } = this.props;
    console.log(meta);
    return (
      <React.Fragment>
        <Container>

        </Container>
      </React.Fragment>
    );
  }
}

export default Settings;
