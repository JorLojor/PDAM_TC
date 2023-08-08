const nodemailer = require('nodemailer')

async function sendConfirmationEmail(toEmail,confirmationToken,username) {
    try {
        const transporter = nodemailer.createTransport({
            host:process.env.SMTP_HOST || 'smtp.gmail.com',
            port:process.env.SMTP_PORT || 465,
            auth:{
                user:process.env.SMTP_EMAIL,
                pass:process.env.SMTP_PASSWORD
            }

        })

        await transporter.sendMail({
            from:process.env.SMTP_EMAIL,
            to:toEmail,
            subject:'Konfirmasi Lupa Password!',
            html:`<h1 style="font-weight:600;margin-bottom:'2rem';">Halo, ${username}!</h1><br/><p>Klik link ini untuk melakukan reset password akun anda!</p>
            <p>Dengan cara klik link ini <a style="padding:'5px';color:'white';background-color:'#5156be';display:'block';" href=${process.env.FE_URL_TC + 'elearning/reset-password/' + confirmationToken}>Konfirmasi Akun</a></p>`
        })

        console.log(`Email berhasil dikirim ke ${toEmail}`)
    } catch (error) {
        console.error(`Email gagal dikirim ke ${toEmail}`)
        throw error;
    }
}

module.exports = sendConfirmationEmail