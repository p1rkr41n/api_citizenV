
module.exports = (req,res,next) =>{
    if(req.decodedToken.role == 'B2' ||req.decodedToken.role == 'B1' )
        return next()
    return res.status(403).send("Access denied")
}