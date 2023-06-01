

const criticalError = ((err, req, res, next) => {
    console.log(`Error: ${err}`);
    res.status(500).json({
        message: 'Something went wrong'
    });
    next();
})

module.exports = criticalError;