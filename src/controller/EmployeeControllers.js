const firestoreService = require('../services/fireStoreService');
const jwtService = require('../configs/jwt/index');
const bcrypt = require('bcryptjs');
const { sendEmail } = require('../services/emailService');
exports.setupAccount = async (req, res) => {
    const { username, password, setupToken } = req.body;
    const employee = await firestoreService.getEmployeesBySetupToken(setupToken);  // 1 array

    if (!employee || employee.length === 0) {
        return res.status(400).json({ message: 'Ban khong co quyen thiet lap tai khoan ' });
    }
    const emp = employee[0];

    const existEmployee = await firestoreService.getEmployeesByUsername(username);
    if (existEmployee.length > 0) {
        return res.status(400).json({ message: 'Username da ton tai, vui long chon username khac ' });
    }
    const hashPass = await bcrypt.hash(password, 10);
    const data = {
        username,
        hashPass,
        status: "active"
    }
    try {
        console.log(employee);
        await firestoreService.updateEmployee(emp.id, data);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
    return res.status(200).json({ message: 'Setup account successfully.' });
};
exports.employeeLogin = async (req, res) => {
    const { username, password } = req.body;
    const emp = await firestoreService.getEmployeesByUsername(username);
    if (emp == null || emp.length == 0) {
        return res.status(400).json({
            message: 'Login failed because username is not found'
        });
    }
    const isMatch = await bcrypt.compare(password, emp[0].hashPass);
    if (!isMatch) {
        return res.status(400).json({
            message: 'Login failed because not valid crential'
        });
    }
    const payload = {
        'name': emp[0].name,
        'email': emp[0].email,
        'username': emp[0].username,
        'id': emp[0].id,
        'role': "employee"
    }
    const accessToken = jwtService.createToken(payload);
    let refreshToken = jwtService.createRefreshToken(payload);
    refreshToken = await bcrypt.hash(refreshToken, 10);
    await firestoreService.updateEmployee(emp[0].id, {
        refreshToken
    })
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true nếu deploy https
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });
    return res.status(200).json({
        message: "Login success fully", "employee": emp[0], accessToken, refreshToken
    })
}

exports.refreshToken = async (req, res) => {
    // 1. Lấy refreshToken từ cookie mà trình duyệt tự động gửi lên
    const refreshTokenFromCookie = req.cookies.refreshToken;
    if (!refreshTokenFromCookie) {
        return res.status(401).json({ message: 'Refresh token không tồn tại.' });
    }
    try {
        const employee = await firestoreService.findEmployeeByRefreshToken(refreshTokenFromCookie);
        if (!employee) {
            return res.status(403).json({ message: 'Refresh token không hợp lệ.' });
        }

        // 3. Tạo accessToken MỚI
        const payload = {
            id: employee.id,
            name: employee.name,
            email: employee.email,
            role: "employee"
        };
        const newAccessToken = jwtService.createToken(payload);
        // 4. Gửi accessToken mới về cho client
        return res.status(200).json({
            accessToken: newAccessToken
        });

    } catch (error) {
        // Nếu refresh token hết hạn hoặc không hợp lệ
        console.error('Refresh token error:', error);
        return res.status(403).json({ message: 'Refresh token không hợp lệ hoặc đã hết hạn.' });
    }
};
exports.getProfile = async (req, res) => {
    const { empId } = req.params;
    const emp = await firestoreService.getEmployeesById(empId);
    if (!emp) {
        return res.status(404).json({
            message: 'Not found info of user'
        });
    }
    const data = {
        "name": emp.name,
        "email": emp.email,
        "username": emp.username,
        "id": empId
    }
    return res.status(200).json({
        message: "Get user profile success", "emp": data
    })
}
exports.editProfile = async (req, res) => {
    const editEmp = req.body;
    try {
        await firestoreService.updateEmployee(editEmp.id, editEmp);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
    return res.status(200).json({
        message: "Update profile success",
    })
}
exports.getOtpForgotPassword = async (req, res) => {
    const { email } = req.body;
    const employee = await firestoreService.getEmployeesByEmail(email);
    console.log(employee);
    if (!employee || employee.length === 0) {
        return res.status(400).json({ message: 'Email is not valid.' });
    }
    const emp = employee[0];
    const otpRSPass = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        await firestoreService.updateEmployee(emp.id, { otpRSPass });
        await sendEmail(
            email,
            'Welcome! This is email to reset password.',
            'forgotPassword',
            {
                name: emp.name,
                otp: otpRSPass // Truyền link vào template
            }
        );
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
    return res.status(200).json({
        message: "Send otp success",
    })
}
exports.validOtpFGPass = async (req, res) => {
    const { otp } = req.body;
    const employee = await firestoreService.getEmployeesByotpRSPass(otp);
    if (!employee || employee.length == 0) {
        return res.status(400).json({
            message: "Otp is not valid"
        })
    }
    const emp = employee[0];
    const otpInDB = emp.otpRSPass;
    if (otpInDB !== otp) {
        return res.status(400).json({
            message: "Otp is not valid"
        })
    }
    return res.status(200).json({
        message: "Otp is match"
    })

}
exports.resetPassword = async (req, res) => {
    const { otp, newPassword } = req.body;
    const employee = await firestoreService.getEmployeesByotpRSPass(otp);
    if (!employee || employee.length == 0) {
        return res.status(400).json({
            message: "This is not your account had been sent to email with otp"
        })
    }
    const emp = employee[0];
    const hashPass = await bcrypt.hash(newPassword, 10);

    try {
        await firestoreService.updateEmployee(emp.id, {hashPass})
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
    return res.status(200).json({message: "Change password success fully"});

}
