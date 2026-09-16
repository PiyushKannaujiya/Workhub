const errorHandler = (err, req,res,next)=>{
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success :false,
        message :error.message,
    });
};

module.exports = errorHandler;