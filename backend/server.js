const express = require('express');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const INCIDENTS_FILE = path.join(__dirname, 'data', 'incidents.json');
const FORMS_FILE = path.join(__dirname, 'data', 'forms.json');

const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

// Логика вынесена в отдельные файлы
const accountLogic = require('./logic/account');
const incidentsLogic = require('./logic/add-incidents');

// Middleware для проверки JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Нет токена' });
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Неверный токен' });
  }
}

// Регистрация пользователя
app.post('/api/register', (req, res) => {
  accountLogic.register(req, res, USERS_FILE, JWT_SECRET, JWT_EXPIRES);
});

// Вход пользователя
app.post('/api/login', (req, res) => {
  accountLogic.login(req, res, USERS_FILE, JWT_SECRET, JWT_EXPIRES);
});

// Получить формы (типы, роли, статусы)
app.get('/api/forms', (req, res) => {
  try {
    const data = fs.readFileSync(FORMS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ message: 'Ошибка чтения forms.json' });
  }
});

// Получить все инциденты
app.get('/api/incidents', (req, res) => {
  incidentsLogic.getAll(req, res, INCIDENTS_FILE);
});

// Раздача статики фронтенда
app.use(express.static(path.join(__dirname, '../frontend/src/view')));
app.use('/styles', express.static(path.join(__dirname, '../frontend/src/styles')));
app.use('/script', express.static(path.join(__dirname, '../frontend/src/script')));

// Добавить инцидент (только для авторизованных)
app.post('/api/incidents', authMiddleware, (req, res) => {
  incidentsLogic.add(req, res, INCIDENTS_FILE);
});

// Отдаём index.html для всех неизвестных маршрутов
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../frontend/src/view/index.html');
  res.sendFile(indexPath);
});

app.listen(3000, () => {
  console.log('Сервер запущен на http://localhost:3000');
});
