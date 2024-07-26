
const joi = require('joi')

const userRegisterValidate = ( req,res,next )=>{
    const schema = joi.object({
        fullName: joi.string().min(3).max(50).required(),
        email: joi.string().email().required(),
        password: joi.string().min(4).required()
    })

    const {error,value} = schema.validate(req.body);
    if(error){
        const errorMessage = error.details.map(detail => detail.message).join(', ')
        console.log(errorMessage)
        return res.status(400).json({message:errorMessage, errorMessage})
    }
    next();
}


const userLoginValidate = (req,res,next) =>{
    const schema = joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(4).required()
    })

    const {error,value} = schema.validate(req.body);
    if(error){
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(422).json({message:errorMessage, errorMessage})
    }
    next();
}

const otpMailvalidator = (req,res,next) =>{
    const schema = joi.object({
        email: joi.string().email().required(),
    })
    const {error,value} = schema.validate(req.body);
    if(error){
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(422).json({message:errorMessage, errorMessage})
    }
    next();
}

const verifyOtpValidator = (req,res,next) =>{
    const schema = joi.object({
        user_id: joi.string().required(),
        otp: joi.number().integer().min(100000).max(999999).required()
    })
    const {error,value} = schema.validate(req.body);
    if(error){
        const errorMessage = error.details.map(detail => detail.message).join(', ');
        return res.status(422).json({message:errorMessage, errorMessage})
    }
    next();
}

module.exports = {
    userRegisterValidate,
    userLoginValidate,
    otpMailvalidator,
    verifyOtpValidator
}