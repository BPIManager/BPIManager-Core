import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { FormattedMessage } from 'react-intl';
import Divider from '@material-ui/core/Divider';
import {Link as RefLink} from '@material-ui/core/';

export default class Index extends React.Component<{},{}> {

  render(){
    return (
      <div>
        <Container className="commonLayout" fixed>
          <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
            <FormattedMessage id="Help.title"/>
          </Typography>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.AboutThisSite"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <FormattedMessage id="Help.A.1"/><br/>
                <FormattedMessage id="Help.A.2"/><br/>
                <FormattedMessage id="Help.A.3"/>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Functions"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <FormattedMessage id="Help.B.1"/><br/>
                <FormattedMessage id="Help.B.2"/><br/>
                <FormattedMessage id="Help.B.3"/><br/>
                <FormattedMessage id="Help.B.4"/><br/>
                <FormattedMessage id="Help.B.4.1"/>
                <Divider style={{margin:"10px 0"}}/>
                <FormattedMessage id="Help.B.5"/>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.HowToUse"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <FormattedMessage id="Help.C.1"/>
                <Divider style={{margin:"10px 0"}}/>
                <FormattedMessage id="Help.C.2"/><br/>
                <FormattedMessage id="Help.C.3"/><br/>
                <FormattedMessage id="Help.C.4"/><br/>
                <FormattedMessage id="Help.C.5"/><br/>
                <FormattedMessage id="Help.C.6"/>
                <Divider style={{margin:"10px 0"}}/>
                <FormattedMessage id="Help.C.7"/><br/>
                <FormattedMessage id="Help.C.8"/><br/>
                <FormattedMessage id="Help.C.9"/><br/>
                <FormattedMessage id="Help.C.10"/>
                <FormattedMessage id="Help.C.11"/>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Settings"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <FormattedMessage id="Help.D.1"/><br/>
                <FormattedMessage id="Help.D.1.1"/><br/>
                <FormattedMessage id="Help.D.2"/><br/>
                <FormattedMessage id="Help.D.2.1"/><br/>
                <FormattedMessage id="Help.D.3"/><br/>
                <FormattedMessage id="Help.D.3.1"/><br/>
                <FormattedMessage id="Help.D.3.2"/><br/>
                <FormattedMessage id="Help.D.4"/><br/>
                <FormattedMessage id="Help.D.5"/><br/>
                <FormattedMessage id="Help.D.6"/><br/>
                <FormattedMessage id="Help.D.7"/><br/>
                <FormattedMessage id="Help.D.8"/><br/>
                <FormattedMessage id="Help.D.9"/><br/>
                <FormattedMessage id="Help.D.10"/>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Sync"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <FormattedMessage id="Help.DD.1"/><br/>
                <FormattedMessage id="Help.DD.2"/><br/>
                <FormattedMessage id="Help.DD.3"/><br/>
                <FormattedMessage id="Help.DD.4"/><br/>
                <FormattedMessage id="Help.DD.5"/><br/>
                <FormattedMessage id="Help.DD.6"/><br/>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Contact"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <FormattedMessage id="Help.E.1"/>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Requirements"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <FormattedMessage id="Help.F.1"/>
                <Divider style={{margin:"10px 0"}}/>
                <FormattedMessage id="Help.F.2"/><br/>
                <FormattedMessage id="Help.F.3"/><br/>
                <FormattedMessage id="Help.F.4"/>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Licenses"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                material-ui : Copyright (c) 2014 Call-Em-All <a href="https://opensource.org/licenses/mit-license.php" target="_blank" rel="noreferrer noopener">The MIT License (MIT)</a><br/>
                Dexie.js : Copyright (c) dfahlander <a href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noreferrer noopener">Apache License</a><br/>
                fast-deep-equal : Copyright (c) epoberezkin MIT<br/>
                firebase : Copyright (c) firebase Apache License<br/>
                moment,moment-timezone : Copyright (c) JS Foundation and other contributors MIT<br/>
                react : Copyright (c) Facebook MIT<br/>
                react-dom : Copyright (c) 2017 Tylor Steinberger MIT<br/>
                react-router : Copyright (c) React Training 2016-2018 MIT<br/>
                react-share : Copyright (c) Klaus Nygard<br/>
                react-intl : Copyright (c) Yahoo! BSD License<br/>
                recharts : Copyright (c) recharts MIT<br/>
                typescript : Copyright (c) Microsoft Apache License<br/>
                unstated : Copyright (c) 2018-present James Kyle MIT<br/>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                Updates
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager(Twitter)</RefLink>にて更新情報をツイートしています。
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Disclaimer"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <FormattedMessage id="Help.G"/>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Donation"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <div>
                <FormattedMessage id="Help.H.1"/><br/>
                <FormattedMessage id="Help.H.2"/><br/>
                <FormattedMessage id="Help.H.3"/><br/>
                <RefLink color="secondary" href="https://www.amazon.co.jp/dp/B004N3APGO/">Amazonギフト券の送信はこちらから</RefLink>
              </div>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Container>
      </div>
    );
  }
}
