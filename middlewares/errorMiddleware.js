export const errorMiddleware = (err, req, res, next) => {
    const defaultErrors = {
        statusCode: err.status || 500,
        message: err.message || "Something went wrong",
    };
    res.status(defaultErrors.statusCode).json({ message: defaultErrors.message, success: false });
};
