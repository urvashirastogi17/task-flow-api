import dotenv from 'dotenv';
dotenv.config({
    path: "./.env",
});
import nodemailer from "nodemailer";
import Mailgen from "mailgen";

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: Number(process.env.MAILTRAP_SMTP_PORT),
    auth:{
        user: process.env.MAILTRAP_SMTP_USER,
        pass: process.env.MAILTRAP_SMTP_PASS
    }
});

const sendEmail = async(options)=>{

    const mailGenerator = new Mailgen({

        theme: "default",

        product:{
            name: "Task Manager",
            link: "https://taskmanager.com"
        }
    })

    const emailHtml = mailGenerator.generate(options.mailgenContent)

    const emailText = mailGenerator.generatePlaintext(options.mailgenContent)
    

    const mail = {

        from: "mail.taskmanager@example.com",
        to: options.email,
        subject: options.subject,
        text: emailText,
        html: emailHtml
    };
    
    try {
        await transporter.sendMail(mail)
    }catch (error){
        console.error("email service failed silently. Make sure that you have provided your MAILTRAP credentials in the .env file")
        console.error("Error", error)
    }
}

const emailVerificationMailgenContent = (username, verificationUrl)=>{
    
    return {
        body: {
            name: username,
            intro: "Welcome! Please verify your email.",
            action:{
                instructions: "Click below to verify.",
                button:{
                    color: "#22BC66",
                    text:"Verify Email",
                    link: verificationUrl
                }
            },
            outro: "Need help? Contact Support."
        }
    };
};

export {
    emailVerificationMailgenContent,
    sendEmail
}