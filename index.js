import {currencyByDate} from './fixtures';

import {EUR, formatDateForRequest, PLN, USD,} from './utils';

if (module.hot) {
  module.hot.accept();
}

window.dataStore = {
  currentCurrency: USD,
  currentDate: new Date('April 21, 21'),
};

window.renderApp = renderApp;

const setCurrency = function (value) {
  window.dataStore.currentCurrency = value;
  window.renderApp();
};

renderApp();

function renderApp() {
  document.getElementById('app-root').innerHTML = `
        ${app()}
    `;
}


function app() {
  return `<div class="container py-5" class="p-5 mb-4 bg-light rounded-3">
  ${exchangeRateToday()}
  <div class="row align-items-start">
      <div class="col-6">
      ${chooseCurrency(window.dataStore.currentCurrency, setCurrency)}
      ${chooseDate()}
 </div>
</div>`;
}


function exchangeRateToday() {
  const {currentCurrency, currentDate} = window.dataStore;

  const ratesForToday = currencyByDate[formatDateForRequest(currentDate)];
  const exchangeRateToday = (
    ratesForToday ? ratesForToday[currentCurrency][0]["rate"] : null
  );

  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);

  const ratesForYesterday = currencyByDate[formatDateForRequest(yesterday)];
  const exchangeRateYesterday = (
    ratesForYesterday ? ratesForYesterday[currentCurrency][0]["rate"] : null
  );

  const rateDifference = (
    exchangeRateToday && exchangeRateYesterday
      ? (exchangeRateToday - exchangeRateYesterday).toFixed(2) : null
  );

  return displayExchangeRateToday(
    currentCurrency, exchangeRateToday, currentDate, rateDifference
  );
}


function displayExchangeRateToday(currency, exchangeRate, date, rateDifference) {
  exchangeRate = exchangeRate || 'Not Available';

  const dateString = date.toLocaleDateString();

  let rateDifferenceStr = '';
  if (rateDifference) {
    const differenceStyle = rateDifference > 0 ? 'success' : 'danger';
    const sign = rateDifference > 0 ? '+' : '';
    rateDifferenceStr = (
      `<span class="text-${differenceStyle} fs-3">${sign}${rateDifference}</span>`
    );
  }

  return `
  <h1 class="display-5 fw-bold">
      <span class="text-secondary">${currency}:</span>
      ${exchangeRate}
      ${rateDifferenceStr}      
  </h1>
    <p class="text-secondary">
      Rate for ${dateString}
  </p> 
  `
}


function chooseCurrency(currentCurrency, setCurrencyCB) {
  const currencies = [
    {value: USD},
    {value: EUR},
    {value: PLN},
  ];
  let content = `
    <label for="id_select">Choose currency:</label>
    <select id="id_select" class="form-select" 
    autofocus="true" onchange="(${setCurrencyCB})(this.value);">
  `;

  content += currencies.map(({value}) => {
    const selected = currentCurrency === value ? 'selected' : '';
    return `<option value="${value}" ${selected}>${value}</option>`;
  }).join('');
  content += `</select>`;
  return content
}


function chooseDate() {
  const currentDate = window.dataStore.currentDate;
  // get date in `yyyy-mm-dd` format
  const dateStr = currentDate.toISOString().split('T')[0];

  return `
    <div class="mt-3">
        <label for="dateInput" class="form-label">Choose date:</label>
        <input type="date"
               value="${dateStr}"
               onchange="window.dataStore.currentDate = new Date(this.value); 
                window.renderApp();"
               class="form-control"
               id="dateInput">
    </div>
`;
}
