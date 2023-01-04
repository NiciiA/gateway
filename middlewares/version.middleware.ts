import {Request, Response, NextFunction} from 'express';
import ApiGateway from "moleculer-web";

export default (req: Request, res: Response, next: NextFunction) => {
	console.log('Request Type:', req.method);
	next();
	/*
	throw new ApiGateway.Errors.UnAuthorizedError(
		ApiGateway.Errors.ERR_INVALID_TOKEN,
		null,
	);
	 */
};
