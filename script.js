const CELL_MARGIN = 2;
const MIN_FIELD_SIZE = 3;
const MAX_FIELD_SIZE = 8;

const date = new Date();
const months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

let movesCounter = 0;
let seconds = '00';
let minutes = '00';

let bestScores = {
  3: [],
  4: [],
  5: [],
  6: [],
  7: [],
  8: []
};

let victory = true;
let result = 0;
let timer = null;
let timePause = true;
let timeStop = true;
let isTimerRun = false;

let sound = true;

let isCellsListenersAdded = false;
let isSettingsOpened = false;
let isLastGameSaved = false;
let cellsArr = [];
let rightSolution;

let cellSize = 0;
let initFieldSize = 4;
let currentFieldSize;

let container; // DOM-элемент container 
let audio; // DOM-элемент аудио 
let settingsRow; // DOM-элемент строка настроек
let newGameButton; // DOM-элемент кнопка новая игра
let timeContainer; // DOM-элемент контейнер таймера
let movesContainer; // DOM-элемент контейнер количества ходов
let settingsButton; // DOM-элемент кнопка настройки
let gameBox; // DOM-элемент контейнер игрового поля
let gameField; // DOM-элемент игровое поле 
let gameSettingsMenu; // DOM-элемент меню настроек
let instruction; // DOM-элемент строка инструкций и сообщений
let bestScoreMessage;
let movesNumber; // DOM-элемент количества ходов
let minutesElement; // DOM-элемент минуты таймера
let secondsElement; // DOM-элемент секунды таймера
let timeTitle; // DOM-элемент название таймера

let startPageMenu; // DOM-элемент стартовая страница меню настроек
let fieldSizePageMenu; // DOM-элемент страница выбора размера игрового поля
let bestScoresPageMenu; // DOM-элемент страница рекордов

let fieldSizeMenuButton; // DOM-элемент кнопка перехода на страницу выбора размера поля
let bestScoresMenuButton; // DOM-элемент кнопка перехода на страницу рекордов
let soundToggle; // DOM-элемент кнопка отключения звука
let closeSettingsButton; // DOM-элемент кнопка закрыть настройки

let fieldSizeTitle; // DOM-элемент заголовок страницы выбора размера поля
let saveFieldSizeButton; // DOM-элемент кнопка сохранить выбранный размер
const fieldsSizeInputElements = []; // массив DOM-элементов выбора размера игрового поля

let bestScoresTitle; // DOM-элемент заголовок страницы рекордов
let selectSizeContainer;
let labelSizeElement;
let selectSizeElement;
const optionSizeElements = [];
let scoresListElement;
const scoreItemElements = [];
let backButton;

let onMouseDown; 

function initGame (fieldSize) {
  container = document.createElement('div');

  settingsRow = document.createElement('div');
  newGameButton = document.createElement('button');
  timeContainer = document.createElement('div');
  movesContainer = document.createElement('div');
  settingsButton = document.createElement('button');

  gameBox = document.createElement('div');
  gameField = document.createElement('div');
  gameSettingsMenu = document.createElement('div');

  instruction = document.createElement('div');
  bestScoreMessage = document.createElement('div');
  movesNumber = document.createElement('span');
  minutesElement = document.createElement('span');
  secondsElement = document.createElement('span');
  timeTitle = document.createElement('span');

  audio = document.createElement('audio');
  audio.setAttribute('src', 'assets/sound.mp3');

  container.classList.add('container');
  settingsRow.classList.add('game-top-row');
  newGameButton.classList.add('new-game');
  timeContainer.classList.add('time');
  movesContainer.classList.add('moves');
  settingsButton.classList.add('settings');

  gameBox.classList.add('game-box');
  gameField.classList.add('game-field');
  gameSettingsMenu.classList.add('game-menu', 'hidden');

  instruction.classList.add('game-instruction');
  bestScoreMessage.classList.add('best-score-message');
  movesNumber.classList.add('moves-numbers');
  minutesElement.classList.add('time-min');
  secondsElement.classList.add('time-sec');
  timeTitle.classList.add('time-title');

  newGameButton.textContent = 'New Game';
  settingsButton.textContent = 'Settings';
  instruction.textContent = `To start a game push the button 'New Game', please.`;

  newGameButton.setAttribute('type', 'button');
  settingsButton.setAttribute('type', 'button');

  timeContainer.innerHTML = `
    <span>:</span>
  `;

  timeContainer.insertAdjacentElement('afterbegin', minutesElement);
  timeContainer.insertAdjacentElement('beforeend', secondsElement);
  timeContainer.insertAdjacentElement('afterbegin', timeTitle);
  minutesElement.textContent = minutes;
  secondsElement.textContent = seconds;
  timeTitle.textContent = 'Time ';

  movesContainer.innerHTML = `
    <span class="moves-title">Moves:</span>
  `;
  movesContainer.appendChild(movesNumber);
  movesNumber.textContent = movesCounter;

  document.body.appendChild(container);
  container.appendChild(settingsRow);
  container.appendChild(gameBox);
  container.appendChild(instruction);
  container.appendChild(bestScoreMessage);
  container.appendChild(audio);

  settingsRow.appendChild(newGameButton);
  settingsRow.appendChild(timeContainer);
  settingsRow.appendChild(movesContainer);
  settingsRow.appendChild(settingsButton);

  gameBox.appendChild(gameField);
  gameBox.appendChild(gameSettingsMenu);

  isLastGameSaved = localStorage.getItem('isLastGameSaved') || isLastGameSaved;
  
  if (isLastGameSaved) {
    loadSaveGame();
  } else {
    currentFieldSize = fieldSize;
    renderGameField();
  }

  getBestScoresList();
  createSettingsMenu();

  newGameButton.addEventListener('click', onNewGameButtonClick);
  settingsButton.addEventListener('click', onSettingsButtonClick);

  window.addEventListener('beforeunload', onWindowBeforeUnload);
}

function onWindowBeforeUnload () {
  // saveLastGame();
  saveBestScoresList();
}

function saveLastGame () {
  isLastGameSaved = !isLastGameSaved;
  
  cellsArr = cellsArr.map(function (cell) {
    return {
      element: (cell.element !== null) ? cell.element.textContent : cell.element,
      left: cell.left,
      top: cell.top
    }
  });

  rightSolution = rightSolution.map(function (cell) {
    return {
      element: (cell.element !== null) ? cell.element.textContent : cell.element,
      left: cell.left,
      top: cell.top
    }
  });

  localStorage.setItem('isLastGameSaved', isLastGameSaved);
  localStorage.setItem('savedCellsArr', JSON.stringify(cellsArr));
  localStorage.setItem('savedRightSolution', JSON.stringify(rightSolution));
  localStorage.setItem('savedFieldSize', currentFieldSize);
  localStorage.setItem('savedMinutes', minutes);
  localStorage.setItem('savedSeconds', seconds);
  localStorage.setItem('savedMoves', movesCounter);
}

function loadSaveGame () {
  cellsArr = JSON.parse(localStorage.getItem('savedCellsArr'));
  rightSolution = JSON.parse(localStorage.getItem('savedRightSolution'));
  currentFieldSize = localStorage.getItem('savedFieldSize');
  minutes = localStorage.getItem('savedMinutes');
  seconds = localStorage.getItem('savedSeconds');
  movesCounter = localStorage.getItem('savedMoves');
  cellSize = (gameField.clientWidth)/currentFieldSize;

  cellsArr.forEach(cell => {
    if (cell.element === null) return;
    const gameCell = document.createElement('div');
    gameCell.classList.add('game-cell');
    gameCell.classList.add('animation');
    gameCell.textContent = cell.element;
    gameField.appendChild(gameCell);
    gameCell.style.left = `${cell.left * cellSize}px`;
    gameCell.style.top = `${cell.top * cellSize}px`;
    gameCell.style.width = `${cellSize - CELL_MARGIN}px`;
    gameCell.style.height = `${cellSize - CELL_MARGIN}px`;

    cell.element = gameCell;
  });

  rightSolution.forEach(cell => {
    if (cell.element === null) return;
    const gameCell = document.createElement('div');
    gameCell.classList.add('game-cell');
    gameCell.classList.add('animation');
    gameCell.textContent = cell.element;
    cell.element = gameCell;
  })

  if (!isCellsListenersAdded) {
    addListenersForCells(currentFieldSize);
  }

  movesNumber.textContent = movesCounter;
  getTime();
}

function createSettingsMenu () {
  startPageMenu = document.createElement('div');
  fieldSizePageMenu = document.createElement('div');
  bestScoresPageMenu = document.createElement('div');

  startPageMenu.classList.add('game-menu-buttons');
  fieldSizePageMenu.classList.add('field-size-menu', 'hidden');
  bestScoresPageMenu.classList.add('best-scores-menu', 'hidden');
  
  gameSettingsMenu.appendChild(startPageMenu);
  gameSettingsMenu.appendChild(fieldSizePageMenu);
  gameSettingsMenu.appendChild(bestScoresPageMenu);

  fieldSizeMenuButton = document.createElement('button');
  bestScoresMenuButton = document.createElement('button');
  soundToggle = document.createElement('button');
  closeSettingsButton = document.createElement('button');

  fieldSizeMenuButton.classList.add('game-menu-button', 'field-size');
  bestScoresMenuButton.classList.add('game-menu-button', 'best-scores');
  soundToggle.classList.add('game-menu-button', 'sound');
  closeSettingsButton.classList.add('game-menu-button', 'close');

  fieldSizeMenuButton.textContent = 'Field Size';
  bestScoresMenuButton.textContent = 'Best Scores';
  soundToggle.textContent = 'Sound On';
  closeSettingsButton.textContent = 'Close';

  startPageMenu.appendChild(fieldSizeMenuButton);
  startPageMenu.appendChild(bestScoresMenuButton);
  startPageMenu.appendChild(soundToggle);
  startPageMenu.appendChild(closeSettingsButton);

  fieldSizeMenuButton.addEventListener('click', onFieldSizeMenuButtonClick);
  bestScoresMenuButton.addEventListener('click', onBestScoresMenuButtonClick);
  soundToggle.addEventListener('click', onSoundToggleClick);
  closeSettingsButton.addEventListener('click', onCloseSettingsButtonClick);

  createFieldSizePage();
  createBestScoresPage();
}

function createFieldSizePage () {
  fieldSizeTitle = document.createElement('span');
  fieldSizeTitle.classList.add('field-size-title');
  fieldSizeTitle.textContent = 'Select field size';
  fieldSizePageMenu.appendChild(fieldSizeTitle);

  for (let i = MIN_FIELD_SIZE; i <= MAX_FIELD_SIZE; i++) {
    const inputFieldSizeContainer = document.createElement('div');  
    inputFieldSizeContainer.classList.add('field-size-input');
    fieldSizePageMenu.appendChild(inputFieldSizeContainer);
  
    const inputFieldSize = document.createElement('input');
    inputFieldSize.setAttribute('type', 'radio');
    inputFieldSize.setAttribute('name', 'field-size');
    inputFieldSize.setAttribute('id', `size-${i}`);
    inputFieldSize.setAttribute('value', `${i}`);
    if (i === 4) inputFieldSize.setAttribute('checked', true);
    inputFieldSizeContainer.appendChild(inputFieldSize);
    
    const labelFieldSize = document.createElement('label');
    labelFieldSize.setAttribute('for', `size-${i}`);
    labelFieldSize.textContent = `${i}x${i}`;
    inputFieldSizeContainer.appendChild(labelFieldSize);

    fieldsSizeInputElements.push({
      container: inputFieldSizeContainer,
      input: inputFieldSize,
      label: labelFieldSize
    });
  }

  saveFieldSizeButton = document.createElement('button');
  saveFieldSizeButton.classList.add('field-size-save');
  saveFieldSizeButton.setAttribute('type', 'button');
  saveFieldSizeButton.textContent = 'Save';
  fieldSizePageMenu.appendChild(saveFieldSizeButton);

  saveFieldSizeButton.addEventListener('click', onSaveButtonClick);
}

function createBestScoresPage () {
  bestScoresTitle = document.createElement('span');
  bestScoresTitle.classList.add('best-scores-title');
  bestScoresTitle.textContent = 'Best scores';
  bestScoresPageMenu.appendChild(bestScoresTitle);

  selectSizeContainer = document.createElement('div');
  selectSizeContainer.classList.add('best-scores-select');
  bestScoresPageMenu.appendChild(selectSizeContainer);

  labelSizeElement = document.createElement('label');
  labelSizeElement.setAttribute('for', 'select-size');
  labelSizeElement.textContent = 'Choose field size: ';
  selectSizeContainer.appendChild(labelSizeElement);

  selectSizeElement = document.createElement('select');
  selectSizeElement.setAttribute('id', 'select-size');
  selectSizeElement.setAttribute('name', 'select-size');
  selectSizeContainer.appendChild(selectSizeElement);

  for (let i = MIN_FIELD_SIZE; i <= MAX_FIELD_SIZE; i++) {
    const option = document.createElement('option'); 
    option.setAttribute('value', `${i}`);
    if (i === 4) option.setAttribute('selected', true);
    option.textContent = `${i}x${i}`;
    selectSizeElement.appendChild(option);
    optionSizeElements.push(option);
  }

  createScoresList(selectSizeElement.value);
  
  backButton = document.createElement('button');
  backButton.classList.add('best-scores-back');
  backButton.setAttribute('type', 'button');
  backButton.textContent = 'Back';
  bestScoresPageMenu.appendChild(backButton);

  backButton.addEventListener('click', onBackButtonClick);
  selectSizeElement.addEventListener('change', onSelectSizeElementChange);
}

function onSelectSizeElementChange () {
  renderScoresList(this.value);
}

function createScoresList (selectedFieldSize) {
  scoresListElement = document.createElement('ol');
  scoresListElement.classList.add('best-scores-list');
  bestScoresPageMenu.appendChild(scoresListElement);

  for (let i = 0; i < 10; i++) {
    const itemScore = document.createElement('li');
    itemScore.innerHTML = `<span>none</span>`;
    scoresListElement.appendChild(itemScore);
    scoreItemElements.push(itemScore);
  }

  renderScoresList(selectedFieldSize);
}

function renderScoresList (selectedFieldSize) {
  scoreItemElements.forEach((itemElement, index) => {
    if (bestScores[selectedFieldSize][index]) {
      itemElement.querySelector('span').textContent = `${bestScores[selectedFieldSize][index].day} ${months[bestScores[selectedFieldSize][index].month]} ${bestScores[selectedFieldSize][index].year} ${bestScores[selectedFieldSize][index].minutes}:${bestScores[selectedFieldSize][index].seconds} ${bestScores[selectedFieldSize][index].moves} moves`;
    } else {
      scoreItemElements[index].querySelector('span').textContent = 'none';
    }
  });
}

function onBackButtonClick () {
  closeBestScores();
}

function onSaveButtonClick () {
  fieldsSizeInputElements.forEach(element => {
    if (element.input.checked) currentFieldSize = element.input.value;
  });

  closeFieldSizePage();
  removeListenersForCells();
  cleanGameField();
  renderGameField();
}

function onFieldSizeMenuButtonClick () {
  openFieldSizePage();
}

function onBestScoresMenuButtonClick () {
  openBestScores();
}

function onSoundToggleClick () {
  sound = !sound;
  soundToggle.textContent = !sound ? 'Sound Off' : 'Sound On';
  playSound();
}

function onCloseSettingsButtonClick () {
  closeSettingsMenu();
}

function openFieldSizePage () {
  startPageMenu.classList.add('hidden');
  fieldSizePageMenu.classList.remove('hidden');
}

function closeFieldSizePage () {
  fieldSizePageMenu.classList.add('hidden');
  startPageMenu.classList.remove('hidden');
}

function openBestScores () {
  startPageMenu.classList.add('hidden');
  bestScoresPageMenu.classList.remove('hidden');
}

function closeBestScores () {
  bestScoresPageMenu.classList.add('hidden');
  startPageMenu.classList.remove('hidden');
}

function renderGameField () {
  cellSize = (gameField.clientWidth)/currentFieldSize;
  for (let i = 0; i < currentFieldSize**2; i++) {
    const coord = {
      left: null,
      top: null, 
      element: null
    };

    coord.left = i % currentFieldSize;
    coord.top = (i - coord.left) / currentFieldSize;

    if (i !== currentFieldSize**2 - 1) {
      const gameCell = document.createElement('div');
      gameCell.classList.add('game-cell');
      gameCell.classList.add('animation');
      gameCell.textContent = i + 1;
      gameField.appendChild(gameCell);
      gameCell.style.left = `${coord.left * cellSize}px`;
      gameCell.style.top = `${coord.top * cellSize}px`;
      gameCell.style.width = `${cellSize - CELL_MARGIN}px`;
      gameCell.style.height = `${cellSize - CELL_MARGIN}px`;
      
      coord.element = gameCell;
    }

    cellsArr.push(coord);
  }

  rightSolution = cellsArr.slice();
}

function cleanGameField () {
  gameField.innerHTML = '';
  cellsArr = [];

  movesCounter = 0;
  movesNumber.textContent = movesCounter;
  instruction.textContent = `To start a game push the button 'New Game', please.`;
  bestScoreMessage.textContent = ``;

  timeStop = !timeStop;
  seconds = '00';
  minutes = '00';
  minutesElement.textContent = minutes;
  secondsElement.textContent =seconds;
}

function onNewGameButtonClick () {
  renderRandomCells();
  if (isSettingsOpened) closeSettingsMenu();
}

function onSettingsButtonClick () {
  isSettingsOpened ? closeSettingsMenu() : openSettingsMenu();
}

function openSettingsMenu () {
  isSettingsOpened = !isSettingsOpened;
  gameSettingsMenu.classList.remove('hidden');

  timePause = !timePause;
}

function closeSettingsMenu () {
  isSettingsOpened = !isSettingsOpened;
  gameSettingsMenu.classList.add('hidden');
  startPageMenu.classList.remove('hidden');
  fieldSizePageMenu.classList.add('hidden');
  bestScoresPageMenu.classList.add('hidden');

  timePause = timePause ? !timePause : timePause;
  if (!isTimerRun) getTime();
}

function randomSortArray (array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function checkSolving () {
  let summ = 0;
  for (let i = 0; i < cellsArr.length; i++) {
    const cell = cellsArr[i];
    if (cell.element !== null) {
      const newArr = cellsArr.slice(i+1)
      newArr.forEach(item => {
        if (item.element === null) return;
        if (parseInt(cell.element.textContent) > parseInt(item.element.textContent)) summ++;
      });
    } else {
      // проверка размерности поля - добавлять ряд пустой ячейки или нет
      if (currentFieldSize%2 === 0) {
        summ += (((i - i % currentFieldSize) / currentFieldSize) + 1);
      }
    }
  }

  if (summ % 2 === 1) return renderRandomCells(currentFieldSize);
}

function renderRandomCells () {
  bestScoreMessage.textContent = ``;
  randomSortArray(cellsArr);
  checkSolving();
  
  for (let i = 0; i < cellsArr.length; i++) {
    const cell = cellsArr[i];
    
    cell.left = i % currentFieldSize;
    cell.top = (i - cell.left) / currentFieldSize;
    
    if (cell.element !== null) {
      cell.element.style.left = `${cell.left * cellSize}px`;
      cell.element.style.top = `${cell.top * cellSize}px`;
    }
  }

  if (!isCellsListenersAdded) {
    addListenersForCells(currentFieldSize);
  }
  
  initTimer();

  victory = victory ? !victory : victory;
  movesCounter = 0;
  movesNumber.textContent = movesCounter;
  instruction.textContent = 'Go!';
}

function addListenersForCells () {
  isCellsListenersAdded = !isCellsListenersAdded;

  cellsArr.forEach(cell => {
    if (cell.element === null) return

    function onMouseClick () {
      let tempLeft = cell.left;
      let tempTop = cell.top;
    
      for (let i = 0; i < cellsArr.length; i++) {
        const cellNull = cellsArr[i];
        if (cellNull.element === null) {
          if ((Math.abs(cell.left - cellNull.left) + Math.abs(cell.top - cellNull.top)) !== 1) return;
          cell.left = cellNull.left;
          cell.top = cellNull.top;
          cellNull.left = tempLeft;
          cellNull.top = tempTop;
          cell.element.style.left = `${cell.left * cellSize}px`;
          cell.element.style.top = `${cell.top * cellSize}px`;
    
          checkVictory(currentFieldSize);
        }
      }
    }

    onMouseDown = function (downEvt) {
      playSound();
      cell.element.addEventListener('click', onMouseClick);

      let shiftX = downEvt.clientX - cell.element.getBoundingClientRect().left;
      let shiftY = downEvt.clientY - cell.element.getBoundingClientRect().top;

      let tempLeft = cell.left;
      let tempTop = cell.top;

      function onMouseMove(upEvt) {
        setTimeout(() => {
          cell.element.removeEventListener('click', onMouseClick);
        }, 100);

        cell.element.style.left = upEvt.pageX - gameField.getBoundingClientRect().left - shiftX + 'px';
        cell.element.style.top = upEvt.pageY - gameField.getBoundingClientRect().top - shiftY + 'px';
        cell.element.classList.remove('animation');
      }
    
      function onMouseUp() { 
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        cell.element.classList.add('animation');

        for (let i = 0; i < cellsArr.length; i++) {
          const cellNull = cellsArr[i];
          if (cellNull.element === null) {
            if ((Math.abs(cellNull.left - cell.left) + Math.abs(cellNull.top - cell.top)) !== 1) {
              cell.element.style.left = `${tempLeft  * cellSize}px`;
              cell.element.style.top = `${tempTop  * cellSize}px`;
              return;
            }

            let xCenterCellNull = cellNull.left * cellSize + (cellSize - CELL_MARGIN)/2;
            let yCenterCellNull = cellNull.top * cellSize + (cellSize - CELL_MARGIN)/2;
            let xCenterActiveCell = parseFloat(cell.element.style.left) + (cellSize - CELL_MARGIN)/2;
            let yCenterActiveCell = parseFloat(cell.element.style.top) + (cellSize - CELL_MARGIN)/2;

            if (Math.abs(xCenterCellNull - xCenterActiveCell) < (cellSize - CELL_MARGIN)/2 && Math.abs(yCenterCellNull - yCenterActiveCell) < (cellSize - CELL_MARGIN)/2) {
              cell.left = cellNull.left;
              cell.top = cellNull.top;
              cellNull.left = tempLeft;
              cellNull.top = tempTop;
              cell.element.style.left = `${cell.left  * cellSize}px`;
              cell.element.style.top = `${cell.top  * cellSize}px`;
              
              checkVictory();
            } else {
              cell.element.style.left = `${tempLeft  * cellSize}px`;
              cell.element.style.top = `${tempTop  * cellSize}px`;
            }
          }
        }
      }
    
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);

      cell.element.ondragstart = function() {
        return false;
      };
    }

    cell.element.addEventListener('mousedown', onMouseDown);
  });
}

function removeListenersForCells () {
  if (!isCellsListenersAdded) return;
  isCellsListenersAdded = !isCellsListenersAdded;

  cellsArr.forEach(cell => {
    if (cell.element === null) return;
    cell.element.removeEventListener('mousedown', onMouseDown);
  });
}

function checkVictory () {
  if (victory) return;
  result = 0;
  movesCounter++;
  movesNumber.textContent = movesCounter;

  rightSolution.forEach((item,index) => {
    if (item.left === index % currentFieldSize && item.top === (index - index % currentFieldSize) / currentFieldSize) {
      result++;
    }
  });

  if (result === currentFieldSize**2) {
    instruction.textContent = `Hooray! You solved this riddle in ${minutes} : ${seconds} and ${movesCounter} moves! Try again?`;
    victory = !victory;
    timeStop = !timeStop;

    if (checkBestScore()) saveBestScore();
  };
}

function getTime () {
  if (timeStop) {
    isTimerRun = false;
    return
  };
  if (timePause) {
    isTimerRun = false;
    return
  };
  isTimerRun = true;
  seconds = (parseInt(seconds) + 1) || 0;

  if (seconds === 60) {
    seconds = 0;
    minutes = parseInt(minutes) + 1;
    if (minutes < 10) minutes = '0' + minutes;
    minutesElement.textContent = minutes;
  }
  
  if (seconds < 10) seconds = '0' + seconds;
  secondsElement.textContent = seconds;

  if (result === 16) return;
  timer = setTimeout(getTime, 1000);
}

function initTimer () {
  seconds = null;
  minutes = '00';
  minutesElement.textContent = minutes;
  timePause = timePause ? !timePause : timePause;
  timeStop = timeStop ? !timeStop : timeStop;
  clearTimeout(timer);
  getTime();
}

function playSound () {
  if (!sound) return;
  if (!audio) return;

  audio.currentTime = 0;
  audio.play();
}

function saveBestScoresList () {
  localStorage.setItem('alexk08_bestScores', JSON.stringify(bestScores));
}

function getBestScoresList () {
  if (localStorage.getItem('alexk08_bestScores')) {
    bestScores = JSON.parse(localStorage.getItem('alexk08_bestScores'));
  }
}

function checkBestScore () {
  return (bestScores[currentFieldSize].length <= 10 || bestScores[currentFieldSize][bestScores[currentFieldSize].length-1].time > (parseInt(minutes)*60 + parseInt(seconds)))
}

function saveBestScore () {
  bestScoreMessage.textContent = `Great! Result is added to the Best Scores List!`;
  bestScores[currentFieldSize].push({
    time: parseInt(minutes)*60 + parseInt(seconds),
    minutes: minutes,
    seconds: seconds,
    moves: movesCounter,
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear()
  });
  bestScores[currentFieldSize].sort((a, b) => a.time - b.time);
  renderScoresList(currentFieldSize);
}

initGame(initFieldSize);
