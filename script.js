'use strict';
const account1 = {
  owner: 'amanda',
  fullName: 'Amanda Kumar Chaudhary',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'vishal',
  fullName: 'Vishal Kumar Chaudhary',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'teresa',
  fullName: 'Teresa SurName',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'sadhana',
  fullName: 'Sadhana Kumar Chaudhary',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');
const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');
const loginBtn = document.querySelector('.login__btn');
const todaysDateEl = document.querySelector('.date');
const template = document.querySelector('.template');
const errorEl = document.querySelector('.error');
const logo = document.querySelector('.logo');
const currencies = ['€', '$'];
let totalDeposit = 0;
let totalWithdraw = 0;
let errors = [];
let movementsVersionsArray = '';
let transferInfoObjects = new Object();

btnLogin.addEventListener('click', evt => {
  evt.preventDefault();
  errorEl.innerHTML = '';
  errors = getErrorsList(errors);
  if (errors.length > 0) showError(errors);
  else {
    if (isAmanda()) {
      displayDataForAmanda('$');
    } else loadPage();
  }
});
btnLoan.addEventListener('click', evt => {
  evt.preventDefault();
  const amount = Number(inputLoanAmount.value);
  const currentUser = labelWelcome.dataset.user;
  const account = getAccountName(currentUser);
  if (
    inputLoanAmount.value.length === 0 ||
    Number(inputLoanAmount.value) > 1000 ||
    Number(inputLoanAmount.value) <= 0 ||
    !account.movements.some(move => move > 0) ||
    amount > Number(labelBalance.dataset.TotalBalance) / 10
  ) {
    inputLoanAmount.value = '';
    return;
  }
  account.movements.push(amount);
  if (currentUser === 'amanda') updateMoneyData(account, '$');
  else {
    updateMoneyData(account);
  }
  inputLoanAmount.value = '';
});
btnTransfer.addEventListener('click', evt => {
  evt.preventDefault();
  let transferTo = inputTransferTo.value.trim().toLowerCase();
  let transferAmount = inputTransferAmount.value;
  const currentUser = labelWelcome.dataset.user;
  const currentUserAccount = getAccountName(currentUser);
  const transferToAccount = getAccountName(transferTo);
  if (
    transferTo.length === 0 ||
    transferAmount.length === 0 ||
    Number(inputTransferAmount.value) <= 0 ||
    currentUserAccount === transferToAccount ||
    transferToAccount == undefined ||
    Number(transferAmount) > 1000 ||
    Number(labelBalance.dataset.TotalBalance) < transferAmount
  ) {
    inputTransferTo.value = '';
    inputTransferAmount.value = '';
    return;
  }
  if (currentUser === 'amanda') {
    updateDataOnTransfer(
      currentUserAccount,
      transferAmount,
      transferToAccount,
      '$'
    );
  } else {
    updateDataOnTransfer(currentUserAccount, transferAmount, transferToAccount);
  }
});
function updateDataOnTransfer(
  currentUserAccount,
  transferAmount,
  transferToAccount,
  currency = '€'
) {
  currentUserAccount.movements.push(-transferAmount);
  updateMoneyData(currentUserAccount);
  inputTransferTo.value = '';
  inputTransferAmount.value = '';
  addDatatoSession(transferToAccount.owner, transferAmount);
}
btnSort.addEventListener('click', evt => {
  evt.preventDefault();
  const shifted = movementsVersionsArray.shift();
  movementsVersionsArray.push(shifted);
  displayTransactions(shifted);
});
btnClose.addEventListener('click', evt => {
  evt.preventDefault();
  const user = inputCloseUsername.value.trim().toLowerCase();
  const pin = Number(inputClosePin.value.trim());
  const currentUser = labelWelcome.dataset.user;
  const currentUserAccount = getAccountName(currentUser);
  if (
    user.length === 0 ||
    pin.length === 0 ||
    currentUserAccount == undefined ||
    user !== currentUserAccount.owner ||
    pin !== currentUserAccount.pin
  ) {
    inputCloseUsername.value = inputClosePin.value = '';
    return;
  } else {
    containerApp.classList.remove('show');
    greetCustomer('Sorry to see you going ', user);
    closeAccount(currentUserAccount);
    inputCloseUsername.value = inputClosePin.value = '';
  }
});
function displayMovements(movements, currency = '€') {
  containerMovements.innerHTML = '';
  movements.forEach((value, index) => {
    const type = value > 0 ? 'deposit' : 'withdrawal';
    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      index + 1
    } ${type}</div>
          <div class="movements__date">3 days ago</div>
          <div class="movements__value">${value}${currency}</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
}
function displayTransactions(movements, currency = '€') {
  containerMovements.innerHTML = '';
  movements.forEach((value, index) => {
    let type = value > 0 ? 'deposit' : 'withdrawal';
    const templateClone = template.content.cloneNode(true);
    const movementsType = templateClone.querySelector('.movements__type');
    movementsType.classList.add(`movements__type--${type}`);
    movementsType.textContent = `${index + 1} ${type}`;
    templateClone.querySelector(
      '.movements__value'
    ).textContent = `${value}${currency}`;
    containerMovements.appendChild(templateClone);
  });
}
function calculateInOut(movements, currency = '€') {
  let totalIn = 0;
  let totalOut = 0;
  movements.forEach(item => {
    item > 0 ? (totalIn += Math.abs(item)) : (totalOut += Math.abs(item));
  });
  labelSumIn.textContent = totalIn.toFixed(2) + currency;
  labelSumOut.textContent = totalOut.toFixed(2) + currency;
}
function calculateInterest(account, currency = '€') {
  const principle = account.movements
    .filter(move => move > 0)
    .reduce((acc = 0, move) => {
      return (acc += move);
    });
  labelSumInterest.textContent =
    (principle * (account.interestRate / 100)).toFixed(2) + currency;
}
function showCurrentBalance(account, currency = '€') {
  const total = account.movements.reduce((acc = 0, move) => {
    return (acc += move);
  });
  keepCurrentUserTotalBalance(total.toFixed(2));
  labelBalance.textContent = `${total.toFixed(2)} ${currency}`;
}
function showUserInformations(currency = '€') {
  const account = getAccountName(inputLoginUsername.value.trim().toLowerCase());
  setupPageOnLoad(account);
  updateDate();
  updateMoneyData(account, currency);
  startTimer(300, labelTimer);
}
function setupPageOnLoad(account) {
  keepCurrentUseronDataSet(account);
  greetCustomer('Welcome Back ', account.fullName);
  containerApp.classList.add('show');
  inputLoginUsername.value = inputLoginPin.value = '';
}

function updateMoneyData(account, currency = '€') {
  showCurrentBalance(account, currency);
  displayMovements(account.movements, currency);
  calculateInOut(account.movements, currency);
  calculateInterest(account, currency);
}

function getUserName(accounts) {
  accounts.forEach(account => {
    const NAMES = account.fullName.toLowerCase().split(' ');
    account.userName = NAMES.map(name => name[0]).join('');
  });
}
function keepCurrentUseronDataSet(account) {
  labelWelcome.dataset.user = account.owner;
}
function keepCurrentUserTotalBalance(total) {
  labelBalance.dataset.TotalBalance = total;
}

function getVersionsOfMovements() {
  const account = getAccountName(labelWelcome.dataset.user);
  return getSortedAndUnsortedVersionOfArray(account.movements);
}
function addDatatoSession(key, value) {
  if (!transferInfoObjects.hasOwnProperty(key)) {
    transferInfoObjects[key] = value;
  } else {
    transferInfoObjects[key] = Number(transferInfoObjects[key]) + Number(value);
    console.log(transferInfoObjects);
  }
  sessionStorage.setItem(key, transferInfoObjects[key]);
}
function updateTransferOnLoad(currency = '€') {
  const account = getAccountName(labelWelcome.dataset.user);
  if (
    account == undefined ||
    sessionStorage.getItem(account.owner) == undefined
  )
    return;
  else {
    account.movements.push(Number(sessionStorage.getItem(account.owner)));
    updateMoneyData(account, currency);
  }
}
function isAmanda() {
  const account = getAccountName(inputLoginUsername.value.trim().toLowerCase());
  if (account.owner !== 'amanda') return false;
  else {
    keepCurrentUseronDataSet(account);
    return true;
  }
}
function displayDataForAmanda(currency) {
  loadPage(currency);
}
function loadPage(currency = '€') {
  showUserInformations(currency);
  movementsVersionsArray = getVersionsOfMovements();
  updateTransferOnLoad(currency);
}
function updateDate() {
  const todaysDate = new Date();
  todaysDateEl.textContent = `${
    todaysDate.getMonth() + 1
  }/${todaysDate.getDate()}/${todaysDate.getFullYear()}`;
}
function greetCustomer(message, user) {
  const name = user
    .toLowerCase()
    .split(' ')
    .map(name => name[0].toUpperCase() + name.slice(1))
    .join(' ');
  labelWelcome.textContent = `${message} ${name}`;
}
function getAccountName(userName) {
  return accounts.find(acc => acc.owner === userName);
}
function closeAccount(currentUserAccount) {
  const index = accounts.indexOf(currentUserAccount);
  accounts.splice(index, 1);
  console.log(accounts);
}
function startTimer(duration, display) {
  var timer = duration,
    minutes,
    seconds;
  setInterval(function () {
    minutes = parseInt(timer / 60, 10);
    seconds = parseInt(timer % 60, 10);
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    display.textContent = minutes + ':' + seconds;
    if (--timer < 0) {
      timer = duration;
      console.log('time over');
      const page = document.querySelector('.app');
      page.classList.remove('show');
      labelWelcome.textContent = 'Log in to get started';
    }
  }, 1000);
}
function changeNumArrayOrderAscending(arr) {
  const sortedArray = [...arr];
  return sortedArray.sort((a, b) => a - b);
}
function getSortedAndUnsortedVersionOfArray(arr) {
  return [
    [...arr],
    [...changeNumArrayOrderAscending(arr)],
    [...changeNumArrayOrderAscending(arr).reverse()],
  ];
}
function getErrorsList(errors) {
  errors = [];
  if (inputLoginUsername.value.trim().length === 0) {
    errors.push('Please supply userName');
  } else {
    var account = getAccountName(inputLoginUsername.value.toLowerCase());
    if (account == undefined) {
      errors.push('Incorrect User Name');
      inputLoginUsername.value = '';
    }
  }
  if (inputLoginPin.value.trim().length === 0) {
    errors.push('Pin field can not be empty');
  } else {
    if (inputLoginPin.value.length !== 4) {
      errors.push('Pin field must be 4 digits only');
      inputLoginPin.value = '';
    } else if (
      account == undefined ||
      account.pin == undefined ||
      Number(account.pin) === NaN ||
      account == undefined ||
      Number(inputLoginPin.value) !== Number(account.pin)
    ) {
      errors.push('Incorrect pin please try again');
      inputLoginPin.value = '';
    }
  }
  return errors;
}
function showError(errors) {
  if (errors.length !== 0) {
    errors.forEach((value, i) => {
      const paraEl = `<h2> ${i + 1}. ${value}.</h2>`;
      errorEl.insertAdjacentHTML('beforeend', paraEl);
    });
  }
}
console.log(
  '===================================================================================',
  'below codes has nothing to do with main application so ignore it please'
);
/* function getArrayInAscending(arr) {
  let copyarr = [...arr];
  let newArray = [];
  for (let i = 0; i < arr.length; i++) {
    const currentHighestValue = getMaxValueoFArray(copyarr);
    const index = copyarr.indexOf(currentHighestValue);
    copyarr.splice(index, 1);
    newArray.push(currentHighestValue);
  }
  return newArray;
}
function getMaxValueoFArray(arr) {
  let maxValue = arr[0];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > maxValue) {
      maxValue = arr[i];
    }
  }
  return maxValue;
}
function getThreeVersionOfSortedArray(arr) {
  const sorteds = [
    getArrayInAscending(arr),
    getArrayInAscending(arr).reverse(),
    arr,
  ];
  return sorteds;
} */
// Advanced Reduce Methods
const bankTotalDepsoits = accounts
  .map(account => account.movements)
  .flat()
  .filter(account => account > 0)
  .reduce((accum = 0, currectElement) => (accum += currectElement));
console.log(bankTotalDepsoits);
const thousandDollarsOrMoreDeposits = accounts
  .map(account => account.movements)
  .flat()
  //.filter(account => account >= 1000).length;
  .reduce(
    (count, currenctElement) => (currenctElement >= 1000 ? count + 1 : count),
    0
  );

console.log(thousandDollarsOrMoreDeposits);
const sums = accounts
  .map(account => account.movements)
  .flat()
  .reduce(
    (sums, curr) => {
      curr > 0 ? (sums.deposits += curr) : (sums.withdraws += curr);
      return sums;
    },
    { deposits: 0, withdraws: 0 }
  );

console.log(sums);
const sentence = 'this is a nice tittle';
function getCapitalize(sentence) {
  const exceptions = ['a', 'an', 'the', 'but', 'or', 'on', 'in', 'with', 'not'];
  sentence = sentence.toLowerCase();
  return sentence
    .trim()
    .split(' ')
    .map(word => word.trim())
    .reduce((accu, word) => {
      exceptions.includes(word)
        ? accu.push(word)
        : accu.push(word[0].toUpperCase() + word.slice(1));
      return accu;
    }, [])
    .join(' ');

  // return words.join(' ');
}
console.log(getCapitalize(sentence));
console.log(getCapitalize('ThIS is a LONG Titile but NOT Too Long'));
const dog = [
  {
    weight: 22,
    curFood: 250,
    owner: ['Alice', 'Bob'],
  },
  {
    weight: 8,
    curFood: 200,
    owner: ['Matilda'],
  },
  {
    weight: 32,
    curFood: 340,
    owner: ['Michael'],
  },
];
const something = [1, 5, 9, 2, 8, 4, 11, 0, 19, 12, 14, 3];
console.log(getSortedAndUnsortedVersionOfArray(something));
console.log(something);
