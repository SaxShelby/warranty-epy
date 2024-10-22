const fs = require('fs');
const path = require('path');

// ใช้ path.join เพื่อระบุพาธของไฟล์ SSL
const privateKeyPath = path.join(__dirname, 'private-key.pem'); // F:\project\warranty-epy\backend\private-key.pem
const certPath = path.join(__dirname, 'certificate.pem'); // F:\project\warranty-epy\backend\certificate.pem

// อ่านไฟล์คีย์ส่วนตัวและใบรับรอง
const privateKey = fs.readFileSync(privateKeyPath, 'utf8'); // อ่านไฟล์ private-key.pem
const certificate = fs.readFileSync(certPath, 'utf8'); // อ่านไฟล์ certificate.pem

module.exports = {
    SSL_KEY: privateKey,
    SSL_CERT: certificate
};
