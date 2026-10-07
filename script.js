// const colors = {color1: "#f8ef00",color2: "#00f0ff",color3: "#ff003c",color4: "#000000",color5: "#fafafa",color6: "#BBBBBB"};
const BASE_URL = "https://api.genratr.com";

const passwordContainer = document.querySelector(".password");
const passwordScreen = document.querySelector(".password__screen");
const passwordGeneraitorBtn = document.querySelector(".password__generaitor");
const copyPasswordBtn = document.querySelector(".copy__btn");
const lengthInput = document.querySelector(".length__input");
const lengthValue = document.querySelector(".length__value");
const optionsInput = document.querySelectorAll(".options__input");
const passwordHistoryContainer = document.querySelector(".history__list");
const historyClearBtn = document.querySelector(".history__clear");

const filters = {
  length: 8,
  uppercase: false,
  lowercase: true,
  special: false,
  numbers: false,
};

const filtredPassword = (e) => {
  lengthValue.classList.remove("length__value--active");
  const { target } = e;
  const filterType = target.id;
  let filterValue;

  if (target.type === "range") filterValue = +target.value;
  else filterValue = target.checked;

  filters[filterType] = filterValue;
};
const generatPassword = async () => {
  let FILTER_URL = "";
  for (const filter in filters) {
    if (filter === "length") FILTER_URL += `length=${filters[filter]}`;
    else if (filters[filter] && filter !== "length") {
      FILTER_URL += `&${filter}`;
      document.querySelector(`#${filter}`).setAttribute("checked", true);
    } else if (!filters[filter] && filter !== "length")
      document.querySelector(`#${filter}`).removeAttribute("checked");
  }
  const response = await fetch(`${BASE_URL}/?${FILTER_URL}`);
  const data = await response.json();
  const password = data.password;

  return password;
};
const showNewPassword = async () => {
  showPasswordHistory(JSON.parse(localStorage.getItem("history")));
  passwordScreen.innerHTML = "";
  passwordScreen.classList.add("password__screen--loading");
  passwordGeneraitorBtn.classList.add("password__generaitor--active");
  copyPasswordBtn.disabled = true;

  const password = await generatPassword();

  passwordScreen.classList.remove("password__screen--loading");
  passwordGeneraitorBtn.classList.remove("password__generaitor--active");
  passwordScreen.innerHTML = password;
  copyPasswordBtn.setAttribute("data-password", password);
  copyPasswordBtn.disabled = false;
};
const setFilterInput = (e) => {
  filtredPassword(e);
  let [count, falseFilter] = [0, 0];

  for (const filter in filters) {
    if (filters[filter] === false) falseFilter++;
    else if (filters[filter] === true) count++;
  }

  if (falseFilter === 3) {
    optionsInput.forEach((inp) =>
      inp.checked ? inp.setAttribute("disabled", true) : "",
    );
  } else optionsInput.forEach((inp) => inp.removeAttribute("disabled"));

  passwordContainer.dataset.filter = count;
};
const addPasswordInLocalStorageHistory = (password) => {
  const getHistoryFromLocalStorage = localStorage.getItem("history");

  const fullDate = new Date().toLocaleString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = new Date().toLocaleString("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const date = `${fullDate.split("-").join("/")} ${time}`;

  let history = [];
  let newPassword = { id: history.length + 1, password, date };

  if (getHistoryFromLocalStorage) {
    history = JSON.parse(getHistoryFromLocalStorage);

    const isSaveigPassword = history.some((item) => item.password === password);

    if (isSaveigPassword) return toastbox("warning", "password");
    else {
      history.push(newPassword);
      toastbox("sucsses", "password");
    }
  } else {
    history.push(newPassword);
  }
  localStorage.setItem("history", JSON.stringify(history));

  showPasswordHistory(history);
};
const showPasswordHistory = (history) => {
  if (history) {
    passwordHistoryContainer.innerHTML = "";
    passwordHistoryContainer.classList.remove("history__list--empty");
    const fragment = document.createDocumentFragment();

    history.forEach(({ password, date }) => {
      const li = document.createElement("li");
      const div = document.createElement("div");
      const button = document.createElement("button");

      li.className = "history__item";
      div.className = "history__left";
      button.className = "history__copy";

      div.innerHTML = `<span class="history__password">${password}</span>
      <span class="history__caption">${date}</span>`;
      button.innerHTML = `<svg><use href="#copy"></use></svg>`;

      button.dataset.password = password;
      button.addEventListener("click", () => copyHistoryPassword(button));

      li.append(div, button);
      fragment.appendChild(li);
    });
    passwordHistoryContainer.append(fragment);
  }
};
const changeLenghtValue = () => {
  const { min, max, value, clientWidth } = lengthInput;

  const percent = ((value - min) / (max - min)) * 100;
  const thumbOffset = (21 / clientWidth) * 100;

  const left = thumbOffset / 2 + percent * (1 - thumbOffset / 100);

  lengthValue.textContent = value;
  lengthValue.style.left = `${left}%`;
  lengthValue.classList.add("length__value--active");
};
const copyPassword = () => {
  const password = copyPasswordBtn.dataset.password;
  navigator.clipboard.writeText(password);

  addPasswordInLocalStorageHistory(password);
};
const copyHistoryPassword = (button) => {
  const password = button.dataset.password;
  navigator.clipboard.writeText(password);
};
const toastbox = (type, value) => {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.classList.add(`toast--${type}`);
  if (value === "password") {
    switch (type) {
      case "warning":
        toast.innerHTML = `
        <div class="toast__icon">
          <svg>
            <use href="#warning"></use>
          </svg>
        </div>
        <div>
          <span class="toast__text">You are Have</span>
          <span class="toast__caption">Thes Is Password In History</span>
        </div>
        `;
        break;

      default:
        toast.innerText = "sucsses";
        break;
    }
  }

  document.body.append(toast);
  toast.addEventListener("animationend", () => {});
};
const historyClear = () => {
  localStorage.removeItem("history");
  passwordHistoryContainer.classList.add("history__list--empty");
  passwordHistoryContainer.innerHTML = `
  <li class="history__item--empty">
      Your generated password will appear here
      <br>
      once you create them.
  </li>`;
};
optionsInput.forEach((inp) => inp.addEventListener("change", setFilterInput));
lengthInput.addEventListener("change", filtredPassword);
lengthInput.addEventListener("input", changeLenghtValue);
window.addEventListener("load", showNewPassword);
passwordGeneraitorBtn.addEventListener("click", showNewPassword);
copyPasswordBtn.addEventListener("click", copyPassword);
historyClearBtn.addEventListener("click", historyClear);
