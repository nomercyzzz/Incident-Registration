const fs = require('fs');

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

exports.getAll = (req, res, INCIDENTS_FILE) => {
  const incidents = readIncidents(INCIDENTS_FILE);
  res.json({ incidents });
};

exports.add = (req, res, INCIDENTS_FILE) => {
  const incidents = readIncidents(INCIDENTS_FILE);
  const newIncident = req.body;
  // Генерация номера инцидента
  newIncident.regNumber = `INC-${String(incidents.length + 1).padStart(3, '0')}`;
  // Генерация номеров для причастных лиц
  if (Array.isArray(newIncident.involvedPersons)) {
    newIncident.involvedPersons.forEach((p, idx) => {
      p.regNumber = `P-${String(incidents.length * 10 + idx + 1).padStart(3, '0')}`;
    });
  }
  incidents.push(newIncident);
  saveIncidents(INCIDENTS_FILE, incidents);
  res.status(201).json({ message: 'Инцидент добавлен', incident: newIncident });
};
