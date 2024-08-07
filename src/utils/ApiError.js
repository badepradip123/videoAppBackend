class ApiError extends Error{
    constructor(statusCode, message="Something went wrong", errors= [], stack ="", name){
        super(message);
        this.statusCode  =  statusCode;
        this.message = message;
        this.data = null;
        this.success = false;
        this.errors = errors;
        this.name = name;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
        
    }
}

export {ApiError};