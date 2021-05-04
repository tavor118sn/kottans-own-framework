// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"utils.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatDateForRequest = formatDateForRequest;
exports.getBankUrl = getBankUrl;
exports.PLN = exports.USD = exports.EUR = void 0;
const EUR = 'EUR';
exports.EUR = EUR;
const USD = 'USD';
exports.USD = USD;
const PLN = 'PLN';
exports.PLN = PLN;

function formatDateForRequest(date) {
  // 02-03-2020 will be like `20200302`
  // from https://stackoverflow.com/a/3067896/10849913
  const mm = date.getMonth() + 1; // getMonth() is zero-based

  const dd = date.getDate();
  return [date.getFullYear(), (mm > 9 ? '' : '0') + mm, (dd > 9 ? '' : '0') + dd].join('');
}

function getBankUrl(currency, date) {
  const dateStr = formatDateForRequest(date);
  return `https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?valcode=${currency}&date=${dateStr}&json`;
}
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _utils = require("./utils");

if (module.hot) {
  module.hot.accept();
}

window.dataStore = {
  currentCurrency: _utils.USD,
  currentDate: new Date('2021-04-21T12:00+03:00'),
  isDataLoading: false,
  error: null,
  currenciesByDates: {} // cache

};
window.renderApp = renderApp;

const setCurrency = function setCurrency(value) {
  window.dataStore.currentCurrency = value;
  window.renderApp();
};

const setDate = function setDate(value) {
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
  const ratesByDay = window.dataStore.currenciesByDates[(0, _utils.formatDateForRequest)(date)];

  if (ratesByDay) {
    return ratesByDay[currency] ? ratesByDay[currency][0]['rate'] : null;
  }
}

function loadData() {
  const {
    currentCurrency,
    currentDate
  } = window.dataStore;
  const url = (0, _utils.getBankUrl)(currentCurrency, currentDate);
  return fetch(url).then(response => response.json()).then(data => ({
    data
  }));
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
  const {
    currentCurrency,
    currentDate
  } = window.dataStore;

  if (isCurrentExchangeRateLoaded(currentCurrency, currentDate)) {
    const [exchangeRateToday, exchangeRateYesterday] = getExchangeRates(currentCurrency, currentDate);
    return displayExchangeRateToday(currentCurrency, exchangeRateToday, currentDate, exchangeRateYesterday);
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
  const rateDifference = exchangeRateToday && exchangeRateYesterday ? (exchangeRateToday - exchangeRateYesterday).toFixed(2) : null;
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
  window.loadData().then(({
    error,
    data
  }) => {
    window.dataStore.isDataLoading = false;

    if (error) {
      window.dataStore.error = error;
    } else if (data) {
      const dateStr = (0, _utils.formatDateForRequest)(date);

      if (!(dateStr in window.dataStore.currenciesByDates)) {
        window.dataStore.currenciesByDates[dateStr] = {};
      }

      window.dataStore.currenciesByDates[dateStr][currency] = data;
    }
  }).catch(error => {
    window.dataStore.error = 'Some error occurred.';
  }).finally(window.renderApp);
}
/**
 * @return {string}
 */


function ChooseCurrency(currentCurrency, setCurrencyCB) {
  const currencies = [{
    value: _utils.USD
  }, {
    value: _utils.EUR
  }, {
    value: _utils.PLN
  }];
  let content = `
    <label for="id_select">Choose currency:</label>
    <select id="id_select" class="form-select" 
    autofocus="true" onchange="(${setCurrencyCB})(this.value);">
  `;
  content += currencies.map(({
    value
  }) => {
    const selected = currentCurrency === value ? 'selected' : '';
    return `<option value="${value}" ${selected}>${value}</option>`;
  }).join('');
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
},{"./utils":"utils.js"}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "43851" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else {
        window.location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/kottans-own-framework.e31bb0bc.js.map