import {User} from '../models/user.models.js';
import {ApiResponse} from '../utils/api-response.js';
import {ApiError} from '../utils/api-error.js';
import {asyncHandler} from '../utils/async-handler.js';
import { emailVerificationMailgenContent, sendEmail } from '../utils/mail.js';
import crypto from 'crypto';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const generateAccessAndRefreshToken = async(userId) =>{
    try{
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken()

        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;

        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken};
    }catch (error){
        throw new ApiError(
            500, 
            "Something went wrong while generating tokens"
        );
    }
};

const registerUser = asyncHandler(async (req,res)=>{
    const {email, username, password} = req.body;

    if(
        [username, email, password].some(
            (field)=> field?.trim() === ""
        )
    ){
        throw new ApiError(400, "All fields are required",[]);
    }

    const existedUser = await User.findOne({
        $or: [{email},{username}]
    });

    if (existedUser){
        throw new ApiError (409, "User with email or username already exists", [])
    }

    const user = await User.create({
        email, 
        username, 
        password,
        isEmailVerified: false
    })

    const {unhashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({validateBeforeSave: false})

    await sendEmail({

        email: user.email,
        subject: "Please verify your email.",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/auth/verify-email/${unhashedToken}`
        )
    })

    const createdUser = await User.findById(user._id)
    .select("-password -refreshToken");

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering a user", [])
    }

    return res.status(201).json(
        new ApiResponse(
            201, 
            {user: createdUser},
            "User Registered Successfully"
        )
    );
});

const loginUser = asyncHandler(async (req, res)=>{
    const {email, password} = req.body

    if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(400, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid Credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
       .status(200)
       .cookie("accessToken", accessToken, options)
       .cookie("refreshToken", refreshToken, options)
       .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser,
                accessToken,
                refreshToken
            },
            "User Logged in successfully"
        )
       )
});

const GetCurrentUser = asyncHandler(async (req,res)=>{
    return res.status(200).json(
        new ApiResponse(
            200,
            req.user, 
            "Current User fetched Successfully"
        )
    )
});

const logoutUser = asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(req.user._id,{
        $set:{
            refreshToken:""
        }
    }, {
        new: true
    })

    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200, 
            {},
            "User logged Out"
        )
    )
});

const verifyEmail = asyncHandler(async (req, res) => {

    const { verificationToken } = req.params;

    if (!verificationToken) {
        throw new ApiError(400, "Verification token is missing");
    }

    let hashedToken = crypto
        .createHash("sha256")
        .update(verificationToken)
        .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpiry: {
            $gt: Date.now()
        }
    });

    if (!user) {
        throw new ApiError(400, "Token invalid or expired");
    }

    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;
    user.isEmailVerified = true;

    await user.save({ validateBeforeSave: false });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Email verified successfully"
        )
    );
});

const resendEmailVerification = asyncHandler(async (req,res)=>{
    const user = await User.findById(req.user._id);

    if(!user){
        throw new ApiError(404, "User not found")
    }

    if(user.isEmailVerified){
        throw new ApiError(400, "Email already Verified")
    }

    const {unhashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken
    user.emailVerificationExpiry = tokenExpiry

    await user.save({ validateBeforeSave: false})

    await sendEmail({

        email: user.email,
        subject: "Verify your Email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get("host")}/api/auth/verify-email/${unhashedToken}`
        )
    })
    return res.status(200).json(
        new ApiResponse(
            200, 
            {},
            "Verification Email Resent"
        )
    )
})

const forgotPassword = asyncHandler(async (req,res)=>{
    const {email} = req.body;

    const user = await User.findOne({email});

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const {unhashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken();

    user.forgotPasswordToken = hashedToken;
    user.forgotPasswordExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false})

    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${unhashedToken}`;

    await sendEmail({
        email: user.email,
        subject:"Reset Password",
        mailgenContent:{
            body:{
                name: user.username,
                intro: "Reset Your Password",
                action:{
                    instructions: "Click Below",
                    button: {
                        color:"#22BC66",
                        text: "Reset Password",
                        link: resetUrl
                    }
                }
            }
        }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password Reset email sent"
        )
    )
})

const resetForgotPassword = asyncHandler(async(req,res)=>{
    const { resetToken } = req.params;
    const {newPassword} = req.body;

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry:{
            $gt: Date.now()
        }
    })

    if(!user){
        throw new ApiError(400, "Token invalid or expired")
    }

    user.forgotPasswordToken= undefined
    user.forgotPasswordExpiry= undefined

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(
            200, 
            {},
            "Password reset SuccessFully"
        )
    )
})

const changePassword = asyncHandler(async(req,res)=>{

    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordValid = await user.isPasswordCorrect(oldPassword);

    if(!isPasswordValid){
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(
            200, 
            {},
            "Password Update Successfully "
        )
    )



    
})

const updateAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath){
        throw new ApiError(
            400, 
            "Avatar file missing"
        )
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiError(
            400, 
            "Error uploading avatar"
        )
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                avatar:{
                    url: avatar.url,
                    localPath:""
                }
            }
        },
        {
            new: true
        }
    ).select("-password");

    return res.status(200).json(
        new ApiResponse(
            200, 
            user, 
            "Avatar updated successfully"
        )
    )
})

export {
    registerUser, 
    loginUser,
    GetCurrentUser, 
    logoutUser, 
    verifyEmail,
    resendEmailVerification, 
    forgotPassword, 
    resetForgotPassword,
    changePassword,
    updateAvatar
}