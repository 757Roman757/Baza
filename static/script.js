document.addEventListener('DOMContentLoaded', () => {
    const filterColumns = document.querySelectorAll('.filter-column');
    const filterValues = document.querySelectorAll('.filter-value');
    const displayColumnSelect = document.querySelector('.display-column');
    const searchBtn = document.getElementById('searchBtn');
    const resultsTable = document.getElementById('resultsTable');
    let allColumns = [];

    // Загрузка всех колонок
    async function loadColumns() {
        try {
            const response = await fetch('/api/columns');
            allColumns = await response.json();
            
            // Заполняем фильтры
            filterColumns.forEach(select => {
                select.innerHTML = '<option value="">Выберите столбец</option>';
                allColumns.forEach(col => {
                    const option = document.createElement('option');
                    option.value = col;
                    option.textContent = col;
                    select.appendChild(option);
                });
            });

            // Заполняем выбор колонок для отображения
            displayColumnSelect.innerHTML = '';
            allColumns.forEach(col => {
                const option = document.createElement('option');
                option.value = col;
                option.textContent = col;
                displayColumnSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Ошибка загрузки колонок:', error);
        }
    }

    // Обработка поиска
    async function performSearch() {
        const filters = [];
        
        // Собираем фильтры
        filterColumns.forEach((colSelect, index) => {
            const column = colSelect.value;
            const value = filterValues[index].value.trim();
            if (column && value) {
                filters.push({ column, value });
            }
        });

        // Выбранные колонки для отображения
        const selectedColumns = Array.from(displayColumnSelect.selectedOptions)
            .map(opt => opt.value)
            .filter(v => v);

        try {
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filters,
                    selectedColumns: selectedColumns.length > 0 ? selectedColumns : allColumns
                })
            });
            
            const data = await response.json();
            updateTable(data, selectedColumns);
        } catch (error) {
            console.error('Ошибка поиска:', error);
        }
    }

    // Обновление таблицы
    function updateTable(data, columns) {
        resultsTable.innerHTML = '';
        
        // Создаем заголовки
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        columns.forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        resultsTable.appendChild(thead);

        // Заполняем данные
        const tbody = document.createElement('tbody');
        data.forEach(row => {
            const tr = document.createElement('tr');
            columns.forEach(col => {
                const td = document.createElement('td');
                td.textContent = row[col] || '-';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        resultsTable.appendChild(tbody);
    }

    // Инициализация
    loadColumns();
    searchBtn.addEventListener('click', performSearch);
});
