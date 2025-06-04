const { createApp } = Vue;

createApp({
    data() {
        return {
            activeTab: 'login',
                loginForm: { username: '', password: '' },
            registerForm: { username: '', email: '', password: '' },
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
        showAlert(type, title, message, btnText = 'OK') {
            this.alert = {
                show: true,
                type,
                title,
                message,
                btnText
            };
            // Для успешного входа/регистрации
            if (type === 'success') {
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 5000);
            } else {
                // Для ошибок - 3 секунды
                setTimeout(() => {
                    if (this.alert.show) {
                        this.alert.show = false;
                    }
                }, 6000);
            }
        },
        async submitLogin() {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    login: this.loginForm.username, 
                    password: this.loginForm.password 
                })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);                this.showAlert('success', 'Успешно!', 'Вход выполнен успешно');
            } else {
                this.showAlert('error', 'Ошибка!', data.message || 'Ошибка входа');
            }
        },
        async submitRegister() {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    login: this.registerForm.username,
                    email: this.registerForm.email,
                    password: this.registerForm.password 
                })
            });

            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);                this.showAlert('success', 'Успешно!', 'Регистрация успешна');
            } else {
                this.showAlert('error', 'Ошибка!', data.message || 'Ошибка регистрации');
            }
        },        closeAlert() {
            this.alert.show = false;
        }
    },
    mounted() {
        if (localStorage.getItem('token')) {
            window.location.href = 'index.html';
        }

        const forms = {
            login: document.querySelector('.form-wrapper.active .auth-form'),
            register: document.querySelectorAll('.form-wrapper')[1]?.querySelector('.auth-form')
        };

        if (forms.login) {
            forms.login.onsubmit = e => {
                e.preventDefault();
                this.submitLogin();
            };
        }
        if (forms.register) {
            forms.register.onsubmit = e => {
                e.preventDefault();
                this.submitRegister();
            };
        }
    }
}).mount('#app');
