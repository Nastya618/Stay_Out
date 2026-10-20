document.addEventListener('DOMContentLoaded', () => {
  // === ПЕРЕМЕННЫЕ ИНТЕРФЕЙСА ===
  const updateBtn = document.querySelector('.log-in-btn');
  const modal = document.getElementById('updateModal');
  const closeModalBtn = document.getElementById('btnCloseModal');
  const saveServerBtn = document.getElementById('btnSaveServer');
  const loadServerBtn = document.getElementById('btnLoadServer');
  
  const tableHead = document.getElementById('tableHead');
  const tableBody = document.getElementById('tableBody');


  const databaseURL = 'https://stayoutdb-default-rtdb.firebaseio.com/tracker.json';

  // Базовая структура (если в облаке пока пусто)
  let trackerData = {
    columns: ["Химка", "Лес", "Проводник"],
    rows: ["Фритюрин", "Трейзер", "Дед_Модор", "Nieve-618", "Nasty_Dog", "Iwanish"],
    states: {}
  };

  // === ФУНКЦИЯ ДИНАМИЧЕСКОЙ ОТРИСОВКИ ТАБЛИЦЫ ===
  function renderTable() {
    tableHead.innerHTML = '';
    tableBody.innerHTML = '';

    if (!trackerData.columns || !trackerData.rows) return;

    const totalColumnsCount = 1 + (trackerData.columns.length * 2);
    const singleColumnWidth = (100 / totalColumnsCount).toFixed(4) + '%';

    const headerRow = document.createElement('tr');
    
    const thChar = document.createElement('th');
    thChar.style.width = singleColumnWidth;
    thChar.style.verticalAlign = 'middle';
    thChar.textContent = 'ПЕРСОНАЖ / МЕСТО';
    headerRow.appendChild(thChar);

    trackerData.columns.forEach(zone => {
      const thZone = document.createElement('th');
      thZone.setAttribute('colspan', '2'); 
      thZone.style.width = ((100 / totalColumnsCount) * 2).toFixed(4) + '%';
      thZone.textContent = zone;
      headerRow.appendChild(thZone);
    });
    tableHead.appendChild(headerRow);

    trackerData.rows.forEach(char => {
      const tr = document.createElement('tr');
      
      const tdName = document.createElement('td');
      tdName.className = 'char-name';
      tdName.style.width = singleColumnWidth;
      tdName.textContent = char;
      tr.appendChild(tdName);

      trackerData.columns.forEach(zone => {
        const tdGive = document.createElement('td');
        tdGive.style.width = singleColumnWidth;
        const keyGive = `${char}_${zone}_give`.replace(/\s+/g, '_');
        tdGive.innerHTML = `
          <div class="cell-content">
            <span class="table-icon icon-give"></span>
            <input type="checkbox" name="${keyGive}" class="form-check-input custom-checkbox" ${trackerData.states[keyGive] ? 'checked' : ''}>
          </div>
        `;
        tr.appendChild(tdGive);

        const tdReach = document.createElement('td');
        tdReach.style.width = singleColumnWidth;
        const keyReach = `${char}_${zone}_reach`.replace(/\s+/g, '_');
        tdReach.innerHTML = `
          <div class="cell-content">
            <span class="table-icon icon-reach"></span>
            <input type="checkbox" name="${keyReach}" class="form-check-input custom-checkbox" ${trackerData.states[keyReach] ? 'checked' : ''}>
          </div>
        `;
        tr.appendChild(tdReach);
      });

      tableBody.appendChild(tr);
    });

    document.querySelectorAll('.custom-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        trackerData.states[e.target.name] = e.target.checked;
      });
    });
  }

  // =========================================================================
  // === ЛОГИКА ВЫПАДАЮЩИХ СПИСКОВ (6 КНОПОК СТРУКТУРЫ) ===

  // 1. ПЕРСОНАЖИ: Добавление нового сталкера
  document.getElementById('addCharacterBtn').addEventListener('click', () => {
    const newChar = prompt('Введите имя нового персонажа:');
    if (newChar && newChar.trim() !== '') {
      if (!trackerData.rows) trackerData.rows = [];
      trackerData.rows.push(newChar.trim());
      renderTable();
    }
  });

  // 2. ПЕРСОНАЖИ: Переименование (с переносом сохраненных галочек на новое имя)
  document.getElementById('editCharacterBtn').addEventListener('click', () => {
    if (!trackerData.rows || trackerData.rows.length === 0) return alert('Список персонажей пуст.');
    
    const list = trackerData.rows.map((char, i) => `${i + 1}. ${char}`).join('\n');
    const choice = prompt(`Введите НОМЕР персонажа для переименования:\n\n${list}`);
    const index = parseInt(choice) - 1;

    if (!isNaN(index) && index >= 0 && index < trackerData.rows.length) {
      const currentName = trackerData.rows[index];
      const newName = prompt(`Изменить имя персонажа "${currentName}" на:`, currentName);
      
      if (newName && newName.trim() !== '' && newName.trim() !== currentName) {
        // Умный перенос галочек: перезаписываем ключи в объекте состояний под новое имя
        trackerData.columns.forEach(zone => {
          ['give', 'reach'].forEach(type => {
            const oldKey = `${currentName.replace(/\s+/g, '_')}_${zone}_${type}`;
            const newKey = `${newName.trim().replace(/\s+/g, '_')}_${zone}_${type}`;
            if (trackerData.states[oldKey] !== undefined) {
              trackerData.states[newKey] = trackerData.states[oldKey];
              delete trackerData.states[oldKey]; // Стираем старое имя из памяти
            }
          });
        });
        trackerData.rows[index] = newName.trim();
        renderTable();
      }
    }
  });

  // 3. ПЕРСОНАЖИ: Удаление строки
  document.getElementById('deleteCharacterBtn').addEventListener('click', () => {
    if (!trackerData.rows || trackerData.rows.length === 0) return alert('Список персонажей пуст.');
    
    const list = trackerData.rows.map((char, i) => `${i + 1}. ${char}`).join('\n');
    const choice = prompt(`Введите НОМЕР персонажа для УДАЛЕНИЯ:\n\n${list}`);
    const index = parseInt(choice) - 1;

    if (!isNaN(index) && index >= 0 && index < trackerData.rows.length) {
      if (confirm(`Вы уверены, что хотите полностью удалить персонажа "${trackerData.rows[index]}"?`)) {
        trackerData.rows.splice(index, 1);
        renderTable();
      }
    }
  });

  // 4. ЗОНЫ: Добавление новой локации (двух колонок)
  document.getElementById('addZoneBtn').addEventListener('click', () => {
    const newZone = prompt('Введите название новой игровой зоны (например, Любеч):');
    if (newZone && newZone.trim() !== '') {
      if (!trackerData.columns) trackerData.columns = [];
      trackerData.columns.push(newZone.trim());
      renderTable();
    }
  });

  // 5. ЗОНЫ: Переименование столбца
  document.getElementById('editZoneBtn').addEventListener('click', () => {
    if (!trackerData.columns || trackerData.columns.length === 0) return alert('Список зон пуст.');
    
    const list = trackerData.columns.map((zone, i) => `${i + 1}. ${zone}`).join('\n');
    const choice = prompt(`Введите НОМЕР зоны для переименования:\n\n${list}`);
    const index = parseInt(choice) - 1;

    if (!isNaN(index) && index >= 0 && index < trackerData.columns.length) {
      const currentZone = trackerData.columns[index];
      const newZone = prompt(`Изменить название зоны "${currentZone}" на:`, currentZone);
      
      if (newZone && newZone.trim() !== '' && newZone.trim() !== currentZone) {
        trackerData.columns[index] = newZone.trim();
        renderTable();
      }
    }
  });

  // 6. ЗОНЫ: Удаление столбца
  document.getElementById('deleteZoneBtn').addEventListener('click', () => {
    if (!trackerData.columns || trackerData.columns.length === 0) return alert('Список зон пуст.');
    
    const list = trackerData.columns.map((zone, i) => `${i + 1}. ${zone}`).join('\n');
    const choice = prompt(`Введите НОМЕР зоны для полного УДАЛЕНИЯ:\n\n${list}`);
    const index = parseInt(choice) - 1;

    if (!isNaN(index) && index >= 0 && index < trackerData.columns.length) {
      if (confirm(`Вы уверены, что хотите удалить зону "${trackerData.columns[index]}" и обнулить её прогресс?`)) {
        trackerData.columns.splice(index, 1);
        renderTable();
      }
    }
  });

  // =========================================================================
  // === СЛУШАТЕЛИ КНОПОК СБРОСИТЬ И ПОПАПА ОБНОВИТЬ ===
  
  document.querySelectorAll('.reset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.custom-checkbox').forEach(cb => cb.checked = false);
      for (let key in trackerData.states) trackerData.states[key] = false;
    });
  });

  if (updateBtn) updateBtn.addEventListener('click', () => modal.classList.add('show'));
  closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

  // =========================================================================
  // === ОБМЕН ДАННЫМИ С FIREBASE ОБЛАКОМ ===

  // Отправка (Сохранить на сервер)
  saveServerBtn.addEventListener('click', async () => {
    try {
      const response = await fetch(databaseURL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackerData)
      });
      if (response.ok) alert('Успешно: Текущая структура и галочки сохранены на сервере!');
      else alert('Ошибка сохранения данных.');
    } catch (e) {
      alert('Нет связи с сервером Firebase.');
    }
    modal.classList.remove('show');
  });

  // Загрузка (Загрузить с сервера)
  loadServerBtn.addEventListener('click', async () => {
    try {
      const response = await fetch(databaseURL);
      const serverData = await response.json();
        if (response.ok && serverData) {
            trackerData = serverData;
            if (!trackerData.states) trackerData.states = {};
            renderTable();
            alert('Успешно: Актуальное состояние подгружено со всех устройств!');
        } else {
        alert('Данных в облаке пока нет. Нарисуйте таблицу и сохраните её.');
        }
    } catch (e) {
      alert('Ошибка при попытке скачать данные.');
    }
     modal.classList.remove('show');
  });
// Первичный автоматический рендер таблицы при открытии сайта
    renderTable();
});

  // =========================================================================
  // === КАЛЬКУЛЯТОР ВНУТРИИГРОВОГО ВРЕМЕНИ ===

  const calcHourInput = document.getElementById('calcHour');
  const calcMinuteInput = document.getElementById('calcMinute');
  const btnSetGameTime = document.getElementById('btnSetGameTime');
  const noonCountdown = document.getElementById('noonCountdown');
  const midnightCountdown = document.getElementById('midnightCountdown');

  let baseRealTime = null; // Реальное время ввода (в миллисекундах)
  let baseGameMinutes = null; // Внутриигровое время на тот момент (в минутах суток)

  // Константы перерасчета времени
  const REAL_SECONDS_PER_GAME_HOUR = 525;
  const REAL_SECONDS_PER_GAME_MINUTE = REAL_SECONDS_PER_GAME_HOUR / 60; // 8.75 секунд

  btnSetGameTime.addEventListener('click', () => {
    let hours = parseInt(calcHourInput.value);
    let minutes = parseInt(calcMinuteInput.value);

    // Валидация полей
    if (isNaN(hours) || hours < 0 || hours > 23 || isNaN(minutes) || minutes < 0 || minutes > 59) {
      alert('Укажите корректное время на КПК (Часы от 0 до 23, Минуты от 0 до 59)');
      return;
    }

    // Запоминаем точку отсчета: реальное время клика и введенные игровые минуты
    baseRealTime = Date.now();
    baseGameMinutes = (hours * 60) + minutes;
  });

  // Функция форматирования секунд в ЧЧ:ММ:СС
  function formatRealTime(totalSeconds) {
    if (totalSeconds <= 0) return "00:00:00";
    let hrs = Math.floor(totalSeconds / 3600);
    let mins = Math.floor((totalSeconds % 3600) / 60);
    let secs = Math.floor(totalSeconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Обновление таймеров каждую секунду
  setInterval(() => {
    // Если время еще не синхронизировано, ничего не считаем
    if (baseRealTime === null || baseGameMinutes === null) return;

    // Сколько реальных секунд прошло с момента ввода времени
    const realSecondsPassed = (Date.now() - baseRealTime) / 1000;

    // Переводим прошедшие секунды в прошедшие игровые минуты
    const gameMinutesPassed = realSecondsPassed / REAL_SECONDS_PER_GAME_MINUTE;

    // Текущее точное игровое время в минутах от начала суток
    let currentGameMinutes = (baseGameMinutes + gameMinutesPassed) % 1440;

    // Расчет до Полдня (12:00 = 720 минут)
    let minutesToNoon = 720 - currentGameMinutes;
    if (minutesToNoon <= 0) minutesToNoon += 1440; // Если полдень уже прошел, ждем следующий день
    let realSecondsToNoon = minutesToNoon * REAL_SECONDS_PER_GAME_MINUTE;
    noonCountdown.textContent = formatRealTime(realSecondsToNoon);

    // Расчет до Полночи (00:00 = 1440 или 0 минут)
    let minutesToMidnight = 1440 - currentGameMinutes;
    if (minutesToMidnight <= 0) minutesToMidnight += 1440;
    let realSecondsToMidnight = minutesToMidnight * REAL_SECONDS_PER_GAME_MINUTE;
    midnightCountdown.textContent = formatRealTime(realSecondsToMidnight);

  }, 1000);
