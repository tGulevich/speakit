const START_SCREEN = document.querySelector('.start-screen');
const START_BUTTON = document.querySelector('.start-screen__btn');
const MAIN = document.querySelector('.container');
const IMAGE = document.querySelector('.word-image');
const TRANSLATION = document.querySelector('.translate');
const SPEAK_BTN = document.querySelector('.speak__btn');
const RECOGNITION_INPUT = document.querySelector('.recognition');
const RATING = document.querySelector('.rating');
const RESULTS = document.querySelector('.results');
const RESULTS__BTN = document.querySelector('.results__btn');
const CORRECT = document.querySelector('.correct__list');
const CORRECT_NUMBER = document.querySelector('.correct__num');
const ERROR = document.querySelector('.error__list');
const ERROR_NUMBER = document.querySelector('.error__num');
const RETURN__BTN = document.querySelector('.return__btn');
const NEW_GAME__BTN = document.querySelector('.new-game__btn');
const RESTART__BTN = document.querySelector('.restart__btn');
const LEVELS = document.querySelector('.levels');
const LOAD_INFO = document.querySelector('.load-info');
const WORDS_AREA = document.querySelector('.words');
const BUTTONS_AREA = document.querySelector('.buttons');
const STATISTIC = document.querySelector('.statistic');
const STATISTIC_LIST = document.querySelector('.statistic__list');
const STATISTIC_BTN = document.querySelector('.statistic__show');
const STATISTIC_СLOSE = document.querySelector('.statistic__btn');

let stop = false;
let game = false;
let level = 0;

window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
recognition.interimResults = false;

let listener = () => {
  recognition.start();
}

const getWords = async (group) => {
  let wordsCat = [];
    for (let page = 0; page < 30; page++) {
      const url = `https://afternoon-falls-25894.herokuapp.com/words?page=${page}&group=${group}`;
      const res = await fetch(url);
      const json = await res.json();
      wordsCat = wordsCat.concat(json);
    }
  return wordsCat;
};  

const getTranslation = async (word) => {
  const url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20200425T192830Z.51d8a4ea321bde09.ccb165d3f8674943b55c07a4fb455d7f912dfa3f&text=${word}&lang=en-ru`;
  const res = await fetch(url)
  return await res.json();
}

window.onload = () => {
  START_BUTTON.addEventListener('click', () =>  {
    START_SCREEN.style.display = 'none';
    MAIN.style.display = 'flex';
    renderWords(level);
    MAIN.addEventListener('click', train);
    LEVELS.addEventListener('click', changeLevel);
    SPEAK_BTN.addEventListener('click', () => {
      if (game) {
        turnOnRecognition();
      } else {
        startGame();
      }
    });
    RESULTS__BTN.addEventListener('click', showResults);
    RETURN__BTN.addEventListener('click', () => {
      RESULTS.style.display = 'none';
    });
    NEW_GAME__BTN.addEventListener('click', startNewGame);
    RESTART__BTN.addEventListener('click', restartGame);
    STATISTIC_BTN.addEventListener('click', showStatistic);
    STATISTIC_СLOSE.addEventListener('click', () => {
      STATISTIC.style.display = 'none';
    })
  });
};
function turnOnRecognition () {
  recognition.start();
  recognition.addEventListener('end', listener, false);
  MAIN.removeEventListener('click', train);
  
  document.querySelectorAll('.words__item').forEach(el => el.classList.add('words__item--play'));
  TRANSLATION.style.display = 'none';
  RECOGNITION_INPUT.style.display = 'block';
}

function turnOffRecognition() {
  recognition.stop();
  recognition.removeEventListener('end', listener, false);
}

function startGame () {
  game = true;
  //Style mode
  document.querySelectorAll('.words__item').forEach(el => el.classList.add('words__item--play'));
  TRANSLATION.style.display = 'none';
  RECOGNITION_INPUT.style.display = 'block';

  recognition.addEventListener('result', (evt) => {
    const transcript = Array.from(evt.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');
    RECOGNITION_INPUT.textContent = transcript;
    const WORDS = document.querySelectorAll('.word');
    WORDS.forEach(el => {
      
      if (transcript.toLowerCase() === el.textContent.toLowerCase() && !el.parentNode.classList.contains('words__item--quessed')) {
        IMAGE.src = 'https://raw.githubusercontent.com/tgulevich/rslang-data/master/data/' + el.parentNode.dataset.imgSrc;
        el.parentElement.classList.add('words__item--quessed');

        const successIcon = document.createElement('span');
        successIcon.classList.add('rating__point');
        RATING.append(successIcon);

        if (document.querySelectorAll('.rating__point').length === 10) {
          showResults();
        }
      }
    });
  });
  turnOnRecognition();
};

function showResults() {
  RESULTS.style.display = 'block';
  turnOffRecognition();

  // Clean
  CORRECT_NUMBER.textContent = 0;
  ERROR_NUMBER.textContent = 0;

  while (CORRECT.firstChild) {
    CORRECT.removeChild(CORRECT.firstChild);
  }
  while (ERROR.firstChild) {
    ERROR.removeChild(ERROR.firstChild);
  }

  // Create
  const WORDS = document.querySelectorAll('.words__item');
  WORDS.forEach(el => {
    if (el.classList.contains('words__item--quessed')) {
      const listItem = document.createElement('li');
      listItem.dataset.audioSrc = el.dataset.audioSrc;
      listItem.textContent = el.querySelector('.word').textContent + ' ' + el.querySelector('.transcription').textContent + ' ' + el.dataset.translation;
      CORRECT.append(listItem);
      CORRECT_NUMBER.textContent = Number(CORRECT_NUMBER.textContent) + 1;
    } else {
      const listItem = document.createElement('li');
      listItem.dataset.audioSrc = el.dataset.audioSrc;
      listItem.textContent = el.querySelector('.word').textContent + ' ' + el.querySelector('.transcription').textContent + ' ' + el.dataset.translation;
      ERROR.append(listItem);
      ERROR_NUMBER.textContent = Number(ERROR_NUMBER.textContent) + 1;
    }
  });

  // Add to statistic
  let date = new Date().toString();
  date = date.replace(date.match(/GMT.+/)[0], '');
  const resultGame = `Corret: ${CORRECT_NUMBER.textContent}, Error: ${ERROR_NUMBER.textContent}`;
  statisticItem = date + '  -  ' + resultGame;

  if (localStorage.getItem('statistic') !== 'undefined') {
    let stat = JSON.parse(localStorage.getItem('statistic')) || [];
    stat.push(statisticItem);
    localStorage.setItem('statistic', JSON.stringify(stat));
  } else {
    let stat = [];
    stat.push(statisticItem);
    localStorage.setItem('statistic', JSON.stringify(stat));
  }
};

function startNewGame () {
  turnOffRecognition();
  RECOGNITION_INPUT.textContent = '';
  RESULTS.style.display = 'none';
  document.querySelectorAll('.words__item').forEach(el => {
    if (el.classList.contains('words__item--quessed')) {
      el.classList.remove('words__item--quessed');
    }
  });
  while (RATING.firstChild) {
    RATING.removeChild(RATING.firstChild);
  }

  renderWords(level);
  turnOnRecognition();
};

const renderWords = async (lvl) => {
  renderLoader();

  await getWords(lvl).then((data) => {
    data = shuffle(data);
    const words = MAIN.querySelectorAll('.words__item');
    words.forEach((el, i) => {
      const word = el.querySelector('.word');
      word.textContent = data[i].word;

      const transcription = el.querySelector('.transcription');
      transcription.textContent = data[i].transcription;

      el.dataset.audioSrc = data[i].audio.slice(6);
      el.dataset.imgSrc = data[i].image.slice(6);

      getTranslation(data[i].word).then(res => {
        el.dataset.translation = res.text.join('');
      });
    });
  });
  clearLoader();
}

RESULTS.addEventListener('click', (evt) => {
  if (evt.target.tagName === 'LI') {
    const audio = new Audio('https://raw.githubusercontent.com/tgulevich/rslang-data/master/data/' + evt.target.dataset.audioSrc);
    console.log('play');
    audio.play();
  }
});

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
};

function train (evt) {
  let item = evt.target.closest('.words__item');
  if (item) {
    IMAGE.src = 'https://raw.githubusercontent.com/tgulevich/rslang-data/master/data/' + item.dataset.imgSrc;
    const audio = new Audio('https://raw.githubusercontent.com/tgulevich/rslang-data/master/data/' + item.dataset.audioSrc);
    audio.play();
    TRANSLATION.textContent = item.dataset.translation;
  }
};

function restartGame() {
  stop = true;
  RECOGNITION_INPUT.textContent = '';
  document.querySelectorAll('.words__item').forEach(el => {
    if (el.classList.contains('words__item--quessed')) {
      el.classList.remove('words__item--quessed');
    }
  });
  while (RATING.firstChild) {
    RATING.removeChild(RATING.firstChild);
  }
  turnOffRecognition();
};

function changeLevel (evt) {
  turnOffRecognition();
  if (evt.target.classList.contains('levels__btn')) {
    level = Number(evt.target.textContent) - 1;
    document.querySelectorAll('.levels__btn').forEach(el => {
      if (el.classList.contains('levels__btn--active')) {
        el.classList.remove('levels__btn--active');
      }
    });
  
    evt.target.classList.add('levels__btn--active');

    renderWords(level);
    MAIN.addEventListener('click', train);

    // Style mode
    document.querySelectorAll('.words__item').forEach(el => el.classList.remove('words__item--play'));
    TRANSLATION.style.display = 'block';
    RECOGNITION_INPUT.style.display = 'none';
    clearStyles();
  }
};

function clearStyles() {
  RECOGNITION_INPUT.textContent = '';
  document.querySelectorAll('.words__item').forEach(el => {
    if (el.classList.contains('words__item--quessed')) {
      el.classList.remove('words__item--quessed');
    }
  });
  while (RATING.firstChild) {
    RATING.removeChild(RATING.firstChild);
  }
}

const renderLoader = () => {
  const loader = `
      <div class="loader">
          <svg>
              <use href="src/img/sprite.svg#icon-cw"></use>
          </svg>
      </div>
  `;
  LOAD_INFO.insertAdjacentHTML('afterbegin', loader);
  WORDS_AREA.style.display = 'none';
  BUTTONS_AREA.style.display = 'none';
};

const clearLoader = () => {
  const loader = document.querySelector('.loader');
  if (loader) loader.parentElement.removeChild(loader);
  WORDS_AREA.style.display = 'block';
  BUTTONS_AREA.style.display = 'grid';
};

const showStatistic = () => {
  STATISTIC.style.display = 'block';

  while (STATISTIC_LIST.firstChild) {
    STATISTIC_LIST.removeChild(STATISTIC_LIST.firstChild);
  }

  let stat = JSON.parse(localStorage.getItem('statistic')) || [];
  stat.forEach(el => {
    const statisticElement = document.createElement('li');
    statisticElement.textContent = el;
    STATISTIC_LIST.append(statisticElement);
  });
}