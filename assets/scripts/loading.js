import { date } from './util.js';

const todayDate = document.querySelector('.today-date');
const noContent = document.querySelector('.no-content');

noContent.style.display = 'flex';

const currentTime = new Date();
const formattedDate = date(currentTime, 'month _d, yyyy');
const dateTime = date(currentTime, 'yyyy-mm-dd');

todayDate.innerText = formattedDate;
todayDate.setAttribute('datetime', dateTime);
