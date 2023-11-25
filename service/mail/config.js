const nodemailer = require("nodemailer");

async function sendConfirmationEmail(toEmail, confirmationToken, username) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 465,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: toEmail,
      subject: "Konfirmasi Lupa Password!",
      html: `<h1 style="font-weight:600;margin-bottom:'2rem';">Halo, ${username}!</h1><br/><p>Klik link ini untuk melakukan reset password akun anda!</p>
            <p>Dengan cara klik link ini <a style="padding:'5px';color:'white';background-color:'#5156be';display:'block';" href=${
              process.env.FE_URL_TC +
              "elearning/reset-password/" +
              confirmationToken
            }>Konfirmasi Akun</a></p>`,
    });

    console.log(`Email berhasil dikirim ke ${toEmail}`);
  } catch (error) {
    console.error(`Email gagal dikirim ke ${toEmail}`);
    throw error;
  }
}

async function sendUserStatusMail(toEmail, status, username) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 465,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });
    let msg = `<h1 style="font-weight:600;margin-bottom:'2rem';">Halo ${username},</h1><br/><p>Selamat pendaftaran anda sudah disetujui oleh admin. Anda bisa masuk ke Platform TKR Training Center Menggunakan Link Berikut : <a href="https://tkr2.nusantara-1.com/elearning/login">https://tkr2.nusantara-1.com/elearning/login</a></p>`
    if(status == 'block'){
      msg = 'Maaf akun anda sudah dinonaktifkan oleh admin'
    }

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: toEmail,
      subject: "Status anda berhasil diubah",
      html: msg,
    });

    console.log(`Email berhasil dikirim ke ${toEmail}`);
  } catch (error) {
    console.error(`Email gagal dikirim ke ${toEmail}`);
    throw error;
  }
}

async function sendClassEnrollmentMail(toEmail, className, username) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 465,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: toEmail,
      subject: "Anda berhasil masuk kelas",
      html: `<h1 style="font-weight:600;margin-bottom:'2rem';">Halo ${username},</h1><br/><p>Selamat pengajuan kelas ${className} anda sudah disetujui oleh admin. Anda bisa masuk ke Platform TKR Training Center Menggunakan Link Berikut : </p><p><a href="https://tkr2.nusantara-1.com/elearning/kelas-saya">https://tkr2.nusantara-1.com/elearning/kelas-saya</a></p>`,
    });

    console.log(`Email berhasil dikirim ke ${toEmail}`);
  } catch (error) {
    console.error(`Email gagal dikirim ke ${toEmail}`);
    throw error;
  }
}

async function sendClassResolvementMail(toEmail, kelas, username) {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 465,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: toEmail,
      subject: "Anda berhasil menyelesaikan kelas",
      html: `<h1 style="font-weight:600;margin-bottom:'2rem';">Halo ${username},</h1><br/><p>Selamat kelas ${kelas} anda sudah selesai. Anda bisa melihat sertifikat anda di Platform TKR Training Center Menggunakan Link Berikut : </p><p><a href="https://tkr2.nusantara-1.com/elearning/certificate">https://tkr2.nusantara-1.com/elearning/certificate</a></p>`,
    });

    console.log(`Email berhasil dikirim ke ${toEmail}`);
  } catch (error) {
    console.error(`Email gagal dikirim ke ${toEmail}`);
    throw error;
  }
}

module.exports = {
  sendConfirmationEmail,
  sendUserStatusMail,
  sendClassEnrollmentMail,
  sendClassResolvementMail,
};
