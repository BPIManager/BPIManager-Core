import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

const SSelector: React.FC<{
  title: any;
  func: any;
  currentState: any;
  items: { key: string | number; value: any }[];
}> = ({ title, func, currentState, items }) => {
  return (
    <FormControl>
      <InputLabel>{title}</InputLabel>
      <Select value={currentState} onChange={func}>
        {items.map((item) => (
          <MenuItem value={item.key}>{item.value}</MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SSelector;
