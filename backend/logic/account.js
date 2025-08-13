const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

exports.register = async (req, res, JWT_SECRET, JWT_EXPIRES) => {
  const { login, email, password } = req.body;
  try {
    // Проверка существования пользователя
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? OR email = ?', [login, email]);
    if (rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }
    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.query('INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)', [login, hashedPassword, 'user', email]);
    const [userRows] = await db.query('SELECT id FROM users WHERE username = ?', [login]);
    const newUser = userRows[0];
    const token = jwt.sign({ userId: newUser.id, login }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token });
  } catch (err) {
    console.error('Ошибка при регистрации:', err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};

exports.login = async (req, res, JWT_SECRET, JWT_EXPIRES) => {
  const { login, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [login]);
    const user = rows[0];
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }
    const token = jwt.sign({ userId: user.id, login: user.username }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token });
  } catch (err) {
    console.error('Ошибка при входе:', err);
    res.status(500).json({ message: 'Ошибка сервера', error: err.message });
  }
};
