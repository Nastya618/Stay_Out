document.addEventListener('DOMContentLoaded', () => {
  const updateBtn = document.querySelector('.log-in-btn');
  const modal = document.getElementById('updateModal');
  const closeModalBtn = document.getElementById('btnCloseModal');
  const saveServerBtn = document.getElementById('btnSaveServer');
  const loadServerBtn = document.getElementById('btnLoadServer');
  
  const tableHead = document.getElementById('tableHead');
  const tableBody = document.getElementById('tableBody');


  const databaseURL = 'https://stayoutdb-default-rtdb.firebaseio.com/tracker.json';

  let trackerData = {
    columns: ["Химка", "Лес", "Проводник"],
    rows: ["Фритюрин", "Трейзер", "Дед_Модор", "Nieve-618", "Nasty_Dog", "Iwanish"],
    states: {}
  };

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
      });

      tableBody.appendChild(tr);
    });

    document.querySelectorAll('.custom-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        trackerData.states[e.target.name] = e.target.checked;
      });
    });
  }

  document.getElementById('addCharacterBtn').addEventListener('click', () => {
    const newChar = prompt('Введите имя нового персонажа:');
    if (newChar && newChar.trim() !== '') {
      if (!trackerData.rows) trackerData.rows = [];
      trackerData.rows.push(newChar.trim());
      renderTable();
    }
  });

  document.getElementById('editCharacterBtn').addEventListener('click', () => {
    if (!trackerData.rows || trackerData.rows.length === 0) return alert('Список персонажей пуст.');
    
    const list = trackerData.rows.map((char, i) => `${i + 1}. ${char}`).join('\n');
    const choice = prompt(`Введите НОМЕР персонажа для переименования:\n\n${list}`);
    const index = parseInt(choice) - 1;

    if (!isNaN(index) && index >= 0 && index < trackerData.rows.length) {
      const currentName = trackerData.rows[index];
      const newName = prompt(`Изменить имя персонажа "${currentName}" на:`, currentName);
      
      if (newName && newName.trim() !== '' && newName.trim() !== currentName) {
        trackerData.columns.forEach(zone => {
          ['give', 'reach'].forEach(type => {
            const oldKey = `${currentName.replace(/\s+/g, '_')}_${zone}_${type}`;
            const newKey = `${newName.trim().replace(/\s+/g, '_')}_${zone}_${type}`;
            if (trackerData.states[oldKey] !== undefined) {
              trackerData.states[newKey] = trackerData.states[oldKey];
              delete trackerData.states[oldKey];
            }
          });
        });
        trackerData.rows[index] = newName.trim();
        renderTable();
      }
    }
  });

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

  document.getElementById('addZoneBtn').addEventListener('click', () => {
    const newZone = prompt('Введите название новой игровой зоны (например, Любеч):');
    if (newZone && newZone.trim() !== '') {
      if (!trackerData.columns) trackerData.columns = [];
      trackerData.columns.push(newZone.trim());
      renderTable();
    }
  });

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

  document.querySelectorAll('.reset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.custom-checkbox').forEach(cb => cb.checked = false);
      for (let key in trackerData.states) trackerData.states[key] = false;
    });
  });

  if (updateBtn) updateBtn.addEventListener('click', () => modal.classList.add('show'));
  closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('show'); });

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
    renderTable();
});

  const calcHourInput = document.getElementById('calcHour');
  const calcMinuteInput = document.getElementById('calcMinute');
  const btnSetGameTime = document.getElementById('btnSetGameTime');
  const noonCountdown = document.getElementById('noonCountdown');
  const midnightCountdown = document.getElementById('midnightCountdown');
  const noonValueTime = document.getElementById('noonValueTime');
  const midnightValueTime = document.getElementById('midnightValueTime');


  let baseRealTime = null;
  let baseGameMinutes = null; 

  const REAL_SECONDS_PER_GAME_HOUR = 525;
  const REAL_SECONDS_PER_GAME_MINUTE = REAL_SECONDS_PER_GAME_HOUR / 60;

  btnSetGameTime.addEventListener('click', () => {
    let hours = parseInt(calcHourInput.value);
    let minutes = parseInt(calcMinuteInput.value);

    if (isNaN(hours) || hours < 0 || hours > 23 || isNaN(minutes) || minutes < 0 || minutes > 59) {
      alert('Укажите корректное время на КПК (Часы от 0 до 23, Минуты от 0 до 59)');
      return;
    }

    baseRealTime = Date.now();
    baseGameMinutes = (hours * 60) + minutes;
  });

  function formatRealTime(totalSeconds) {
    if (totalSeconds <= 0) return "00:00:00";
    let hrs = Math.floor(totalSeconds / 3600);
    let mins = Math.floor((totalSeconds % 3600) / 60);
    let secs = Math.floor(totalSeconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function formatAbsoluteTime(futureDate) {
    let hrs = futureDate.getHours().toString().padStart(2, '0');
    let mins = futureDate.getMinutes().toString().padStart(2, '0');
    return `${hrs}:${mins}`;
  }


  setInterval(() => {
    if (baseRealTime === null || baseGameMinutes === null) return;

    const realSecondsPassed = (Date.now() - baseRealTime) / 1000;
    const gameMinutesPassed = realSecondsPassed / REAL_SECONDS_PER_GAME_MINUTE;
    
    let currentGameMinutes = (baseGameMinutes + gameMinutesPassed) % 1440;
    let minutesToNoon = 720 - currentGameMinutes;
    if (minutesToNoon <= 0) minutesToNoon += 1440;
    let realSecondsToNoon = minutesToNoon * REAL_SECONDS_PER_GAME_MINUTE;
    noonCountdown.textContent = formatRealTime(realSecondsToNoon);

    let minutesToMidnight = 1440 - currentGameMinutes;
    if (minutesToMidnight <= 0) minutesToMidnight += 1440;
    let realSecondsToMidnight = minutesToMidnight * REAL_SECONDS_PER_GAME_MINUTE;
    midnightCountdown.textContent = formatRealTime(realSecondsToMidnight);

    const noonTargetDate = new Date(Date.now() + realSecondsToNoon * 1000);
    noonTimeValue.textContent = `${formatAbsoluteTime(noonTargetDate)}`;

    const midnightTargetDate = new Date(Date.now() + realSecondsToMidnight * 1000);
    midnightTimeValue.textContent = `${formatAbsoluteTime(midnightTargetDate)}`;

  }, 1000);
