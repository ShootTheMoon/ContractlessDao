interface CustomError extends Error {
    sendMessage: boolean;
    status: number;
  }
  
export default CustomError;
  