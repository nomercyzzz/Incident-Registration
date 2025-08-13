// Скрипт для миграции инцидентов и форм в MySQL
const fs = require('fs');
const db = require('./logic/db');

async function migrateIncidents() {
    const data = fs.readFileSync('./data/incidents.json', 'utf8');
    const incidents = JSON.parse(data).incidents;
    for (const inc of incidents) {
    try {
        await db.query(
        'INSERT INTO incidents (title, description, status, created_at, user_id, type, location, regNumber, date, involvedPersons) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            inc.type,
            inc.description,
            inc.status,
            inc.date,
            null, // user_id не указан в json
            inc.type,
            inc.location,
            inc.regNumber,
            inc.date,
            JSON.stringify(inc.involvedPersons)
        ]
        );
        console.log(`Инцидент ${inc.regNumber} добавлен.`);
    } catch (err) {
        console.error(`Ошибка для ${inc.regNumber}:`, err.message);
        }
    }
}

async function migrateForms() {
    const data = fs.readFileSync('./data/forms.json', 'utf8');
    await db.query('INSERT INTO forms (name, fields) VALUES (?, ?)', ['forms', data]);
    console.log('Формы добавлены.');
}

(async () => {
    await migrateIncidents();
    await migrateForms();
    process.exit();
})();
