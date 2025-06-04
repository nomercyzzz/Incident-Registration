import { createApp, ref, onMounted } from 'vue';

createApp({
    setup() {
        const form = ref({
            type: '',
            date: '',
            location: '',
            status: '',
            description: '',
            involvedPersons: []
        });
        const incidentTypes = ref([]);
        const statuses = ref([]);
        const personRoles = ref([]);

        // Получение форм с бэкенда
        const fetchForms = async () => {
            const res = await fetch('/api/forms');
            const data = await res.json();
            incidentTypes.value = data.incidentTypes;
            statuses.value = data.statuses;
            personRoles.value = data.personRoles;
        };        onMounted(async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'account.html';
                return;
            }

            try {
                // Проверяем валидность токена
                const payload = JSON.parse(atob(token.split('.')[1]));
                const expiry = payload.exp * 1000; // конвертируем в миллисекунды
                if (Date.now() >= expiry) {
                    localStorage.removeItem('token');
                    window.location.href = 'account.html';
                    return;
                }
            } catch (e) {
                localStorage.removeItem('token');
                window.location.href = 'account.html';
                return;
            }

            await fetchForms();
        });

        // Добавление причастного лица
        const addPerson = () => {
            form.value.involvedPersons.push({
                fullName: '',
                role: '',
                address: '',
                criminalRecord: 0,
                details: ''
            });
        };
        // Удаление причастного лица
        const removePerson = (index) => {
            form.value.involvedPersons.splice(index, 1);
        };
        // Отправка формы на сервер
        const submitForm = async () => {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/incidents', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(form.value)
            });
            if (res.ok) {
                window.location.href = 'index.html';
            } else {
                alert('Ошибка: требуется авторизация!');
            }
        };
        // Возврат на главную страницу
        const goBack = () => {
            window.location.href = 'index.html';
        };
        return {
            form,
            incidentTypes,
            statuses,
            personRoles,
            addPerson,
            removePerson,
            submitForm,
            goBack
        };
    }
}).mount('#app');