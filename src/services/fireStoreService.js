const { db } = require('../configs/firebase/firebaseConfig');
const crypto = require('crypto');
const { sendEmail } = require('@services/emailService.js');

async function saveOwnerAccessCode(phoneNumber, accessCode) {
  const ownerRef = db.collection('owners').doc(phoneNumber);
  await ownerRef.update({
    accessCode,
    updatedAt: new Date()
  });
  console.log(`Access code for ${phoneNumber} saved.`);
}
async function saveOwner(data) {
  const ownerRef = db.collection('owners').doc(data.phoneNumber);
  await ownerRef.update(data);
  console.log(`Access code for ${data.phoneNumber} saved.`);
}

async function getOwnerByPhoneNumber(phoneNumber) {
  const ownerRef = db.collection('owners').doc(phoneNumber);
  const doc = await ownerRef.get();

  if (!doc.exists) {
    return null;
  }
  return doc.data();
}

async function createEmployee(employeeData) {
  const employeePayload = {
    ...employeeData,
    status: "pending",
    createdAt: new Date()
  };
  const docRef = await db.collection('employees').add(
    employeePayload
  );
  console.log(`Employee created with ID: ${docRef.id}`);
  return docRef.id;
}
async function updateEmployee(eId, employeeData) {
  const employeePayload = {
    ...employeeData,
    updatedAt: new Date()
  };
  const ownerRef = db.collection('employees').doc(eId);
  await ownerRef.update(employeePayload);

  return ownerRef.id;
}
async function getEmployeesByOwner(ownerId) {
  const snapshot = await db.collection('employees')
    .where('ownerId', '==', ownerId).select('id', 'name', 'email', 'ownerId', 'username', 'role', 'status').get();
  if (snapshot.empty) {
    return [];
  }
  const employees = [];
  snapshot.forEach(doc => {
    employees.push({ id: doc.id, ...doc.data() });
  });
  return employees;
}
async function getEmployeesBySetupToken(token) {
  const snapshot = await db.collection('employees').where('setupToken', '==', token).get();
  if (snapshot.empty) {
    return [];
  }
  const employees = [];
  snapshot.forEach(doc => {
    employees.push({ id: doc.id, ...doc.data() });
  });
  return employees;
}

async function findEmployeeByRefreshToken(token) {
  const snapshot = await db.collection('employees').where('refreshToken', '==', token).get();
  if (snapshot.empty) {
    return [];
  }
  const employees = [];
  snapshot.forEach(doc => {
    employees.push({ id: doc.id, ...doc.data() });
  });
  return employees[0];
}
async function getEmployeesByUsername(username) {
  const snapshot = await db.collection('employees').where('username', '==', username).get();
  if (snapshot.empty) {
    return [];
  }
  const employees = [];
  snapshot.forEach(doc => {
    employees.push({ id: doc.id, ...doc.data() });
  });
  return employees;
}
async function getEmployeesByUsername(username) {
  const snapshot = await db.collection('employees').where('username', '==', username).get();
  if (snapshot.empty) {
    return [];
  }
  const employees = [];
  snapshot.forEach(doc => {
    employees.push({ id: doc.id, ...doc.data() });
  });
  return employees;
}
async function getEmployeesByEmail(email) {
  const snapshot = await db.collection('employees').where('email', '==', email).get();
  if (snapshot.empty) {
    return [];
  }
  const employees = [];
  snapshot.forEach(doc => {
    employees.push({ id: doc.id, ...doc.data() });
  });
  return employees;
}

async function getEmployeesByotpRSPass(otp) {
  const snapshot = await db.collection('employees').where('otpRSPass', '==', otp).get();
  if (snapshot.empty) {
    return [];
  }
  const employees = [];
  snapshot.forEach(doc => {
    employees.push({ id: doc.id, ...doc.data() });
  });
  return employees;
}
async function deleteEmployee(employeeId) {
  await db.collection('employees').doc(employeeId).delete();
  console.log(`Employee with ID: ${employeeId} has been deleted.`);
}
async function getEmployeesById(employeeId) {
  const docSnap = await db.collection('employees').doc(employeeId).get();
  if (docSnap.exists) {
    return docSnap.data();
  } else {
    return null;
  }
}

async function createSchedule(scheduleData) {
  const schedulePayload = { ...scheduleData, createdAt: new Date() };
  const docRef = await db.collection('schedules').add(schedulePayload);
  return docRef.id;
}

async function getSchedulesByEmployee(employeeId) {
  const snapshot = await db.collection('schedules').where('employeeId', '==', employeeId).orderBy('date', 'desc').get();
  if (snapshot.empty) return [];

  const schedules = [];
  snapshot.forEach(doc => {
    schedules.push({ id: doc.id, ...doc.data() });
  });
  return schedules;
}

async function updateSchedule(scheduleId, updateData) {
  const scheduleRef = db.collection('schedules').doc(scheduleId);
  await scheduleRef.update(updateData);
}

async function deleteSchedule(scheduleId) {
  await db.collection('schedules').doc(scheduleId).delete();
}

// =================================================================
// == Task Services (Dành cho Công việc)
// =================================================================

async function createTask(taskData) {
  const taskPayload = { ...taskData, status: 'pending', createdAt: new Date(), completedAt: null };
  const docRef = await db.collection('tasks').add(taskPayload);
  return docRef.id;
}

async function getTasksByEmployee(employeeId) {
  const snapshot = await db.collection('tasks').where('employeeId', '==', employeeId).get();
  if (snapshot.empty) return [];

  const tasks = [];
  snapshot.forEach(doc => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  return tasks;
}
async function getTasks() {
  const snapshot = await db.collection('tasks').orderBy('createdAt', 'desc').get();
  if (snapshot.empty) return [];

  const tasks = [];
  snapshot.forEach(doc => {
    tasks.push({ id: doc.id, ...doc.data() });
  });
  return tasks;
}
async function updateTask(taskId, updateData) {
  const taskRef = db.collection('tasks').doc(taskId);
  await taskRef.update(updateData);
}

async function deleteTask(taskId) {
  await db.collection('tasks').doc(taskId).delete();
}

module.exports = {
  saveOwnerAccessCode,
  saveOwner,
  getOwnerByPhoneNumber,
  createEmployee,
  updateEmployee,
  getEmployeesByOwner,
  getEmployeesBySetupToken,
  getEmployeesByUsername,
  getEmployeesById,
  getEmployeesByEmail,
  getEmployeesByotpRSPass,
  deleteEmployee,
  createSchedule,
  getSchedulesByEmployee,
  updateSchedule,
  deleteSchedule,
  createTask,
  getTasksByEmployee,
  updateTask,
  deleteTask,
  getTasks
};