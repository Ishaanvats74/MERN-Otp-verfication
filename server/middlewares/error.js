class ErrorHandler extends Error{
    constructor(message, statuscode){
        super(message);
        this.statuscode = statuscode;

    }
}


export const errorMiddleware = (err,req,res,next)=>{
    err.statuscode = err.statuscode || 500;
    err.message = err.message || "Internal Server Error";
    console.log(err);

    if(err.name === "CastError"){
        const statuscode = 400;
        const message = `Resource not found. Invalid: ${err.path}`;
        err = new ErrorHandler(message, statuscode);
    }
    if(err.name === "JsonWebTokenError"){
        const statuscode = 400;
        const message = `Json web token is invalid, try again.`;
        err = new ErrorHandler(message, statuscode);
    }
    if(err.name === "TokenExpiredError"){
        const statuscode = 400;
        const message = `Json web token is expired, try again.`;
        err = new ErrorHandler(message, statuscode);
    }
    if(err.code === 11000){
        const statuscode = 400;
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
        err = new ErrorHandler(message, statuscode);
    }
}