const formatNumberDisplay = (num: any, decimals: number) => {
    if (num > 100000) {
      num = num.toFixed(3);
    } else if (num > 1) {
      num = num.toFixed(4);
    } else if (num == 0) {
      num = 0;
    } else {
      num = num.toFixed(decimals);
    }
    return num;
  };
  
  export default formatNumberDisplay;