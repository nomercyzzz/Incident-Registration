const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

exports.register = (req, res, USERS_FILE, JWT_SECRET, JWT_EXPIRES) => {
  const { login, email, password } = req.body;
  const users = readUsers(USERS_FILE);
  if (users.some(u => u.login === login || u.email === email)) {
    return res.status(400).json({ message: 'Пользователь уже существует' });
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: users.length + 1,
    login,
    email,
    password: hashedPassword
  };
  users.push(newUser);
  saveUsers(USERS_FILE, users);  const token = jwt.sign({ 
    userId: newUser.id,
    login: newUser.login 
  }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token });
};

exports.login = (req, res, USERS_FILE, JWT_SECRET, JWT_EXPIRES) => {
  const { login, password } = req.body;
  const users = readUsers(USERS_FILE);
  const user = users.find(u => u.login === login);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Неверный логин или пароль' });
  }  const token = jwt.sign({ 
    userId: user.id,
    login: user.login 
  }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token });
};
