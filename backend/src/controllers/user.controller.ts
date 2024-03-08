import express from 'express';
import User from '#services/user.service';
import sendResponse from '#utils/response';


/**
 * Handles the GET request to retrieve a user by their ID. It checks if the userId is provided in the query parameters.
 * If not, it sends an error response. Otherwise, it attempts to fetch the user's details and send them back in the response.
 *
 * @param {express.Request} req - The request object, which should include a userId in the query parameters.
 * @param {express.Response} res - The response object used to send back the HTTP response.
 * @async
 * @returns {Promise<void>}
 */
export async function get_user(req: express.Request, res: express.Response): Promise<void>{
  if(!req.query.userId){
    res.send({msg: 'Error, no user id provided', payload: null});
    return; 
  } 
  
  const user = new User(req.query.userId as string);

  await user.getUser();

  sendResponse(res, 200, true, 'User found', {user: user.userDocument});
}