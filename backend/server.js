const express = require('express');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');
const cors = require('cors');
const https = require('https');

// กำหนดเส้นทางสำหรับไฟล์คีย์และใบรับรอง SSL
const privateKeyPath = path.join(__dirname, 'private-key.pem');
const certificatePath = path.join(__dirname, 'certificate.pem');

// อ่านไฟล์คีย์และใบรับรอง SSL
const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
const certificate = fs.readFileSync(certificatePath, 'utf8');

const app = express();
const PORT = process.env.PORT || 5000;

// ใช้งาน CORS โดยอนุญาตให้เข้าถึงจาก Netlify
app.use(cors({
    origin: 'https://curious-zabaione-31460f.netlify.app' // ระบุที่อยู่ของ Netlify
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // ให้บริการไฟล์ในโฟลเดอร์ uploads

// เสิร์ฟไฟล์ static จากโฟลเดอร์ build ของ React
app.use(express.static(path.join(__dirname, 'frontend/build')));

// สร้างการเชื่อมต่อกับ MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // เปลี่ยนให้ตรงกับ username ของคุณ
    password: '', // เปลี่ยนเป็น password ของคุณ
    database: 'warranty_db' // ชื่อฐานข้อมูล
});

// เชื่อมต่อกับฐานข้อมูล
db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the MySQL database.');
});

// ตั้งค่า multer สำหรับจัดการไฟล์อัปโหลด
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // ใช้ timestamp เป็นชื่อไฟล์
    }
});
const upload = multer({ storage: storage });

// Route สำหรับส่งข้อมูล
app.post('/api/warranty/submit', upload.fields([{ name: 'idPhoto', maxCount: 1 }, { name: 'productImage', maxCount: 1 }]), (req, res) => {
    try {
        if (!req.files['idPhoto'] || !req.files['productImage']) {
            return res.status(400).json({ error: 'Both idPhoto and productImage are required.' });
        }

        const { branch, price, transactionTime, customerName, idNumber, address, phoneNumber, productCode, productWeight, discount, salePrice, freebie, paymentMethod, paymentAmount } = req.body;

        if (!branch || !price || !customerName || !idNumber || !address || !phoneNumber || !productCode || !productWeight || !salePrice) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const idPhoto = req.files['idPhoto'][0].filename;
        const productImage = req.files['productImage'][0].filename;

        // SQL สำหรับบันทึกข้อมูลลงฐานข้อมูล
        const sql = 'INSERT INTO warranty (branch, price, transactionTime, customerName, idNumber, idPhoto, address, phoneNumber, productCode, productWeight, discount, salePrice, freebie, paymentMethod, paymentAmount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const values = [branch, price, transactionTime, customerName, idNumber, idPhoto, address, phoneNumber, productCode, productWeight, discount, salePrice, freebie, paymentMethod, paymentAmount];

        db.query(sql, values, (err, result) => {
            if (err) {
                console.error('Error inserting data into database:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            // สร้างเอกสาร PDF หลังจากบันทึกข้อมูลเสร็จ
            const doc = new PDFDocument();
            const pdfPath = path.join(__dirname, 'uploads', 'warranty-form.pdf');

            doc.pipe(fs.createWriteStream(pdfPath))
                .on('finish', () => {
                    console.log('PDF created successfully.');
                    // ส่งลิงก์ไฟล์ PDF กลับไปให้ frontend
                    res.status(200).json({
                        message: 'Data submitted and PDF created',
                        pdfUrl: `https://curious-zabaione-31460f.netlify.app/uploads/warranty-form.pdf`
                    });
                })
                .on('error', (err) => {
                    console.error('Error while creating PDF:', err);
                    res.status(500).json({ error: 'Error while creating PDF' });
                });

            // ตรวจสอบว่าฟอนต์ที่ต้องการมีอยู่
            const fontPath = path.join(__dirname, 'fonts', 'THSarabunNew.ttf');
            if (fs.existsSync(fontPath)) {
                doc.font(fontPath);
            } else {
                console.error('Font file not found:', fontPath);
                return res.status(500).json({ error: 'Font file not found' });
            }

            // สร้างเนื้อหา PDF
            doc.fontSize(25).text('บัตรรับประกัน', { align: 'center' });
            doc.moveDown();
            doc.fontSize(14).text(`สาขา: ${branch}`);
            doc.text(`ราคาทองสูง: ${price}`);
            doc.text(`ชื่อลูกค้า: ${customerName}`);
            doc.text(`เลขบัตรประชาชน: ${idNumber}`);
            doc.text(`ที่อยู่: ${address}`);
            doc.text(`เบอร์โทร: ${phoneNumber}`);
            doc.text(`รหัสสินค้า: ${productCode}`);
            doc.text(`น้ำหนักสินค้า: ${productWeight}`);
            doc.text(`ราคาขาย: ${salePrice}`);

            doc.end();
        });
    } catch (error) {
        console.error('Error in submit route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ตรวจสอบให้แน่ใจว่าโฟลเดอร์ uploads มีอยู่
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// เสิร์ฟไฟล์ index.html สำหรับเส้นทางที่เหลือ
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// รัน HTTPS server
https.createServer({
    key: privateKey, // ใช้คีย์ที่อ่านจากไฟล์
    cert: certificate // ใช้ใบรับรองที่อ่านจากไฟล์
}, app).listen(PORT, () => {
    console.log(`HTTPS Server started on port ${PORT}`);
});
