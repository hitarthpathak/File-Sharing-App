import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server Is Running On Port ${PORT}!`);
});

app.get('/', (req, res) => {
    res.send('Server Is Running!');
});

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error('Error Connecting To SMTP Server : ', error);
    }
    else {
        console.log('SMTP Server Is Ready To Use!');
    };
});

app.post('/send-notification', async (req, res) => {
    const { to, file_name, shared_by } = req.body;
    try {
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: to,
            subject: 'File Sharing Notification!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px;">
                    <h2>A File Is Shared With You!</h2>
                    <br />
                    <p><strong>${shared_by}</strong> has shared a file with you :</p>
                    <p style="font-size: 16px;"><b>${file_name}</b></p>
                    <br />
                    <p>Log In To The File Sharing App To View And Download It.</p>
                    <br />
                    <p>Best Regards,<br/>File Sharing App</p>
                </div>
            `
        });
        console.log(`E-Mail Sent To ${to} For File ${file_name}!`);
        res.status(200).send('Notification Sent Successfully!');
    }
    catch (error) {
        console.error('Error Sending Notification : ', error);
        res.status(500).send('Error Sending Notification!');
    };
});