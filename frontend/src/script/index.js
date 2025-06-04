const { createApp, ref, computed, onMounted } = Vue;

const ITEMS_PER_PAGE = 10;

createApp({setup() {
        const incidents = ref([]);
        const filters = ref({
            search: "",
            type: "",
            status: "",
            date: ""
        });
        const sort = ref({
            field: "regNumber",
            direction: "asc"
        });
        const currentPage = ref(1);
        const selectedIncident = ref(null);
        const incidentTypes = ref([]);
        const statuses = ref([]);
        const selectedPeriod = ref(30);
        const isAuthenticated = ref(!!localStorage.getItem('token'));
        const showUserMenu = ref(false);
        const userLogin = ref('');

        // Получение инцидентов с бэкенда
        const fetchIncidents = async () => {
            const res = await fetch('/api/incidents');
            const data = await res.json();
            incidents.value = data.incidents;
            // Заполняем фильтры
            incidentTypes.value = [...new Set(data.incidents.map(inc => inc.type))];
            statuses.value = [...new Set(data.incidents.map(inc => inc.status))];
        };        onMounted(() => {
            fetchIncidents();
            // Декодируем JWT чтобы получить логин
            const token = localStorage.getItem('token');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                if (payload.login) {
                    userLogin.value = payload.login;
                }
            }
        });

        const toggleUserMenu = () => {
            showUserMenu.value = !showUserMenu.value;
        };

        const logout = () => {
            localStorage.removeItem('token');
            isAuthenticated.value = false;
            userLogin.value = '';
            window.location.reload();
        };

        // Фильтрация
        const filteredIncidents = computed(() => {
            return incidents.value.filter(incident => {
                const searchMatch = !filters.value.search ||
                    Object.values(incident).some(val =>
                        val && val.toString().toLowerCase().includes(filters.value.search.toLowerCase())
                    );
                const typeMatch = !filters.value.type || incident.type === filters.value.type;
                const statusMatch = !filters.value.status || incident.status === filters.value.status;
                const dateMatch = !filters.value.date || incident.date === filters.value.date;
                return searchMatch && typeMatch && statusMatch && dateMatch;
            });
        });
        // Сортировка и пагинация
        const sortedAndPaginatedIncidents = computed(() => {
            const sorted = [...filteredIncidents.value].sort((a, b) => {
                const modifier = sort.value.direction === 'asc' ? 1 : -1;
                return a[sort.value.field] > b[sort.value.field] ? modifier : -modifier;
            });
            const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
            return sorted.slice(start, start + ITEMS_PER_PAGE);
        });
        // Статистика
        const stats = computed(() => ({
            total: incidents.value.length,
            currentPeriod: incidents.value.filter(inc => {
                const periodStart = new Date();
                periodStart.setDate(periodStart.getDate() - selectedPeriod.value);
                return new Date(inc.date) >= periodStart;
            }).length
        }));
        const totalPages = computed(() =>
            Math.ceil(filteredIncidents.value.length / ITEMS_PER_PAGE)
        );
        return {
            incidents: sortedAndPaginatedIncidents,
            searchQuery: computed({
                get: () => filters.value.search,
                set: val => filters.value.search = val
            }),
            typeFilter: computed({
                get: () => filters.value.type,
                set: val => filters.value.type = val
            }),
            statusFilter: computed({
                get: () => filters.value.status,
                set: val => filters.value.status = val
            }),
            dateFilter: computed({
                get: () => filters.value.date,
                set: val => filters.value.date = val
            }),
            currentPage,
            selectedIncident,
            incidentTypes,
            statuses,
            totalPages,
            totalIncidents: computed(() => stats.value.total),
            currentPeriodIncidents: computed(() => stats.value.currentPeriod),
            selectedPeriod,
            formatDate: date => new Date(date).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            sortBy: field => {
                if (sort.value.field === field) {
                    sort.value.direction = sort.value.direction === 'asc' ? 'desc' : 'asc';
                } else {
                    sort.value.field = field;
                    sort.value.direction = 'asc';
                }
            },
            showDetails: incident => selectedIncident.value = incident,
            closeDetails: () => selectedIncident.value = null,navigateToAddIncident: () => {
                if (!isAuthenticated.value) {
                    window.location.href = 'account.html';
                } else {
                    window.location.href = 'add-incident.html';
                }
            },
            isAuthenticated,
            showUserMenu,
            userLogin,
            toggleUserMenu,
            logout
        };
    }
}).mount('#app');
