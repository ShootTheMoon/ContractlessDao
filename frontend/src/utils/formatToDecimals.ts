const formatToDecimals = (num: any, decimals: number) => {
    if (num == 0) return "0";
    num = String(num);
  
    if (decimals - num.length > 0) {
      num = "0".repeat(decimals - num.length) + num;
    }
  
    num = num.slice(0, num.length - decimals) + "." + num.slice(num.length - decimals);
    num = num.replace(/0+$/, "");
    if (num.charAt(num.length - 1) == ".") {
      num = num.replaceAll(".", "");
    }
  
    if (num.charAt(0) == ".") num = "0" + num;
    return num;
  };
  
  export default formatToDecimals;