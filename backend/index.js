const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer'); // เพิ่มการนำเข้า multer
const path = require('path'); // ใช้สำหรับจัดการ path
const warrantyRoutes = require('./routes/warranty');

const app = express();
const port = 5000;

// ตั้งค่าการอัปโหลดไฟล์ด้วย multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // กำหนดไดเรกทอรีสำหรับบันทึกไฟล์
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อไฟล์เป็น timestamp + นามสกุล
    }
});

const upload = multer({ storage: storage });

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

// ใช้ routes ที่ต้องการ
app.use('/api/warranty', warrantyRoutes);

// ตัวอย่าง route สำหรับการอัปโหลดฟอร์มบัตรรับประกัน
app.post('/api/warranty/submit', upload.fields([{ name: 'idPhoto' }, { name: 'productImage' }]), (req, res) => {
    console.log(req.files); // ดูข้อมูลไฟล์ที่ถูกอัปโหลด
    console.log(req.body); // ดูข้อมูลฟอร์มที่ถูกส่งมา

    if (!req.files || !req.files.idPhoto || !req.files.productImage) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    // ส่งกลับ response เมื่อบันทึกข้อมูลสำเร็จ
    // ส่งลิงก์ไฟล์ PDF กลับไปให้ frontend
res.status(200).json({ message: 'Data submitted and PDF created', pdfUrl: `https://49.0.72.20:${port}/uploads/warranty-form.pdf` });

});

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
