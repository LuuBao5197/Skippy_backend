const firestoreService = require('../services/fireStoreService');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail } = require('../services/emailService');
const { createSMS } = require('@utils/send_sms.js');
const jwtService = require('../configs/jwt/index')

exports.createAccessCode = async (req, res) => {
    const { phoneNumber } = req.body;
    const owner = await firestoreService.getOwnerByPhoneNumber(phoneNumber);
    if (owner == null || owner.length == 0) {
        return res.status(400).json({
            message: 'Phone number is not valid'
        });
    }
    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required.' });
    }
    try {
        const accessCode = Math.floor(100000 + Math.random() * 900000).toString(); // Tạo mã 6 số
        createSMS(phoneNumber, accessCode);

        await firestoreService.saveOwnerAccessCode(phoneNumber, accessCode);
    } catch (error) {
        console.error('Error in createAccessCode:');
        res.status(500).json({ message: 'Internal server error.' });
    }
    return res.status(200).json({ message: 'Access code sent successfully.' });
};
exports.ownerLogin = async (req, res) => {
    const { phoneNumber, accessCode } = req.body;
    const owner = await firestoreService.getOwnerByPhoneNumber(phoneNumber);
    if (owner == null || owner.length == 0) {
        return res.status(400).json({
            message: 'Phone number is not valid'
        });
    }
    const ownerAccesscode = owner.accessCode;
    if (ownerAccesscode !== accessCode) {
        return res.status(400).json({
            message: 'Access code is not valid, please check access code in sms'
        });
    }
    const payload = {
        'phoneNumber': phoneNumber,
        'email': owner.email,
        'name': owner.name,
        'role': "owner"
    }
    const accessToken = jwtService.createToken(payload);
    let refreshToken = jwtService.createRefreshToken(payload);
    refreshToken = await bcrypt.hash(refreshToken, 10);
    await firestoreService.saveOwner({
        phoneNumber,
        refreshToken
    })
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true nếu deploy https
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
    return res.status(200).json({
        message: "Login success fully", accessToken, refreshToken
    })
}
// Trong file controller của employee

exports.createEmployeeHandler = async function createEmployeeHandler(req, res) {
    const { name, email, role } = req.body;
    const ownerId = req.user.phoneNumber; // Lấy từ middleware xác thực

    try {
        const employeeData = { name, email, role, ownerId };
        const employeeId = await firestoreService.createEmployee(employeeData);
        const setupToken = crypto.randomBytes(32).toString('hex');
        await firestoreService.updateEmployee(employeeId, { setupToken });

        const activationLink = `${process.env.FRONTEND_URL}/ETMTool/employee/setup?token=${setupToken}`;

        await sendEmail(
            email,
            'Welcome! Please setup account.',
            'welcome',
            {
                name: name,
                activeLink: activationLink // Truyền link vào template
            }
        );
        res.status(201).json({ success: true, employeeId });
    } catch (error) {
        console.error('Error in createEmployeeHandler:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
exports.refreshToken = async function refreshToken(req, res) {

}
exports.getEmployeesOfMe = async (req, res) => {
    const { ownerId } = req.params;
    let empList = null;
    try {
        empList = await firestoreService.getEmployeesByOwner(ownerId);
        if (!empList) {
            return res.status(204).json({
                message: 'No data employee'
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: `Some errors occurs ${error}`
        });
    }

    return res.status(200).json({
        message: "Get employee list succes",
        empList
    })
}
exports.deleteEmployee = async (req, res) => {
    const { employeeId } = req.body;
    try {
        await firestoreService.deleteEmployee(employeeId);
    } catch (error) {
        return res.status(500).json({
            message: `Some errors occurs ${error}`
        });
    }
    return res.status(204).json({
        message: 'Delete employee success'
    })
}
