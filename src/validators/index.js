import {body} from 'express-validator';

const userRegisterValidator = () =>{
    return [
        body("email")
          .trim()
          .notEmpty()
          .withMessage("Username is requiredddd")
          .isEmail()
          .withMessage("Email is invalidddd"),
        body("username")
          .trim()
          .notEmpty()
          .withMessage("Username is Requireddd")
          .isLowercase()
          .withMessage("Username must be in Lowercaseee")
          .isLength({min:3})
          .withMessage("User must be at least 3 characterssss"),
        body("password")
          .trim()
          .notEmpty()
          .withMessage("Password is required")
          .isLength({ min: 8 })
          .withMessage("Password must be at least 8 characters long")
          .matches(/[A-Z]/)
          .withMessage("Password must contain at least one uppercase letter")
          .matches(/[0-9]/)
          .withMessage("Password must contain at least one number"),
        
    ]
}

const userLoginValidator = () =>{
    return [
        body("email")
          .notEmpty()
          .withMessage("Email is Required")
          .isEmail()
          .withMessage("Email is Invalid"),
        body("password")
          .notEmpty()
          .withMessage("Password is Required")
    ]
}

const userChangeCurrentPasswordValidator = () =>{
    return [
        body("oldPassword")
          .notEmpty()
          .withMessage("Old Password is Requireddd"),
        body("newPassword")
          .notEmpty()
          .withMessage("New Password is Requiredddd")
    ]
}

const userForgotPasswordvalidator = () =>{
    return [
        body("email")
          .notEmpty()
          .withMessage("Email is Requiredddd")
          .isEmail()
          .withMessage("Email is Invaliddd")
    ]
}

const userResetForgotPasswordValidator = () =>{
    return [
        body("newPassword")
          .notEmpty()
          .withMessage("Password is requiredddd")
    ]
}

export {
    userRegisterValidator,
    userLoginValidator,
    userForgotPasswordvalidator,
    userResetForgotPasswordValidator,
    userChangeCurrentPasswordValidator
}