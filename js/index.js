serverHostAndPort = 'http://localhost:3001';
transactionsForAnalysis = null;
activeTransanctionProfit = 0;
hCatogeries = [];
hNetProfit = [];
hProfit = [];
hBuyPrice = [];
hSellPrice = [];
hNetProfitAmount = 0;
hTransactions = [];
// Updates UI with current date time for reference
function updateCurrentDateAndTime() {
  const now = new Date();
  const test = now.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
  // console.log(test.split(',')[0]);
  document.getElementById('todaysDate').innerHTML = test;
}

// Returns today date
function todayDate() {
  const date = new Date();

  let day = date.getDate();
  let month = date.getMonth() + 1;
  const year = date.getFullYear();
  if (month < 10) month = `0${month}`;
  if (day < 10) day = `0${day}`;
  const today = `${year}-${month}-${day}`;
  return today;
}

// Returns today date
function todaysTradeDate(selectedTradeDate) {
  const now = new Date();
  const indiaDateTime = now.toLocaleString(undefined, { timeZone: 'Asia/Kolkata' });
  let today = indiaDateTime.split(',')[0];
  if (!!selectedTradeDate) {
    // debugger
    const localDateArray = selectedTradeDate.split('-');
    today = `${localDateArray[1]}/${localDateArray[2]}/${localDateArray[0]}`;
  }
  return today;
}

// Create tablular transaction information of each trade taken on the selected date
function createTradesTableFromObjects(data, isActive) {
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
        key !== 'id' &&
        key !== 'lowestPrice'
      ) {
        headerRow.appendChild(headerCell);
      }
    }
    if (!isActive) {
      const headerCell = document.createElement('th');
      headerCell.textContent = 'netProfit';
      headerRow.appendChild(headerCell);
    }

    const cheaderCell = document.createElement('th');
    cheaderCell.textContent = 'Chart';
    headerRow.appendChild(cheaderCell);

    table.appendChild(headerRow);

    let cumProfit = 0;
    const totalProfitOnTrades = hNetProfitAmount;
    // Create table data rows
    let i = 0;
    for (const obj of data) {
      cumProfit += obj.profit;
      const isActive = obj.active === true;
      const dataRow = document.createElement('tr');
      for (const key of keys) {
        const dataCell = document.createElement('td');
        dataCell.textContent = obj[key];
        const list = dataCell.classList;
        if (key === 'profit') {
          // list.add(obj[key] > 0 ? 'green' : 'red');
          list.add(obj.profit > 0 ? 'green' : Math.floor(obj.boughtPrice) === Math.floor(obj.highestPrice) ? 'cyan' : 'red');

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
        } else if (isActive && key !== 'profit') {
          list.add('yellow');
        }
        list.add(obj.profit > 0 ? 'green' : 'red');

        if (
          key !== 'userId' &&
          key !== 'expiryDate' &&
          key !== 'active' &&
          key !== 'preStart' &&
          key !== 'currentPrice' &&
          key !== 'id' &&
          key !== 'lowestPrice'
        ) {
          dataRow.appendChild(dataCell);
        }
      }
      if (!isActive) {
        cumProfit = obj.profit - 300;
        const dataCell = document.createElement('td');
        dataCell.textContent = cumProfit.toLocaleString('en-IN', {
          maximumFractionDigits: 2,
          style: 'currency',
          currency: 'INR',
        });
        const list = dataCell.classList;
        list.add(obj.profit > 0 ? 'green' : 'red');
        list.add('bold');
        list.add('align-right');
        dataRow.appendChild(dataCell);

        const cDataCell = document.createElement('td');
        cDataCell.textContent = 'Price ↑ ↓';
        const clist = cDataCell.classList;
        clist.add('antiquewhite');
        clist.add('bold');
        clist.add('align-right');
        cDataCell.onclick = function (e) {
          e = e || window.event;
          var target = e.target || e.srcElement;
          const index = target.getAttribute('index');
          const transaction = transactions[index];
          var modal = document.getElementById('myModal');
          modal.style.display = 'block';
          showHighchartsForSingleTransaction(transaction);
        };
        cDataCell.setAttribute('index', i);
        dataRow.appendChild(cDataCell);
      } else {
        const cDataCell = document.createElement('td');
        cDataCell.textContent = 'Price ↑ ↓';
        const clist = cDataCell.classList;
        clist.add('antiquewhite');
        clist.add('bold');
        clist.add('align-right');
        cDataCell.onclick = function (e) {
          e = e || window.event;
          var target = e.target || e.srcElement;
          const index = target.getAttribute('index');
          const transaction = activeTransactions[index];
          var modal = document.getElementById('myModal');
          modal.style.display = 'block';
          showHighchartsForSingleTransaction(transaction);
        };
        cDataCell.setAttribute('index', i);
        dataRow.appendChild(cDataCell);
      }

      table.appendChild(dataRow);
      i++;
    }
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
  list.add(netProfit > 0 ? 'strong-green' : 'strong-red');
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
  } else if (document.getElementById('app-loading')) {
    document.getElementById('app-loading').style.display = 'none';
  }
}
// Get all the transactions for the selected trade date
function getAllTransactions() {
  return new Promise((resolve) => {
    const dateControl = document.querySelector('input[type="date"]');
    const selectedTradeDate = dateControl.value;
    const tradeDate = todaysTradeDate(selectedTradeDate);
    console.log(`Selected Trade Date :: ${tradeDate}`);

    fetch(`${serverHostAndPort}/v1/transactions?limit=1000&sortBy=createdAt:desc&tradeDate=${tradeDate}`)
      .then((response) => response.json())
      .then(
        (data) => {
          const tableContainer = window.document.getElementById('trade-table-container');
          tableContainer.innerHTML = '';
          transactions = data.results;

          hCatogeries = [];
          hProfit = [];
          hNetProfit = [];
          let i = 0;
          let profit = 0;
          let netprofit = 0;
          hTransactions = transactions;

          for (const transaction of hTransactions) {
            const cellProfit = transaction.profit;
            netprofit += cellProfit - 300;
            profit += cellProfit;
            hProfit.push(profit);
            hNetProfit.push(netprofit);
            i++;
            hCatogeries.push(i);
          }
          hNetProfitAmount = netprofit;
          // console.log(hNetProfitAmount);
          updateApplicationWithData();
          const table = createTradesTableFromObjects(transactions, false);
          // const tableContainer = window.document.getElementById('trade-table-container');
          tableContainer.innerHTML = '';
          tableContainer.appendChild(table);
          resolve('getAllTransactions completed');
        },
        (reason) => {
          console.log(reason);
          resolve('getAllTransactions not completed');
        }
      );
  });
}

// Get all the transactions for the selected trade date
function getAllActiveTransactions() {
  return new Promise((resolve) => {
    const dateControl = document.querySelector('input[type="date"]');
    const selectedTradeDate = dateControl.value;
    const tradeDate = todaysTradeDate(selectedTradeDate);
    console.log(`Selected Trade Date :: ${tradeDate}`);

    fetch(`${serverHostAndPort}/v1/transactions?limit=10&sortBy=createdAt:desc&active=true&tradeDate=${tradeDate}`)
      .then((response) => response.json())
      .then((data) => {
        const activeTableContainer = window.document.getElementById('active-trade-table-container');
        activeTableContainer.innerHTML = '';

        let i = 0;
        let profit = 0;
        let netprofit = 0;

        activeTransactions = data.results;
        if (activeTransactions.length > 0) {
          activeTransanctionProfit = activeTransactions[0].profit;

          netprofit += activeTransanctionProfit - 300;
          profit += activeTransanctionProfit;
          hProfit.push(profit);
          i++;
          hCatogeries.push(i);
        }
        const table = createTradesTableFromObjects(activeTransactions, true);
        activeTableContainer.innerHTML = '';
        activeTableContainer.appendChild(table);
        resolve('getAllActiveTransactions completed');
      });
  });
}

// Get all the user settings
function getAllUserSettings() {
  return new Promise((resolve) => {
    fetch(`${serverHostAndPort}/v1/settings`)
      .then((response) => response.json())
      .then((data) => {
        userSettings = data.results;
        updateUserSettings();
        resolve('getAllUserSettings completed');
      });
  });
}

// Get all the option Script
function getAllOptionScripts() {
  return new Promise((resolve) => {
    fetch(`${serverHostAndPort}/v1/optionscripts`)
      .then((response) => response.json())
      .then((data) => {
        optionScripts = data.results;
        updateOptionScripts();
        resolve('getAllOptionScripts completed');
      });
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
  fetch(`${serverHostAndPort}/v1/settings/${settingsId}`, requestOptions)
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
  fetch(`${serverHostAndPort}/v1/settings/${settingsId}`, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      showLoading(false);
    });
}

// Update the user settings
async function patchOptionScripts(serverHostPort, tradingSymbol, optionScriptId) {
  const optionScript = {
    tradingsymbol: tradingSymbol,
  };
  const requestOptions = {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(optionScript),
  };
  return fetch(`${serverHostPort}/v1/optionscripts/${optionScriptId}`, requestOptions);
}

let transactions = [];
let userSettings = [];
let optionScripts = [];
// Setting Todays Date to Trade Date
const timeoutID = setTimeout(() => {
  const dateControl = document.querySelector('input[type="date"]');
  dateControl.value = todayDate();
  dateControl.value = todayDate();
  dateControl.onchange = () => {
    showLoading(true);
    activeTransanctionProfit = 0;
    loadAllTransactions();
  };
  const saveButton = document.getElementById('save-button');
  saveButton.addEventListener('click', saveUserSettingsAndOptionScripts, false);

  const automationCheckbox = document.getElementById('start-automation');
  automationCheckbox.addEventListener('change', startAutomation, false);

  const closeButton = document.getElementById('close-button');
  closeButton.addEventListener('click', closeModal, false);

  clearTimeout(timeoutID);
}, 3001);

function startAutomation(event) {
  const isChecked = event.currentTarget.checked;
  const userSettingsForApp = userSettings[0];
  userSettingsForApp.auto = isChecked;
  patchUserSettingsAutomation(userSettingsForApp);
}

function saveUserSettingsAndOptionScripts() {
  console.log(optionScriptJsons);
  if (optionScripts && optionScripts.length === 2) {
    const ceOptionScriptsForApp = optionScripts[0];
    const peOptionScriptsForApp = optionScripts[1];
    const ceTradingSymbolInput = document.getElementById('ceTradingSymbol-input').value;
    const peTradingSymbolInput = document.getElementById('peTradingSymbol-input').value;
    ceOptionScriptsForApp.tradingsymbol = ceTradingSymbolInput;
    peOptionScriptsForApp.tradingsymbol = peTradingSymbolInput;

    let optionscriptPromises = [];
    optionscriptPromises = [
      patchOptionScripts(serverHostAndPort, ceOptionScriptsForApp.tradingsymbol, ceOptionScriptsForApp.id),
      patchOptionScripts(serverHostAndPort, peOptionScriptsForApp.tradingsymbol, peOptionScriptsForApp.id),
    ];

    Promise.all(optionscriptPromises).then((value) => {
      console.log(value);
    });
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
function loadAllTransactions() {
  Promise.all([getAllTransactions(), getAllActiveTransactions()]).then((value) => {
    console.log(value);
    showHighchartsForAllTransactions();
    showLoading(false);
    if (!isTradingTime()) {
      clearInterval(transactionInterval);
    }
  });
}

function loadAllRequiredSettings() {
  Promise.all([getAllUserSettings(), getAllOptionScripts()]).then((value) => {
    console.log(value);
  });
}

function isTradingTime() {
  const now = new Date(new Date().toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }));
  var startTime = '09:15:00';
  var endTime = '15:29:30';

  var s = startTime.split(':');
  var dt1 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(s[0]), parseInt(s[1]), parseInt(s[2]));

  var e = endTime.split(':');
  var dt2 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(e[0]), parseInt(e[1]), parseInt(e[2]));

  const isTradingTime = now >= dt1 && now <= dt2;
  console.log(`Trading Time :: ${isTradingTime}`);
  return isTradingTime;
}

function closeModal() {
  var modal = document.getElementById('myModal');
  modal.style.display = 'none';
}

showLoading(true);
loadAllRequiredSettings();
setInterval(updateCurrentDateAndTime, 1000);
transactionInterval = setInterval(loadAllTransactions, 5000);

function showHighchartsForAllTransactions() {
  let ceTradingSymbol;
  let peTradingSymbol;
  if (optionScripts.length > 0) {
    ceTradingSymbol = optionScripts[0].tradingsymbol;
    peTradingSymbol = optionScripts[1].tradingsymbol;
  }

  Highcharts.chart('container', {
    chart: {
      type: 'spline',
      scrollablePlotArea: {
        minWidth: 600,
        scrollPositionX: 1,
      },
    },
    title: {
      text: 'Net Profit/Loss (₹)',
      align: 'center',
    },
    subtitle: {
      text: `Option Trade Profit Chart for CALL ${ceTradingSymbol} and PUT ${peTradingSymbol}`,
      align: 'center',
    },
    xAxis: {
      text: ' Trade No.',
      labels: {
        overflow: 'justify',
      },
    },
    yAxis: {
      title: {
        text: 'Profit (₹)',
      },
      minorGridLineWidth: 0,
      gridLineWidth: 0,
      alternateGridColor: null,
      plotBands: [
        {
          // Light air
          from: 500000,
          to: 0,
          color: 'rgba(68, 170, 213, 0.1)',
          label: {
            text: 'Profit',
            style: {
              color: '#606060',
            },
          },
        },
        {
          // Light breeze
          from: 0,
          to: -500000,
          color: 'rgba(0, 0, 0, 0)',
          label: {
            text: 'Loss',
            style: {
              color: '#606060',
            },
          },
        },
      ],
    },
    tooltip: {
      valueSuffix: '₹`',
    },
    plotOptions: {
      spline: {
        lineWidth: 4,
        states: {
          hover: {
            lineWidth: 5,
          },
        },
        marker: {
          enabled: false,
        },
        pointInterval: 1,
        pointStart: 1,
      },
    },
    series: [
      {
        name: 'Net Profit/Loss (₹)',
        data: hNetProfit,
      },
      {
        name: 'Profit (₹)',
        data: hProfit,
      },
    ],
    navigation: {
      menuItemStyle: {
        fontSize: '10px',
      },
    },
  });
}

function showHighchartsForSingleTransaction(transaction) {
  const priceVariation = [];
  console.log(transaction.expiryDate);
  if (!transaction.expiryDate.includes(',')) {
    return;
  }

  const prices = transaction.expiryDate.split(',');
  for (let index = 0; index < prices.length; index++) {
    const price = parseFloat(prices[index]);
    priceVariation.push(price);
  }
  Highcharts.chart('single-container', {
    chart: {
      type: 'spline',
      scrollablePlotArea: {
        minWidth: 600,
        scrollPositionX: 1,
      },
    },
    title: {
      text: 'Transaction Price Change',
      align: 'center',
    },
    subtitle: {
      text: `Price variation for trade symbol ${transaction.strikePrice}`,
      align: 'center',
    },
    xAxis: {
      text: ' Tick',
      labels: {
        overflow: 'justify',
      },
    },
    yAxis: {
      title: {
        text: 'Price (₹)',
      },
      minorGridLineWidth: 0,
      gridLineWidth: 0,
      alternateGridColor: null,
    },
    tooltip: {
      valueSuffix: '₹`',
    },
    plotOptions: {
      spline: {
        lineWidth: 4,
        states: {
          hover: {
            lineWidth: 5,
          },
        },
        marker: {
          enabled: false,
        },
        pointInterval: 1,
        pointStart: 1,
      },
    },
    series: [
      {
        name: 'Price Change (₹)',
        data: priceVariation,
      },
    ],
    navigation: {
      menuItemStyle: {
        fontSize: '10px',
      },
    },
  });
}
