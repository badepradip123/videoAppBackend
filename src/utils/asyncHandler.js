const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn();
        
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.messgae
        })
    }
};

export {asyncHandler};