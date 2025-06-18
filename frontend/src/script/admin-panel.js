const { createApp, ref, onMounted } = Vue;

createApp({
    setup() {
        const users = ref([]);
        const incidents = ref([]);
        const showAddIncident = ref(false);
        const showEditUser = ref(false);
        const editUserData = ref({ id: '', login: '', email: '', password: '' });
        const showEditIncident = ref(false);
        const editIncidentData = ref({ regNumber: '', type: '', description: '' });
        const showAddUser = ref(false);
        const newUser = ref({ login: '', email: '', password: '' });
        const userSearch = ref('');
        const incidentSearch = ref('');
        const newIncident = ref({ type: '', description: '' });
        const userLoadError = ref('');

        const filteredUsers = Vue.computed(() => {
            if (!userSearch.value) return users.value;
            const q = userSearch.value.toLowerCase();
            return users.value.filter(u =>
                u.login.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                String(u.id).includes(q)
            );
        });
        const filteredIncidents = Vue.computed(() => {
            if (!incidentSearch.value) return incidents.value;
            const q = incidentSearch.value.toLowerCase();
            return incidents.value.filter(i =>
                (i.type && i.type.toLowerCase().includes(q)) ||
                (i.description && i.description.toLowerCase().includes(q)) ||
                (i.regNumber && i.regNumber.toLowerCase().includes(q))
            );
        });

        async function fetchUsers() {
            userLoadError.value = '';
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users', {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                users.value = (await res.json()).users;
            } else {
                userLoadError.value = 'Ошибка загрузки пользователей: ' + (await res.text());
                users.value = [];
            }
        }
        async function fetchIncidents() {
            const res = await fetch('/api/incidents');
            if (res.ok) incidents.value = (await res.json()).incidents;
        }
        function editUser(user) {
            editUserData.value = { ...user, password: '' };
            showEditUser.value = true;
        }
        async function saveUser() {
            const token = localStorage.getItem('token');
            const { id, login, email, password } = editUserData.value;
            const res = await fetch(`/api/users/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ login, email, password })
            });
            if (res.ok) {
                showEditUser.value = false;
                await fetchUsers();
            } else {
                alert('Ошибка сохранения пользователя');
            }
        }
        async function deleteUser(id) {
            if (!confirm('Удалить пользователя?')) return;
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                await fetchUsers();
            } else {
                alert('Ошибка удаления пользователя');
            }
        }
        function editIncident(incident) {
            editIncidentData.value = { regNumber: incident.regNumber, type: incident.type, description: incident.description };
            showEditIncident.value = true;
        }
        async function saveIncident() {
            const token = localStorage.getItem('token');
            const { regNumber, type, description } = editIncidentData.value;
            const res = await fetch(`/api/incidents/${regNumber}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ type, description })
            });
            if (res.ok) {
                showEditIncident.value = false;
                await fetchIncidents();
            } else {
                alert('Ошибка сохранения инцидента');
            }
        }
        async function deleteIncident(regNumber) {
            if (!confirm('Удалить инцидент?')) return;
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/incidents/${regNumber}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                await fetchIncidents();
            } else {
                alert('Ошибка удаления инцидента');
            }
        }
        async function addUser() {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newUser.value)
            });
            if (res.ok) {
                showAddUser.value = false;
                newUser.value = { login: '', email: '', password: '' };
                await fetchUsers();
            } else {
                alert('Ошибка добавления пользователя');
            }
        }
        async function addIncident() {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/incidents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newIncident.value)
            });
            if (res.ok) {
                showAddIncident.value = false;
                newIncident.value = { type: '', description: '' };
                await fetchIncidents();
            } else {
                alert('Ошибка добавления инцидента');
            }
        }
        function logout() {
            localStorage.removeItem('token');
            window.location.href = 'index.html';
        }
        onMounted(() => {
            fetchUsers();
            fetchIncidents();
        });
        return {
            users, incidents, showAddIncident, showAddUser, editUser, deleteUser, editIncident, deleteIncident,
            showEditUser, editUserData, saveUser, showEditIncident, editIncidentData, saveIncident,
            newUser, addUser, newIncident, addIncident, userSearch, incidentSearch, filteredUsers, filteredIncidents,
            userLoadError, logout
        };
    }
}).mount('#app');