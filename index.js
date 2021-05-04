import { getBankUrl, formatDateForRequest, EUR, PLN, USD } from './utils';

if (module.hot) {
  module.hot.accept();
}

window.dataStore = {
  currentCurrency: USD,
  currentDate: new Date('2021-04-21T12:00+03:00'),
  isDataLoading: false,
  error: null,
  currenciesByDates: {}, // cache
};

window.renderApp = renderApp;

const setCurrency = function (value) {
  window.dataStore.currentCurrency = value;
  window.renderApp();
};

const setDate = function (value) {
  window.dataStore.currentDate = new Date(value);
  window.renderApp();
};

function isCurrentExchangeRateLoaded(currentCurrency, currentDate) {
  return Boolean(getCachedExchangeRateByDate(currentCurrency, currentDate));
}

function getExchangeRates(currentCurrency, currentDate) {
  const exchangeRateToday = getCachedExchangeRateByDate(currentCurrency, currentDate);

  const yesterday = new Date(currentDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const exchangeRateYesterday = getCachedExchangeRateByDate(currentCurrency, yesterday);

  return [exchangeRateToday, exchangeRateYesterday];
}

function getCachedExchangeRateByDate(currency, date) {
  const ratesByDay = window.dataStore.currenciesByDates[formatDateForRequest(date)];
  if (ratesByDay) {
    return ratesByDay[currency] ? ratesByDay[currency][0]['rate'] : null;
  }
}

function loadData() {
  const { currentCurrency, currentDate } = window.dataStore;
  const url = getBankUrl(currentCurrency, currentDate);

  return fetch(url)
    .then(response => response.json())
    .then(data => ({ data }));
}

function renderApp() {
  document.getElementById('app-root').innerHTML = `
        ${App()}
    `;
}

window.renderApp = renderApp;
window.performDataLoading = performDataLoading;
window.loadData = loadData;

renderApp();

/**
 * @return {string}
 */
function App() {
  return `    
      <div class="container py-4 w-50">
        <header class="pb-3 mb-4 border-bottom">
          <a href="#" class="d-flex align-items-center text-dark text-decoration-none">
            <span class="fs-4">Get your Exchange rate</span>
          </a>
        </header>

        <div class="p-5 mb-4 bg-light rounded-3">${RenderDynamicContent()}</div>
    `;
}

/**
 * @return {string}
 */
function RenderDynamicContent() {
  return `<div class="container py-5 p-5 mb-4 bg-light rounded-3">
  ${ExchangeRateToday()}
  <div class="row align-items-start">
      <div class="col-6">
      ${ChooseCurrency(window.dataStore.currentCurrency, setCurrency)}
      ${ChooseDate(window.dataStore.currentDate, setDate)}
 </div>
</div>`;
}

/**
 * @return {string}
 */
function ExchangeRateToday() {
  const { currentCurrency, currentDate } = window.dataStore;

  if (isCurrentExchangeRateLoaded(currentCurrency, currentDate)) {
    const [exchangeRateToday, exchangeRateYesterday] = getExchangeRates(
      currentCurrency,
      currentDate,
    );
    return displayExchangeRateToday(
      currentCurrency,
      exchangeRateToday,
      currentDate,
      exchangeRateYesterday,
    );
  }

  let currentState = '';
  if (window.dataStore.error !== null) {
    currentState = window.dataStore.error;
  } else if (window.dataStore.isDataLoading) {
    currentState = 'Loading...';
  } else {
    window.performDataLoading(currentCurrency, currentDate);
  }

  return `
  <h1 class="display-5 fw-bold">
      ${currentState}      
  </h1>
  `;
}

function displayExchangeRateToday(currency, exchangeRateToday, date, exchangeRateYesterday) {
  const rateDifference =
    exchangeRateToday && exchangeRateYesterday
      ? (exchangeRateToday - exchangeRateYesterday).toFixed(2)
      : null;

  const exchangeRate = exchangeRateToday || 'Not Available';

  const dateString = date.toLocaleDateString();

  let rateDifferenceStr = '';
  if (rateDifference) {
    const differenceStyle = rateDifference > 0 ? 'success' : 'danger';
    const sign = rateDifference > 0 ? '+' : '';
    rateDifferenceStr = `<span class="text-${differenceStyle} fs-3">${sign}${rateDifference}</span>`;
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
  `;
}

function performDataLoading(currency, date) {
  window.dataStore.error = null;
  window.dataStore.isDataLoading = true;

  window
    .loadData()
    .then(({ error, data }) => {
      window.dataStore.isDataLoading = false;
      if (error) {
        window.dataStore.error = error;
      } else if (data) {
        const dateStr = formatDateForRequest(date);

        if (!(dateStr in window.dataStore.currenciesByDates)) {
          window.dataStore.currenciesByDates[dateStr] = {};
        }
        window.dataStore.currenciesByDates[dateStr][currency] = data;
      }
    })
    .catch(error => {
      window.dataStore.error = 'Some error occurred.';
    })
    .finally(window.renderApp);
}

/**
 * @return {string}
 */
function ChooseCurrency(currentCurrency, setCurrencyCB) {
  const currencies = [{ value: USD }, { value: EUR }, { value: PLN }];
  let content = `
    <label for="id_select">Choose currency:</label>
    <select id="id_select" class="form-select" 
    autofocus="true" onchange="(${setCurrencyCB})(this.value);">
  `;

  content += currencies
    .map(({ value }) => {
      const selected = currentCurrency === value ? 'selected' : '';
      return `<option value="${value}" ${selected}>${value}</option>`;
    })
    .join('');
  content += `</select>`;
  return content;
}

/**
 * @return {string}
 */
function ChooseDate(currentDate, setDateCB) {
  // get date in `yyyy-mm-dd` format
  const dateStr = currentDate.toISOString().split('T')[0];

  return `
    <div class="mt-3">
        <label for="dateInput" class="form-label">Choose date:</label>
        <input type="date"
               value="${dateStr}"
               onchange="(${setDateCB})(this.value);"
               class="form-control"
               id="dateInput">
    </div>
`;
}
