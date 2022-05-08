import React from "react";

const Panel: React.FC<{
  value: number;
  index: number;
  children: React.ReactElement | null;
}> = ({ value, index, children }) => {
  if (value !== index) {
    return null;
  }
  return children;
};

export default Panel;
