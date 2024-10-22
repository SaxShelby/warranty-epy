const express = require('express');
const cors = require('cors');
const multer = require('multer');
const db = require('../db');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create a directory for uploads if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();
app.use('/api/warranty', router);

// Configuring Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// API to handle form submission
router.post('/submit', upload.fields([{ name: 'idPhoto' }, { name: 'productImage' }]), (req, res) => {
    const { branch, price, transactionTime, customerName, idNumber, address, phoneNumber, productCode, productWeight, discount, salePrice, freebie, paymentMethod, paymentAmount } = req.body;

    // ตรวจสอบว่าข้อมูลฟอร์มถูกส่งมาอย่างถูกต้องหรือไม่
    if (!branch || !price || !transactionTime || !customerName || !idNumber || !address || !phoneNumber || !productCode || !productWeight || !salePrice || !paymentMethod || !paymentAmount) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const idPhoto = req.files['idPhoto'] ? req.files['idPhoto'][0].filename : null;
    const productImage = req.files['productImage'] ? req.files['productImage'][0].filename : null;

    if (!idPhoto || !productImage) {
        return res.status(400).json({ error: 'Missing required images' });
    }

    // SQL Query for inserting data
    const sql = `INSERT INTO warranty (branch, price, transactionTime, customerName, idNumber, idPhoto, address, phoneNumber, productCode, productWeight, productImage, discount, salePrice, freebie, paymentMethod, paymentAmount) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [branch, price, transactionTime, customerName, idNumber, idPhoto, address, phoneNumber, productCode, productWeight, productImage, discount, salePrice, freebie, paymentMethod, paymentAmount];

    console.log('SQL Query:', sql);  // แสดง SQL Query ที่จะใช้
    console.log('Values:', values);  // แสดงค่าที่จะเพิ่มลงในตาราง

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        console.log('Data inserted successfully:', result);

        // Create a PDF document
        const doc = new PDFDocument();
        const pdfFilename = `warranty-${Date.now()}.pdf`;
        const pdfPath = path.join(__dirname, '../uploads', pdfFilename);
        const writeStream = fs.createWriteStream(pdfPath);

        writeStream.on('error', (err) => {
            console.error('Error writing PDF file:', err);
            return res.status(500).json({ error: 'Error writing PDF file' });
        });

        // Add content to the PDF
        doc.pipe(writeStream);
        doc.fontSize(20).text('Warranty Information', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Branch: ${branch}`);
        doc.text(`Price: ${price}`);
        doc.text(`Transaction Time: ${transactionTime}`);
        doc.text(`Customer Name: ${customerName}`);
        doc.text(`ID Number: ${idNumber}`);
        doc.text(`Address: ${address}`);
        doc.text(`Phone Number: ${phoneNumber}`);
        doc.text(`Product Code: ${productCode}`);
        doc.text(`Product Weight: ${productWeight}`);
        doc.text(`Discount: ${discount}`);
        doc.text(`Sale Price: ${salePrice}`);
        doc.text(`Freebie: ${freebie}`);
        doc.text(`Payment Method: ${paymentMethod}`);
        doc.text(`Payment Amount: ${paymentAmount}`);

        doc.end();

        // Send back the URL to the generated PDF
        writeStream.on('finish', () => {
            res.status(200).json({
                message: 'Data saved successfully!',
                pdfUrl: `http://localhost:5000/uploads/${pdfFilename}`
            });
        });
    });
});


app.listen(3001, () => {
    console.log('Server running on port 3001');
});

module.exports = router;
