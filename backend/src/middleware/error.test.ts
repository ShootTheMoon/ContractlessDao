import { errorHandler } from '#middleware/error.middleware';
import CustomError from '#types/customError';
import express from 'express';

describe('Error Middleware Test', () => {
  it('should respond with correct error and custom status code on throw when send message is true and status code is provided', () => {

    const errorMessage = 'Space time has torn';
    const error = new Error(errorMessage) as CustomError;
    error.status = 418; // I am a teapot
    error.sendMessage = true;

    const mockReq = {} as express.Request;
    const mockRes = {} as express.Response;
    const mockNext = jest.fn() as jest.Mock<express.NextFunction>;

    mockRes.status = jest.fn().mockReturnThis(),
    mockRes.send = jest.fn();

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(error.status);
    expect(mockRes.send).toHaveBeenCalledWith( {
      'data': null,
      'message': errorMessage,
      'success': false,
    });
  });

  it('should respond with correct error and default status code on throw when send message is true and no status code is provided', () => {

    const errorMessage = 'Space time has torn';
    const error = new Error(errorMessage) as CustomError;
    error.sendMessage = true;

    const mockReq = {} as express.Request;
    const mockRes = {} as express.Response;
    const mockNext = jest.fn() as jest.Mock<express.NextFunction>;

    mockRes.status = jest.fn().mockReturnThis(),
    mockRes.send = jest.fn();

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith( {
      'data': null,
      'message': errorMessage,
      'success': false,
    });
  });

  it('should respond with default error and default status code on throw when set message is false and status is not provided', () => {

    const errorMessage = 'Space time has torn';
    const error = new Error(errorMessage) as CustomError;
    error.sendMessage = false;

    const mockReq = {} as express.Request;
    const mockRes = {} as express.Response;
    const mockNext = jest.fn() as jest.Mock<express.NextFunction>;

    mockRes.status = jest.fn().mockReturnThis(),
    mockRes.send = jest.fn();

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith( {
      'data': null,
      'message': 'Something went wrong',
      'success': false,
    });
  });

  it('should respond with default error and default status code on throw when no message is provided and status is not provided', () => {

    const error = new Error as CustomError;
    error.sendMessage = true;

    const mockReq = {} as express.Request;
    const mockRes = {} as express.Response;
    const mockNext = jest.fn() as jest.Mock<express.NextFunction>;

    mockRes.status = jest.fn().mockReturnThis(),
    mockRes.send = jest.fn();

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.send).toHaveBeenCalledWith( {
      'data': null,
      'message': 'Something went wrong',
      'success': false,
    });
  });
});