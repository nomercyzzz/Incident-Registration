const { createApp } = Vue;

createApp({
    data() {
        return {
            activeTab: 'login',
            loginForm: {
                username: '',
                password: ''
            },
            registerForm: {
                username: '',
                email: '',
                password: ''
            },
            error: ''
        };
    },
    methods: {
        async login() {
            this.error = '';
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    login: this.loginForm.username,
                    password: this.loginForm.password
                })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                window.location.href = 'index.html';
            } else {
                this.error = 'Неверный логин или пароль';
            }
        },
        async register() {
            this.error = '';
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    login: this.registerForm.username,
                    email: this.registerForm.email,
                    password: this.registerForm.password
                })
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.token);
                window.location.href = 'index.html';
            } else {
                this.error = 'Ошибка регистрации (логин или email уже занят)';
            }
        }
    },
    mounted() {
        // Если пользователь уже авторизован, сразу на главную
        if (localStorage.getItem('token')) {
            window.location.href = 'index.html';
        }
        // Навесить обработчики на формы
        setTimeout(() => {
            const loginForm = document.querySelector('.form-wrapper.active .auth-form');
            if (loginForm) {
                loginForm.onsubmit = (e) => {
                    e.preventDefault();
                    this.login();
                };
            }
            const registerForm = document.querySelectorAll('.form-wrapper')[1]?.querySelector('.auth-form');
            if (registerForm) {
                registerForm.onsubmit = (e) => {
                    e.preventDefault();
                    this.register();
                };
            }
        }, 0);
    }
}).mount('#app');
