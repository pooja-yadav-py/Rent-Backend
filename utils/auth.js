const jwt = require('jsonwebtoken')

const ensureAuthenticated = (req,res,next)=>{
 if(!req.headers['authorization']){
    return res.status(403).json({message:"Token is required"})
 }
 try {
    const decoded = jwt.verify(req.headers['authorization'],process.env.SECRET)
    return next();
 } catch (error) {
    return res.status(403).json({
        message:"This token is not valid or it's expired"
    })
 }
}

module.exports ={
    ensureAuthenticated
}