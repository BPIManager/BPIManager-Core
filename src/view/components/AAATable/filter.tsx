import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";

interface Props {
  closeModal: () => void;
  targetLevel: number;
  result: any;
  changeTarget: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  changeLevel: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isChecked: (input: number, target: number) => boolean;
  handleChange: (input: number, target: number) => void;
  toggle: () => void;
  defaultPM: number[];
  _default: number[];
  target: number;
}

export const AAATableFilterModal: React.FC<Props> = ({
  closeModal,
  targetLevel,
  changeLevel,
  toggle,
  _default,
  result,
  isChecked,
  handleChange,
  defaultPM,
  target,
  changeTarget,
}) => (
  <Dialog open={true} onClose={closeModal}>
    <DialogTitle>表示項目を設定</DialogTitle>
    <DialogContent>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" color="primary">
          ターゲット
        </FormLabel>
        <RadioGroup
          aria-label="position"
          name="position"
          value={target}
          onChange={changeTarget}
          row
        >
          <FormControlLabel
            value={0}
            control={<Radio color="secondary" />}
            label="AAA"
            labelPlacement="end"
          />
          <FormControlLabel
            value={1}
            control={<Radio color="secondary" />}
            label="MAX-"
            labelPlacement="end"
          />
        </RadioGroup>
      </FormControl>
      <FormControl component="fieldset" fullWidth>
        <FormLabel component="legend" color="primary">
          表示対象
        </FormLabel>
        <RadioGroup
          aria-label="position"
          name="position"
          value={targetLevel}
          onChange={changeLevel}
          row
        >
          <FormControlLabel
            value={11}
            control={<Radio color="secondary" />}
            label="☆11"
            labelPlacement="end"
          />
          <FormControlLabel
            value={12}
            control={<Radio color="secondary" />}
            label="☆12"
            labelPlacement="end"
          />
        </RadioGroup>
      </FormControl>
      <FormControl>
        <FormLabel
          component="legend"
          onClick={toggle}
          style={{ cursor: "pointer" }}
        >
          範囲選択 (
          <span style={{ textDecoration: "underline" }}>
            ここをクリックで状態反転
          </span>
          )
        </FormLabel>
        <FormGroup row>
          {_default.map((item: number) => {
            if (result[item].length === 0) return null;
            return (
              <FormControlLabel
                key={item}
                control={
                  <Checkbox
                    checked={isChecked(item, 0)}
                    onChange={() => handleChange(item, 0)}
                    value={item}
                  />
                }
                label={item}
              />
            );
          })}
        </FormGroup>
      </FormControl>
      <FormControl>
        <FormLabel component="legend">正負選択</FormLabel>
        <FormGroup row>
          {defaultPM.map((item: number) => (
            <FormControlLabel
              key={item}
              control={
                <Checkbox
                  checked={isChecked(item, 1)}
                  onChange={() => handleChange(item, 1)}
                  value={item}
                />
              }
              label={item === 0 ? "+" : item === 1 ? "-" : "NOPLAY"}
            />
          ))}
        </FormGroup>
      </FormControl>
    </DialogContent>
    <DialogActions>
      <Button onClick={closeModal} color="primary">
        閉じる
      </Button>
    </DialogActions>
  </Dialog>
);
