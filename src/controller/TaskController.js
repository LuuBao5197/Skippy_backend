const firestoreService = require('../services/fireStoreService');
const jwtService = require('../configs/jwt/index');
const bcrypt = require('bcryptjs');

exports.getTasksOfEmp = async (req, res) => {
    let taskList = null;
    const { empId } = req.params;
    try {
        // const employeeId = req.user.id; // Lấy từ JWT của employee
        taskList = await firestoreService.getTasksByEmployee(empId);
        if (!taskList) {
            return res.status(400).json({ message: 'Get task failed' });
        }
    } catch (error) {
        return res.status(500).json({ message: `Error server ${error}` });
    }
    return res.status(200).json({ message: 'Get task successfully', 'tasks': taskList });
};
exports.getTasks = async (req, res) => {
    try {
        const { empId } = req.params;
        // const employeeId = req.user.id; // Lấy từ JWT của employee

        const taskList = await firestoreService.getTasks();
        res.status(200).json({ message: 'Get task successfully', 'tasks': taskList });
    } catch (error) {
        res.status(500).json({ message: `Error server ${error}` });
    }
};
// Employee hoàn thành task
exports.completeTask = async (req, res) => {
    try {
        const { taskId } = req.body;
        // const employeeId = req.user.id; // Lấy từ JWT của employee

        await firestoreService.updateTask(taskId, {
            status: 'completed',
            completedAt: new Date()
        });
        res.status(200).json({ success: true, message: 'Task marked as complete.' });
    } catch (error) {
        res.status(500).json({ message: `Error server ${error}` });
    }
};

exports.createTask = async (req, res) => {
    const data = req.body;
    try {
        await firestoreService.createTask(data);
    } catch (error) {
        return res.status(500).json({
            message: `Some errors occurs ${error}`
        });
    }
    return res.status(200).json({
        message: 'Create task successfully'
    })
}

exports.updateTask = async (req, res) => {
    const data = req.body;
    try {
        await firestoreService.updateTask(data.taskId, data);
    } catch (error) {
        return res.status(500).json({
            message: `Some errors occurs ${error}`
        });
    }
    return res.status(200).json({
        message: 'Update task successfully'
    })
}
exports.deleteTask = async (req, res) => {
    const { taskId } = req.params;
    try {
        await firestoreService.deleteTask(taskId);
    } catch (error) {
        return res.status(500).json({
            message: `Some errors occurs ${error}`
        });
    }
    return res.status(204).json({
        message: 'Delete task successfully'
    })
}