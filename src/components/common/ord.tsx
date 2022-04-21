const _withOrd = (rank: number): string => {
  const j = rank % 10,
    k = rank % 100;
  if (j === 1 && k !== 11) {
    return rank + "st";
  }
  if (j === 2 && k !== 12) {
    return rank + "nd";
  }
  if (j === 3 && k !== 13) {
    return rank + "rd";
  }
  return rank + "th";
};

export default _withOrd;
