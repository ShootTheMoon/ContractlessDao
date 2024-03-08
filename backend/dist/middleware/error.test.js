"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const error_middleware_1 = require("#middleware/error.middleware");
describe('Error Middleware Test', () => {
    it('should respond with correct error and custom status code on throw when send message is true and status code is provided', () => {
        const errorMessage = 'Space time has torn';
        const error = new Error(errorMessage);
        error.status = 418; // I am a teapot
        error.sendMessage = true;
        const mockReq = {};
        const mockRes = {};
        const mockNext = jest.fn();
        mockRes.status = jest.fn().mockReturnThis(),
            mockRes.send = jest.fn();
        (0, error_middleware_1.errorHandler)(error, mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(error.status);
        expect(mockRes.send).toHaveBeenCalledWith({
            'data': null,
            'message': errorMessage,
            'success': false,
        });
    });
    it('should respond with correct error and default status code on throw when send message is true and no status code is provided', () => {
        const errorMessage = 'Space time has torn';
        const error = new Error(errorMessage);
        error.sendMessage = true;
        const mockReq = {};
        const mockRes = {};
        const mockNext = jest.fn();
        mockRes.status = jest.fn().mockReturnThis(),
            mockRes.send = jest.fn();
        (0, error_middleware_1.errorHandler)(error, mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            'data': null,
            'message': errorMessage,
            'success': false,
        });
    });
    it('should respond with default error and default status code on throw when set message is false and status is not provided', () => {
        const errorMessage = 'Space time has torn';
        const error = new Error(errorMessage);
        error.sendMessage = false;
        const mockReq = {};
        const mockRes = {};
        const mockNext = jest.fn();
        mockRes.status = jest.fn().mockReturnThis(),
            mockRes.send = jest.fn();
        (0, error_middleware_1.errorHandler)(error, mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            'data': null,
            'message': 'Something went wrong',
            'success': false,
        });
    });
    it('should respond with default error and default status code on throw when no message is provided and status is not provided', () => {
        const error = new Error;
        error.sendMessage = true;
        const mockReq = {};
        const mockRes = {};
        const mockNext = jest.fn();
        mockRes.status = jest.fn().mockReturnThis(),
            mockRes.send = jest.fn();
        (0, error_middleware_1.errorHandler)(error, mockReq, mockRes, mockNext);
        expect(mockRes.status).toHaveBeenCalledWith(500);
        expect(mockRes.send).toHaveBeenCalledWith({
            'data': null,
            'message': 'Something went wrong',
            'success': false,
        });
    });
});
//# sourceMappingURL=error.test.js.map