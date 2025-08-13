const fs = require('fs');
const bcrypt = require('bcryptjs');
const db = require('./db');

function readUsers(USERS_FILE) {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return data ? JSON.parse(data).users || [] : [];
  } catch {
    return [];
  }
}
function saveUsers(USERS_FILE, users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}
function readIncidents(INCIDENTS_FILE) {
  try {
    const data = fs.readFileSync(INCIDENTS_FILE, 'utf8');
    return data ? JSON.parse(data).incidents || [] : [];
  } catch {
    return [];
  }
}
function saveIncidents(INCIDENTS_FILE, incidents) {
  fs.writeFileSync(INCIDENTS_FILE, JSON.stringify({ incidents }, null, 2));
}

exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username AS login, email, role FROM users');
    res.json({ users });
  } catch (err) {
    console.error('Ошибка при получении пользователей:', err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};
exports.deleteUser = (req, res, USERS_FILE) => {
  const { id } = req.params;
  let users = readUsers(USERS_FILE);
  users = users.filter(u => u.id !== Number(id));
  saveUsers(USERS_FILE, users);
  res.json({ message: 'Пользователь удалён' });
};
exports.updateUser = (req, res, USERS_FILE) => {
  const { id } = req.params;
  const { login, email, password } = req.body;
  let users = readUsers(USERS_FILE);
  const idx = users.findIndex(u => u.id === Number(id));
  if (idx === -1) return res.status(404).json({ message: 'Пользователь не найден' });
  users[idx].login = login;
  users[idx].email = email;
  if (password) users[idx].password = bcrypt.hashSync(password, 10);
  saveUsers(USERS_FILE, users);
  res.json({ message: 'Пользователь обновлён' });
};
exports.deleteIncident = (req, res, INCIDENTS_FILE) => {
  const { regNumber } = req.params;
  let incidents = readIncidents(INCIDENTS_FILE);
  incidents = incidents.filter(i => i.regNumber !== regNumber);
  saveIncidents(INCIDENTS_FILE, incidents);
  res.json({ message: 'Инцидент удалён' });
};
exports.updateIncident = (req, res, INCIDENTS_FILE) => {
  const { regNumber } = req.params;
  const update = req.body;
  let incidents = readIncidents(INCIDENTS_FILE);
  const idx = incidents.findIndex(i => i.regNumber === regNumber);
  if (idx === -1) return res.status(404).json({ message: 'Инцидент не найден' });
  incidents[idx] = { ...incidents[idx], ...update };
  saveIncidents(INCIDENTS_FILE, incidents);
  res.json({ message: 'Инцидент обновлён' });
};
exports.createUser = (req, res, USERS_FILE) => {
  const { login, email, password } = req.body;
  let users = readUsers(USERS_FILE);
  if (users.some(u => u.login === login || u.email === email)) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: users.length ? Math.max(...users.map(u => u.id)) + 1 : 1,
    login,
    email,
    password: hashedPassword
  };
  users.push(newUser);
  saveUsers(USERS_FILE, users);
  res.status(201).json({ message: 'Пользователь создан', user: newUser });
};
exports.createIncident = (req, res, INCIDENTS_FILE) => {
  let incidents = readIncidents(INCIDENTS_FILE);
  const newIncident = req.body;
  newIncident.regNumber = `INC-${String(incidents.length + 1).padStart(3, '0')}`;
  if (Array.isArray(newIncident.involvedPersons)) {
    newIncident.involvedPersons.forEach((p, idx) => {
      p.regNumber = `P-${String(incidents.length * 10 + idx + 1).padStart(3, '0')}`;
    });
  }
  incidents.push(newIncident);
  saveIncidents(INCIDENTS_FILE, incidents);
  res.status(201).json({ message: 'Инцидент создан', incident: newIncident });
};
