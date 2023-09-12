activeTransanctionProfit = 0;
hCatogeries = [];
hNetProfit = [];
hProfit = [];
hBuyPrice = [];
hSellPrice = [];

// Updates UI with current date time for reference
function doDate() {
  let str = '';
  const days = new Array('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
  const months = new Array(
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  );
  const now = new Date();
  const test = now.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
  str += `${days[now.getDay()]}, ${now.getDate()} ${
    months[now.getMonth()]
  } ${now.getFullYear()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
  document.getElementById('todaysDate').innerHTML = test;
}

// Returns today date
function todayDate() {
  let date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;
  let today = year + '-' + month + '-' + day;
  return today;
}

// Create tablular transaction information of each trade taken on the selected date
function createTradesTableFromObjects(data) {
  const table = document.createElement('table');
  const headerRow = document.createElement('tr');
  headerRow.setAttribute('id', 'table-header');

  if (data.length > 0) {
    // Create table header row
    const keys = Object.keys(data[0]);


    for (const key of keys) {
      const headerCell = document.createElement('th');

      headerCell.textContent = key;
      if (
        key !== 'userId' &&
        key !== 'expiryDate' &&
        key !== 'active' &&
        key !== 'preStart' &&
        key !== 'currentPrice' &&
        key !== 'id'
      ) {
        headerRow.appendChild(headerCell);
      }
    }
    table.appendChild(headerRow);

    // Create table data rows
    for (const obj of data) {
      const isActive = obj['active'] === true;
      const dataRow = document.createElement('tr');
      for (const key of keys) {
        const dataCell = document.createElement('td');
        dataCell.textContent = obj[key];
        const list = dataCell.classList;
        if (key === 'profit') {
          list.add(obj[key] > 0 ? 'green' : 'red');
          list.add('align-right');
          dataCell.textContent = obj[key].toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            style: 'currency',
            currency: 'INR',
          });
        } else if (key === 'capital') {
          dataCell.textContent = obj[key].toFixed(2);
          if (isActive) {
            list.add('yellow');
          }
        } else {
          if (isActive && key !== 'profit') {
            list.add('yellow');
          }
        }

        if (
          key !== 'userId' &&
          key !== 'expiryDate' &&
          key !== 'active' &&
          key !== 'preStart' &&
          key !== 'currentPrice' &&
          key !== 'id'
        ) {
          dataRow.appendChild(dataCell);
        }
      }
      table.appendChild(dataRow);
    }
  } else {
  }
  return table;
}

// Update Application UI information
function updateApplicationWithData() {
  let totalProfit = 0;
  let noOfProfitTrades = 0;
  let noOfLossTrades = 0;
  let totalProfitOnTrades = 0;
  let totalLossOnTrades = 0;
  for (let index = 0; index < transactions.length; index++) {
    const transaction = transactions[index];
    if (transaction.profit > 0) {
      noOfProfitTrades += 1;
      totalProfitOnTrades += transaction.profit;
    } else {
      noOfLossTrades += 1;
      totalLossOnTrades += transaction.profit;
    }
    totalProfit += transaction.profit;
  }
  totalProfit += activeTransanctionProfit;

  const totalTradeStr = `${transactions.length}`;
  document.getElementById('totalTrades').innerHTML = totalTradeStr;

  const noOfProfitTradesStr = `${noOfProfitTrades}`;
  document.getElementById('noOfProfitTrades').innerHTML = noOfProfitTradesStr;

  const noOfLossTradesStr = `${noOfLossTrades}`;
  document.getElementById('noOfLossTrades').innerHTML = noOfLossTradesStr;

  const netProfit = totalProfit - 300 * transactions.length;
  const netProfitStr = netProfit.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'INR',
  });
  const netProfitCell = document.getElementById('netProfit');
  netProfitCell.innerHTML = netProfitStr;
  const list = netProfitCell.classList;
  list.value = '';
  list.add(netProfit > 0 ? 'green' : 'red');
  list.add('align-right');
  list.add('height-20px');

  const totalProfitStr = parseFloat(totalProfit.toFixed(2), 10).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'INR',
  });
  document.getElementById('totalProfit').innerHTML = totalProfitStr;

  const totalProfitOnTradesStr = totalProfitOnTrades.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'INR',
  });
  document.getElementById('totalProfitOnTrades').innerHTML = totalProfitOnTradesStr;

  const totalLossOnTradesStr = totalLossOnTrades.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'INR',
  });
  document.getElementById('totalLossOnTrades').innerHTML = totalLossOnTradesStr;

  const totalBrokerageStr = (300 * transactions.length).toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    style: 'currency',
    currency: 'INR',
  });
  document.getElementById('totalBrokerage').innerHTML = totalBrokerageStr;
}

// Update User Seetings in the application ui
function updateUserSettings() {
  if (userSettings.length > 0) {
    const userSettingsForApp = userSettings[0];
    const capitalStr = userSettingsForApp.capital;
    document.getElementById('capital-input').value = capitalStr;
    const trailingStopLossStr = ((userSettingsForApp.trailingSLConstant * userSettingsForApp.capital) / 100).toFixed(0);
    document.getElementById('trailingStopLoss-input').value = trailingStopLossStr;
    const accountStr = userSettingsForApp.account;
    document.getElementById('account-input').value = accountStr;
    const automation = userSettingsForApp.auto;
    document.getElementById('start-automation').checked = automation;
  }
}

function updateOptionScripts() {
  if (optionScripts.length > 0) {
    const ceTradingSymbol = optionScripts[0].tradingsymbol;
    const peTradingSymbol = optionScripts[1].tradingsymbol;

    document.getElementById('ceTradingSymbol-input').value = ceTradingSymbol;
    document.getElementById('peTradingSymbol-input').value = peTradingSymbol;
  }
}
function showLoading(show) {
  if (show) {
    if (document.getElementById('app-loading')) {
      document.getElementById('app-loading').style.display = 'block';
    }
  } else {
    if (document.getElementById('app-loading')) {
      document.getElementById('app-loading').style.display = 'none';
    }
  }
}
// Get all the transactions for the selected trade date
function getAllTransactions() {
  const dateControl = document.querySelector('input[type="date"]');
  const selectedTradeDate = dateControl.value;
  let todaysDate = todayDate();
  const tradeDate = selectedTradeDate ? selectedTradeDate : todaysDate;
  console.log(`Selected Trade Date :: ${tradeDate}`);

  fetch(`http://localhost:3001/v1/transactions?limit=1000&sortBy=createdAt:desc`) // &tradeDate=${tradeDate}`)
    .then((response) => response.json())
    .then((data) => {
      const tableContainer = window.document.getElementById('trade-table-container');
      tableContainer.innerHTML = '';
      transactions = data.results;
      updateApplicationWithData();
      const table = createTradesTableFromObjects(transactions);
      // const tableContainer = window.document.getElementById('trade-table-container');
      tableContainer.innerHTML = '';
      tableContainer.appendChild(table);
      showHighcharts();
      showLoading(false);
    });
}

// Get all the transactions for the selected trade date
function getAllActiveTransactions() {
  const dateControl = document.querySelector('input[type="date"]');
  const selectedTradeDate = dateControl.value;
  let todaysDate = todayDate();
  const tradeDate = selectedTradeDate ? selectedTradeDate : todaysDate;
  console.log(`Selected Trade Date :: ${tradeDate}`);

  fetch(`http://localhost:3001/v1/transactions?limit=10&sortBy=createdAt:desc&active=true`) // &tradeDate=${tradeDate}`)
    .then((response) => response.json())
    .then((data) => {
      const activeTableContainer = window.document.getElementById('active-trade-table-container');
      activeTableContainer.innerHTML = '';

      hCatogeries = [];
      hProfit = [];
      hNetProfit = [];
      let i = 0;
      let profit = 0;
      let netprofit = 0;
      const hTransactions = transactions.reverse();

      for( const transaction of hTransactions) {
        const cellProfit = transaction.profit;
        netprofit += cellProfit-300;
        profit += cellProfit;
        hProfit.push(profit);
        hNetProfit.push(netprofit);
        i++;
        hCatogeries.push(i);
      }

      activeTransactions = data.results;
      if (activeTransactions.length > 0) {
        activeTransanctionProfit = activeTransactions[0].profit;

        netprofit += activeTransanctionProfit-300;
        profit += activeTransanctionProfit;
        hProfit.push(profit);
        hNetProfit.push(netprofit);
        i++;
        hCatogeries.push(i);

      }
      const table = createTradesTableFromObjects(activeTransactions);
      // const tableContainer = window.document.getElementById('active-trade-table-container');
      activeTableContainer.innerHTML = '';
      activeTableContainer.appendChild(table);



    });
}

// Get all the user settings
function getAllUserSettings() {
  fetch(`http://localhost:3001/v1/settings`)
    .then((response) => response.json())
    .then((data) => {
      userSettings = data.results;
      updateUserSettings();
    });
}

// Get all the option Script
function getAllOptionScripts() {
  fetch(`http://localhost:3001/v1/optionscripts`)
    .then((response) => response.json())
    .then((data) => {
      optionScripts = data.results;
      updateOptionScripts();
    });
}

// Update the user settings
async function patchUserSettings(data) {
  showLoading(true);
  const settingsId = data.id;
  const settings = {
    account: data.account,
    capital: data.capital,
    trailingSLConstant: data.trailingSLConstant,
  };
  const requestOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  };
  fetch(`http://localhost:3001/v1/settings/${settingsId}`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      showLoading(false);
    });
}

// Update the user settings
async function patchUserSettingsAutomation(data) {
  showLoading(true);
  const settingsId = data.id;
  const settings = {
    auto: data.auto,
  };
  const requestOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  };
  fetch(`http://localhost:3001/v1/settings/${settingsId}`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      showLoading(false);
    });
}

// Update the user settings
async function patchOptionScripts(data) {
  const optionScriptId = data.id;
  const optionScript = {
    tradingsymbol: data.tradingsymbol,
  };
  const requestOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(optionScript),
  };
  fetch(`http://localhost:3001/v1/optionscripts/${optionScriptId}`, requestOptions)
    .then((response) => response.json())
    .then((data) => {});
}

let transactions = [];
let userSettings = [];
let optionScripts = [];
// Setting Todays Date to Trade Date
let timeoutID = setTimeout(() => {
  const dateControl = document.querySelector('input[type="date"]');
  dateControl.value = todayDate();
  dateControl.onchange = () => {
    showLoading(true);
    activeTransanctionProfit = 0;
    getAllTransactions();
  };
  const saveButton = document.getElementById('save-button');
  saveButton.addEventListener('click', saveUserSettingsAndOptionScripts, false);

  const automationCheckbox = document.getElementById('start-automation');
  automationCheckbox.addEventListener('change', startAutomation, false);

  clearTimeout(timeoutID);
}, 3001);

function showHighcharts() {
  // Data retrieved https://en.wikipedia.org/wiki/List_of_cities_by_average_temperature
  Highcharts.chart('container', {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Net Profit',
    },
    subtitle: {
      text:
        'Total Profit / Loss + Transaction Fees',
    },
    xAxis: {
      categories: hCatogeries,
    },
    yAxis: {
      title: {
        text: 'Profit (₹)',
      },
    },
    plotOptions: {
      line: {
        dataLabels: {
          enabled: true,
        },
        enableMouseTracking: false,
      },
    },
    series: [
      {
        name: 'Net Profit',
        data: hNetProfit,
      },
      {
        name: 'Profit',
        data: hProfit,
      },
      // {
      //   name: 'Buy Price',
      //   data: [-2.9, -3.6, -0.6, 4.8, 10.2, 14.5, 17.6, 16.5, 12.0, 6.5, 2.0, -0.9],
      // },
      // {
      //   name: 'Sell Price',
      //   data: [-.9, -.6, -0.6, 4.8, 1.2, 14.5, 1.6, 16, 12.0, 6, 2.0, -0.9],
      // },
    ],
  });
}

function startAutomation(event) {
  const isChecked = event.currentTarget.checked;
  const userSettingsForApp = userSettings[0];
  userSettingsForApp.auto = isChecked;
  patchUserSettingsAutomation(userSettingsForApp);
}

function saveUserSettingsAndOptionScripts() {
  if (optionScripts && optionScripts.length === 2) {
    const ceOptionScriptsForApp = optionScripts[0];
    const peOptionScriptsForApp = optionScripts[1];
    const ceTradingSymbolInput = document.getElementById('ceTradingSymbol-input').value;
    const peTradingSymbolInput = document.getElementById('peTradingSymbol-input').value;
    ceOptionScriptsForApp.tradingsymbol = ceTradingSymbolInput;
    patchOptionScripts(ceOptionScriptsForApp);
    peOptionScriptsForApp.tradingsymbol = peTradingSymbolInput;
    patchOptionScripts(peOptionScriptsForApp);
  }
  if (userSettings && userSettings.length > 0) {
    const userSettingsForApp = userSettings[0];
    const capital = document.getElementById('capital-input').value;
    const stopLoss = document.getElementById('trailingStopLoss-input').value;
    const trailingSLConstant = ((stopLoss / capital) * 100).toFixed(3);
    const account = document.getElementById('account-input').value;

    userSettingsForApp.capital = capital;
    userSettingsForApp.trailingSLConstant = trailingSLConstant;
    userSettingsForApp.account = account;
    patchUserSettings(userSettingsForApp);
  }
}

// window.onscroll = function () { updateStickyHeader() };
// Add event listener to table

setInterval(doDate, 1000);
showLoading(true);
setInterval(getAllTransactions, 5000);
setInterval(getAllActiveTransactions, 5000);
getAllUserSettings();
getAllOptionScripts();
