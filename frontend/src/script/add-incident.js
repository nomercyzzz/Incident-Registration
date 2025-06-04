const { createApp } = Vue;

createApp({
    data() {
        return {
            form: {
                type: '',
                date: '',
                location: '',
                status: '',
                description: '',
                involvedPersons: []
            },
            incidentTypes: [],
            statuses: [],
            personRoles: [],
            alert: {
                show: false,
                type: 'success',
                title: '',
                message: '',
                btnText: 'OK'
            }
        };
    },
    methods: {
        goBack() {
            window.location.href = 'index.html';
        },
        
        showAlert(type, title, message, btnText = 'OK') {
            this.alert = {
                show: true,
                type,
                title,
                message,
                btnText
            };

            // Автоматически скрываем алерт через 5 секунд
            setTimeout(() => {
                if (this.alert.show) {
                    this.alert.show = false;
                }
            }, 5000);
        },

        // Методы для работы с формой
        async fetchForms() {
                const res = await fetch('/api/forms');
                const data = await res.json();
                this.incidentTypes = data.incidentTypes || [];
                this.statuses = data.statuses || [];
                this.personRoles = data.personRoles || [];
        },

        addPerson() {
            this.form.involvedPersons.push({
                fullName: '',
                role: '',
                address: '',
                criminalRecord: 0,
                details: ''
            });
        },

        removePerson(index) {
            this.form.involvedPersons.splice(index, 1);
        },

        async submitForm() {
                const token = localStorage.getItem('token');
                if (!token) {
                    window.location.href = 'account.html';
                    return;
                }

                const res = await fetch('/api/incidents', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(this.form)
                });

                if (res.ok) {
                    this.showAlert('success', 'Успешно!', 'Инцидент успешно зарегистрирован');
                    setTimeout(() => window.location.href = 'index.html', 5000);
                } else {
                    const data = await res.json();
                    this.showAlert('error', 'Ошибка!', data.message || 'Ошибка при добавлении происшествия');
                }
        }
    },
    async mounted() {
        if (!localStorage.getItem('token')) {
            window.location.href = 'account.html';
            return;
        }
        await this.fetchForms();
    }
}).mount('#app');