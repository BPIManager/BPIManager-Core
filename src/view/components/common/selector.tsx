import * as React from 'react';
import { FormattedMessage } from "react-intl";
import Grid from '@material-ui/core/Grid';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

const difficultiesSelector = [{label:"H",val:"hyper",name:"0"},{label:"A",val:"another",name:"1"},{label:"L",val:"leggendaria",name:"2"}];
const levelsSelector = [{label:"☆11",val:"11",name:"11"},{label:"☆12",val:"12",name:"12"}];
const pmSelector = [{label:"+",val:"+",name:"+"},{label:"-",val:"-",name:"-"}];

interface P{
  includePMButtons?:boolean,
  options:{[key:string]:string[]},
  handleChange:(name:string,target:string)=>(e:React.ChangeEvent<HTMLInputElement>)=>void
}

class FilterByLevelAndDiff extends React.Component<P,{}> {

  render(){
    const {options,handleChange,includePMButtons} = this.props;
    return (
      <Grid container spacing={1} id="mainFilters" style={{margin:"5px 0"}}>
        <Grid item xs={includePMButtons ? 4 : 6}>
          <FormControl component="fieldset">
            <FormLabel component="legend"><FormattedMessage id="Songs.filterByLevel"/></FormLabel>
            <FormGroup row>
              {levelsSelector.map(item=>(
                <FormControlLabel
                  key={item.label}
                  control={<Checkbox checked={options.level.some(t=> t === item.name)} onChange={handleChange(item.name,"level")} value={item.val} />}
                  label={item.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Grid>
        <Grid item xs={includePMButtons ? 5 : 6}>
          <FormControl component="fieldset">
            <FormLabel component="legend"><FormattedMessage id="Songs.filterByDifficulty"/></FormLabel>
            <FormGroup row>
              {difficultiesSelector.map(item=>(
                <FormControlLabel
                  key={item.label}
                  control={<Checkbox checked={options.difficulty.some(t=> t === item.name)} onChange={handleChange(item.name,"difficulty")} value={item.val} />}
                  label={item.label}
                />
              ))}
            </FormGroup>
          </FormControl>
        </Grid>
        {includePMButtons && (
          <Grid item xs={3}>
            <FormControl component="fieldset">
              <FormLabel component="legend"><FormattedMessage id="Compare.filterByPlusMinus"/></FormLabel>
              <FormGroup row>
                {pmSelector.map(item=>(
                  <FormControlLabel
                    key={item.label}
                    control={<Checkbox checked={options.pm.some(t=> t === item.name)} onChange={handleChange(item.name,"pm")} value={item.val} />}
                    label={item.label}
                  />
                ))}
              </FormGroup>
            </FormControl>
          </Grid>
        )}
      </Grid>
    );
  }
}

export default FilterByLevelAndDiff;
