import React, { useState } from 'react';

const WarrantyForm = () => {
    const [formData, setFormData] = useState({
        branch: '',
        price: '',
        transactionTime: '',
        customerName: '',
        idNumber: '',
        address: '',
        phoneNumber: '',
        productCode: '',
        productWeight: '',
        discount: '',
        salePrice: '',
        freebie: '',
        paymentMethod: 'cash',
        paymentAmount: '',
    });
    const [idPhoto, setIdPhoto] = useState(null);
    const [productImage, setProductImage] = useState(null);
    const [errorMessage, setErrorMessage] = useState(''); // สำหรับแสดงข้อผิดพลาด
    const [successMessage, setSuccessMessage] = useState(''); // สำหรับแสดงข้อความสำเร็จ

    // อัปเดตข้อมูลที่กรอกในฟอร์ม
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // อัปเดตไฟล์ที่เลือกสำหรับ ID รูปถ่ายและรูปสินค้า
    const handleFileChange = (e) => {
        if (e.target.name === 'idPhoto') setIdPhoto(e.target.files[0]);
        if (e.target.name === 'productImage') setProductImage(e.target.files[0]);
    };

    // เมื่อทำการส่งฟอร์ม
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        // เพิ่มข้อมูลฟอร์มลงใน FormData
        for (const key in formData) {
            data.append(key, formData[key]);
        }
        // เพิ่มไฟล์รูปถ่าย
        data.append('idPhoto', idPhoto);
        data.append('productImage', productImage);

        try {
            // ส่งข้อมูลไปยัง Backend
            const response = await fetch('https://localhost:5000/api/warranty/submit', { // เปลี่ยน URL ตามความเหมาะสม
                method: 'POST',
                body: data,
            });

            if (!response.ok) {
                throw new Error('เกิดข้อผิดพลาดในการส่งข้อมูล');
            }

            const result = await response.json();
            setSuccessMessage('ส่งข้อมูลสำเร็จ'); // แสดงข้อความสำเร็จ
            setErrorMessage(''); // เคลียร์ข้อความข้อผิดพลาด
            // เปิดลิงก์ PDF ในแท็บใหม่
            const pdfUrl = result.pdfUrl;
            window.open(pdfUrl, '_blank');

            // เคลียร์ฟอร์มหลังจากส่งข้อมูลสำเร็จ
            setFormData({
                branch: '',
                price: '',
                transactionTime: '',
                customerName: '',
                idNumber: '',
                address: '',
                phoneNumber: '',
                productCode: '',
                productWeight: '',
                discount: '',
                salePrice: '',
                freebie: '',
                paymentMethod: 'cash',
                paymentAmount: '',
            });
            setIdPhoto(null);
            setProductImage(null);
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการส่งข้อมูล:', error);
            setErrorMessage('เกิดข้อผิดพลาดในการส่งข้อมูล'); // แสดงข้อผิดพลาด
            setSuccessMessage(''); // เคลียร์ข้อความสำเร็จ
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="text-center">บัตรรับประกัน</h1>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} {/* แสดงข้อความข้อผิดพลาด */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>} {/* แสดงข้อความสำเร็จ */}
            <form onSubmit={handleSubmit} className="mt-4">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>สาขา</label>
                        <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>ราคาทอง</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className="form-control" required />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>เวลาทำรายการ</label>
                        <input type="datetime-local" name="transactionTime" value={formData.transactionTime} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>ชื่อลูกค้า</label>
                        <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} className="form-control" required />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>เลขบัตรประชาชน</label>
                        <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>ที่อยู่</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="form-control" required />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>หมายเลขโทรศัพท์</label>
                        <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>รหัสสินค้า</label>
                        <input type="text" name="productCode" value={formData.productCode} onChange={handleChange} className="form-control" required />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>น้ำหนักสินค้า</label>
                        <input type="text" name="productWeight" value={formData.productWeight} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>ส่วนลด</label>
                        <input type="number" name="discount" value={formData.discount} onChange={handleChange} className="form-control" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>ราคาขาย</label>
                        <input type="number" name="salePrice" value={formData.salePrice} onChange={handleChange} className="form-control" required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>ของแถม</label>
                        <input type="text" name="freebie" value={formData.freebie} onChange={handleChange} className="form-control" />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>วิธีการชำระเงิน</label>
                        <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} className="form-control">
                            <option value="cash">เงินสด</option>
                            <option value="credit">บัตรเครดิต</option>
                            <option value="transfer">โอนเงิน</option>
                        </select>
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>จำนวนเงินที่ชำระ</label>
                        <input type="number" name="paymentAmount" value={formData.paymentAmount} onChange={handleChange} className="form-control" required />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label>รูปถ่ายบัตรประชาชน</label>
                        <input type="file" name="idPhoto" onChange={handleFileChange} className="form-control" required />
                    </div>
                    <div className="col-md-6 mb-3">
                        <label>รูปภาพสินค้า</label>
                        <input type="file" name="productImage" onChange={handleFileChange} className="form-control" required />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block">ส่งข้อมูล</button>
            </form>
        </div>
    );
};

export default WarrantyForm;
