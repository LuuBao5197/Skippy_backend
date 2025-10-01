const express = require('express');
const router = express.Router();
const ownerController = require('../controller/OwnerController');
const taskController = require('../controller/TaskController');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
// POST /api/owners/send-code -> Gửi mã OTP
router.post('/send-code', ownerController.createAccessCode);

// POST /api/owners/login -> Xác thực mã OTP để đăng nhập
router.post('/login', ownerController.ownerLogin);

// ... Thêm các route khác cho owner nếu có ...
router.post('/createEmp', authenticate, authorize(['owner']), ownerController.createEmployeeHandler);
router.get('/getEmps/:ownerId', authenticate, authorize(['owner']), ownerController.getEmployeesOfMe);
router.delete('/deleteEmp', authenticate, authorize(['owner']), ownerController.deleteEmployee);
router.post('/createEmp', authenticate, authorize(['owner']), ownerController.createEmployeeHandler);
router.get('/getTasks', authenticate, authorize(['owner']), taskController.getTasks);
router.post('/assignTask', authenticate, authorize(['owner']), taskController.createTask);
router.delete('/deleteTask/:taskId', authenticate, authorize(['owner']), taskController.deleteTask);
module.exports = router;