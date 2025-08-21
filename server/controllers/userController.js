import ErrorHandler from "../middlewares/error.js";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import twilio from "twilio";
import { sendToken } from "../utils/sendToken.js";


const client = twilio(process.env.TWILIO_SID,process.env.TWILIO_TOKEN)

export const register = catchAsyncError(async (req, res, next) => {
  try {
    const { name, email, phone, password, verificationMethod } = req.body;
    if (!name || !email || !phone || !password || !verificationMethod) {
      return next(new ErrorHandler("All fields are Required", 400));
    }

    function validatePhoneNumber(phone) {
      const phoneRegex = /^\+91\d{10}$/;
      return phoneRegex.test(phone);
    }

    if (!validatePhoneNumber(phone)) {
      return next(new ErrorHandler("Invalid Phone number.", 400));
    }

    const existingUser = await User.findOne({
      $or: [
        {
          email,
          accountVerified: true,
        },
        {
          phone,
          accountVerified: true,
        },
      ],
    });

    if (existingUser) {
      return next(new ErrorHandler("Phone or email already used.", 400));
    }

    const registerationAttemptByUser = await User.find({
      $or: [
        { phone, accountVerified: false },
        { email, accountVerified: false },
      ],
    });

    if (registerationAttemptByUser.length > 3) {
      return next(
        new ErrorHandler(
          "you have exceeded the maximum number of attempt (3). Please try again after 1 hour",
          400
        )
      );
    }

    const userData = {
      name,
      email,
      phone,
      password,
    };

    const user = await User.create(userData);

    const verificationCode = await user.generateVerificationCode();
    await user.save();

    sendVerificationCode(verificationMethod, verificationCode, email, phone,res,name);
    
  } catch (error) {
    next(error);
  }
});

async function sendVerificationCode(verificationMethod,verificationCode,email,phone,res,name) {
try {
  if (verificationMethod === "email") {
    const message = generateEmailTemplate(verificationCode);
    sendEmail({ email, subject: "Your verification code", message });
    res.status(200).json({
      success: true,
      message:`verifecation email sucessfully sent to ${name}`
    });
  } else if(verificationMethod === "phone"){
    const verificationCodeWithSpace = verificationCode.toString().split("").join(" ");
    await client.calls.create({
      twiml: `<Response><Say>Your verification code is ${verificationCodeWithSpace}. Your verification code is ${verificationCodeWithSpace}</Say></Response>`,
      from: process.env.TWILIO_PHONE,
      to: phone,
    });
    res.status(200).json({
      success: true,
      message:`OTP SENT.`
    });

  } else{
     return res.status(500).json({
  success:false,
  message:"Invalid verification method"
 })
    
  }
} catch (error) {
 return res.status(500).json({
  success:false,
  message:"Verifecation failed."
 })
}
}

function generateEmailTemplate(verificationCode) {
  return `
     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
      <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
      <p style="font-size: 16px; color: #333;">Dear User,</p>
      <p style="font-size: 16px; color: #333;">Your verification code is:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #e8f5e9;">
          ${verificationCode}
        </span>
      </div>
      <p style="font-size: 16px; color: #333;">Please use this code to verify your email address. The code will expire in 10 minutes.</p>
      <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
      <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
        <p>Thank you,<br>Your Company Team</p>
        <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
      </footer>
    </div>`;
};


export const verifyOTP = catchAsyncError(async(req,res,next)=>{
  const { email , otp,phone} = req.body()
  if (!email || !otp || !phone ) {
    return;
  }
  function validatePhoneNumber(phone) {
      const phoneRegex = /^\+91\d{10}$/;
      return phoneRegex.test(phone);
    }

    if (!validatePhoneNumber(phone)) {
      return next(new ErrorHandler("Invalid Phone number.", 400));
    }

    try {
      const userAllEntries = await User.find({
        $or:[
          {
            email,accountVerified:false
          },
          {
            phone, accountVerified:false
          },
        ],
      }).sort({createdAt: -1});

      if(!userAllEntries){
        return next(new ErrorHandler("User not found",400))
      }

      let user ;
      if(userAllEntries.length > 1){
        user = userAllEntries[0];

        await User.deleteMany({
          _id:{$ne: user,_id},
          $or:[
            {phone,accountVerified:false},
            {email,accountVerified:false}
          ]
        })
      } else{
        user =  userAllEntries[0];

      }

      if(user.verificationCode !== Number(otp)){
        return next(new ErrorHandler("Invalid Otp.",404));
      }

      const CurrentTime = Date.now();
      const verifecationCodeExpire = new Date(user.verificationCodeExpire).getTime() ;

      if (customElements > verifecationCodeExpire) {
        return next(new ErrorHandler("OTP Expire",400))
      };

      user.accountVerified = true;
      user.verificationCode = null;
      user.verificationCodeExpire = null;
      await user.save({validateModifiedOnly:true});

      sendToken(user,200,"Account Verified",res);

    } catch (error) {
      return next(new ErrorHandler("Inertal Server Error.",500))
    }
})
