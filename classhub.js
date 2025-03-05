(function () {
  "use strict";

  const version = "1.3.3";

  // --- Theme Management & CSS Setup ---
  const themeColors = {
    dark: {
      windowBg: "#2e2e2e",
      border: "#555",
      headerBg: "#1f1f1f",
      headerText: "#fff",
      contentBg: "#3a3a3a",
      outputText: "#ddd",
      inputBg: "#555",
      inputText: "#eee",
      buttonBg: "#444",
      buttonText: "#fff",
      buttonHoverBg: "#555",
    },
    light: {
      windowBg: "#f9f9f9",
      border: "#ccc",
      headerBg: "#555",
      headerText: "#fff",
      contentBg: "#fff",
      outputText: "#222",
      inputBg: "#fff",
      inputText: "#222",
      buttonBg: "#eee",
      buttonText: "#000",
      buttonHoverBg: "#ddd",
    },
  };

  function getCurrentTheme() {
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
      ? themeColors.dark
      : themeColors.light;
  }

  let currentTheme = getCurrentTheme();

  // Create a <style> element to house CSS variables and classes
  const styleEl = document.createElement("style");
  styleEl.innerText = `
    :root {
      --window-bg: ${currentTheme.windowBg};
      --border-color: ${currentTheme.border};
      --header-bg: ${currentTheme.headerBg};
      --header-text: ${currentTheme.headerText};
      --content-bg: ${currentTheme.contentBg};
      --output-text: ${currentTheme.outputText};
      --input-bg: ${currentTheme.inputBg};
      --input-text: ${currentTheme.inputText};
      --button-bg: ${currentTheme.buttonBg};
      --button-text: ${currentTheme.buttonText};
      --button-hover-bg: ${currentTheme.buttonHoverBg};
    }
    .console-window {
      position: fixed;
      width: 600px;
      top: 100px;
      left: 100px;
      box-shadow: 0 0 15px rgba(0,0,0,0.6);
      border-radius: 8px;
      z-index: 10000;
      font-family: Arial, sans-serif;
      background-color: var(--window-bg);
      border: 1px solid var(--border-color);
      z-index: 2147483647;
    }
    .console-header {
      background-color: var(--header-bg);
      color: var(--header-text);
      padding: 8px 10px;
      cursor: move;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    button {
      background-color: var(--button-bg);
      color: var(--button-text);
      border: none;
      padding: 4px 8px;
      margin-left: 4px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    button:hover {
      background-color: var(--button-hover-bg);
    }
    a {
      color: var(--button-text);
      text-decoration: underline;
    }
    .console-container {
      height: 500px;
      border: 1px solid var(--border-color);
      background-color: var(--window-bg);
      display: flex;
      flex-direction: column;
      user-select: none;
      overflow: hidden;
    }
    .tab-bar {
      display: flex;
      background-color: var(--header-bg);
    }
    .tab-bar button {
      flex: 1;
      padding: 8px;
      cursor: pointer;
      background-color: var(--header-bg);
      border: none;
      color: var(--header-text);
    }
    .tab-bar button.active {
      border-bottom: 2px solid var(--button-hover-bg);
    }
    .tab-content {
      flex: 1;
      overflow: auto;
    }
    .console-content {
      padding: 8px;
      height: 100%;
      overflow: auto;
      background-color: var(--content-bg);
    }
    .console-output {
      font-family: monospace;
      font-size: 13px;
      white-space: pre-wrap;
      margin-bottom: 6px;
      color: var(--output-text);
    }
    .console-input {
      width: 100%;
      box-sizing: border-box;
      padding: 6px;
      border: 1px solid var(--border-color);
      border-radius: 4px;
      background-color: var(--input-bg);
      color: var(--input-text);
    }
    .category h3 {
      color: var(--button-text);
    }
    .banner {
      background-color:rgb(29, 29, 29);
      padding: 10px;
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      border: 2px solid #000;
      margin: 10px 0;
      }
    .tab-pane { display: none; }
    .tab-pane.active { display: block; }
    .settings label { color: var(--button-text); }
  `;
  document.head.appendChild(styleEl);

  // Update CSS variables when theme changes
  function updateTheme() {
    currentTheme = getCurrentTheme();
    const root = document.documentElement;
    root.style.setProperty('--window-bg', currentTheme.windowBg);
    root.style.setProperty('--border-color', currentTheme.border);
    root.style.setProperty('--header-bg', currentTheme.headerBg);
    root.style.setProperty('--header-text', currentTheme.headerText);
    root.style.setProperty('--content-bg', currentTheme.contentBg);
    root.style.setProperty('--output-text', currentTheme.outputText);
    root.style.setProperty('--input-bg', currentTheme.inputBg);
    root.style.setProperty('--input-text', currentTheme.inputText);
    root.style.setProperty('--button-bg', currentTheme.buttonBg);
    root.style.setProperty('--button-text', currentTheme.buttonText);
    root.style.setProperty('--button-hover-bg', currentTheme.buttonHoverBg);
  }
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", updateTheme);

  // --- Global Flag ---
  let showExecutionTime = false;

  // --- Utility: Debounce Function ---
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // --- Main Container Setup ---
  const consoleWindow = document.createElement("div");
  consoleWindow.classList.add("console-window");
  consoleWindow.setAttribute("role", "dialog");
  consoleWindow.setAttribute("aria-label", "Interactive Console App");

  const consoleContainer = document.createElement("div");
  consoleContainer.classList.add("console-container");

  // --- Header & Controls ---
  const header = document.createElement("div");
  header.classList.add("console-header");
  header.setAttribute("role", "banner");
  header.tabIndex = 0;

  const title = document.createElement("span");
  title.innerText = "ClassHub - Made by proplayer919 (Version " + version + ")";
  title.style.userSelect = "none";

  const headerButtons = document.createElement("div");

  const minimizeButton = document.createElement("button");
  minimizeButton.innerText = "_";
  minimizeButton.setAttribute("aria-label", "Minimize app");

  const closeButton = document.createElement("button");
  closeButton.innerText = "X";
  closeButton.setAttribute("aria-label", "Close app");

  headerButtons.appendChild(minimizeButton);
  headerButtons.appendChild(closeButton);
  header.appendChild(title);
  header.appendChild(headerButtons);

  // --- Tab Bar & Content ---
  const tabBar = document.createElement("div");
  tabBar.classList.add("tab-bar");
  tabBar.setAttribute("role", "tablist");

  const tabs = ["Console", "Plugins", "Chat", "Settings", "Changelog"];
  const tabButtons = {};
  tabs.forEach((tabName) => {
    const btn = document.createElement("button");
    btn.innerText = tabName;
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-selected", "false");
    btn.setAttribute("data-tab", tabName.toLowerCase());
    btn.addEventListener("click", () => switchTab(tabName.toLowerCase()));
    tabButtons[tabName.toLowerCase()] = btn;
    tabBar.appendChild(btn);
  });

  const tabContentContainer = document.createElement("div");
  tabContentContainer.classList.add("tab-content");

  // --- Tab: Console ---
  const tabConsole = document.createElement("div");
  tabConsole.id = "tabConsole";
  tabConsole.classList.add("tab-pane");

  const consoleContent = document.createElement("div");
  consoleContent.classList.add("console-content");

  const consoleOutput = document.createElement("div");
  consoleOutput.classList.add("console-output");

  const consoleInput = document.createElement("input");
  consoleInput.type = "text";
  consoleInput.classList.add("console-input");
  consoleInput.setAttribute("aria-label", "Command input");
  consoleInput.placeholder = "Enter command...";

  consoleContent.appendChild(consoleOutput);
  consoleContent.appendChild(consoleInput);
  tabConsole.appendChild(consoleContent);

  // --- Tab: Plugins ---
  const tabPlugins = document.createElement("div");
  tabPlugins.id = "tabPlugins";
  tabPlugins.classList.add("tab-pane");
  tabPlugins.style.padding = "16px";
  const pluginLinksContainer = document.createElement("div");
  pluginLinksContainer.style.display = "flex";
  pluginLinksContainer.style.flexWrap = "wrap";
  pluginLinksContainer.style.gap = "8px";
  tabPlugins.appendChild(pluginLinksContainer);

  // --- Tab: Chat ---
  const tabChat = document.createElement("div");
  tabChat.id = "tabChat";
  tabChat.classList.add("tab-pane");
  tabChat.style.padding = "8px";

  // Online user count
  const onlineUserCount = document.createElement("div");
  onlineUserCount.style.backgroundColor = "var(--content-bg)";
  onlineUserCount.style.color = "var(--button-text)";
  onlineUserCount.style.border = "1px solid var(--border-color)";
  onlineUserCount.style.padding = "4px";
  onlineUserCount.style.marginBottom = "8px";
  tabChat.appendChild(onlineUserCount);

  // Chat messages container
  const chatMessages = document.createElement("div");
  chatMessages.style.height = "350px";
  chatMessages.style.overflowY = "auto";
  chatMessages.style.backgroundColor = "var(--content-bg)";
  chatMessages.style.border = "1px solid var(--border-color)";
  chatMessages.style.padding = "4px";
  chatMessages.style.marginBottom = "8px";
  tabChat.appendChild(chatMessages);

  // Username and message input container
  const chatForm = document.createElement("div");
  chatForm.style.display = "flex";
  chatForm.style.gap = "4px";

  // Username input
  const usernameInput = document.createElement("input");
  usernameInput.type = "text";
  usernameInput.placeholder = "Username";
  usernameInput.style.flex = "1";

  // Message input
  const messageInput = document.createElement("input");
  messageInput.type = "text";
  messageInput.placeholder = "Type your message...";
  messageInput.style.flex = "3";

  // Send button
  const sendButton = document.createElement("button");
  sendButton.innerText = "Send";
  chatForm.appendChild(usernameInput);
  chatForm.appendChild(messageInput);
  chatForm.appendChild(sendButton);
  tabChat.appendChild(chatForm);

  // --- Tab: Settings ---
  const tabSettings = document.createElement("div");
  tabSettings.id = "tabSettings";
  tabSettings.classList.add("tab-pane", "settings");
  tabSettings.style.padding = "16px";

  const settingCheckboxLabel = document.createElement("label");
  const settingCheckbox = document.createElement("input");
  settingCheckbox.type = "checkbox";
  settingCheckbox.id = "enableFeature";
  settingCheckboxLabel.innerText = " Show Execution Time ";
  settingCheckboxLabel.appendChild(settingCheckbox);

  const settingInputLabel = document.createElement("label");
  settingInputLabel.style.display = "block";
  settingInputLabel.style.marginTop = "12px";
  settingInputLabel.innerText = "Custom Title:";
  const settingInput = document.createElement("input");
  settingInput.type = "text";
  settingInput.style.marginLeft = "8px";
  settingInputLabel.appendChild(settingInput);

  const infoText = document.createElement("p");
  infoText.innerHTML =
    "Copyright (c) proplayer919 2025. All rights reserved. Version " + version + ". Discord Link: <a href=\"https://discord.gg/kNfsJZSReg\" target=\"_blank\">https://discord.gg/kNfsJZSReg</a>";
  infoText.style.marginTop = "24px";
  infoText.style.fontSize = "0.8em";
  infoText.style.color = "gray";

  tabSettings.appendChild(settingCheckboxLabel);
  tabSettings.appendChild(settingInputLabel);
  tabSettings.appendChild(infoText);

  // --- Tab: Changelog ---
  const tabChangelog = document.createElement("div");
  tabChangelog.id = "tabChangelog";
  tabChangelog.classList.add("tab-pane");
  tabChangelog.style.padding = "16px";

  const changelogContainer = document.createElement("div");
  tabChangelog.appendChild(changelogContainer);



  // --- Assemble Tabs ---
  tabContentContainer.appendChild(tabConsole);
  tabContentContainer.appendChild(tabPlugins);
  tabContentContainer.appendChild(tabChat);
  tabContentContainer.appendChild(tabSettings);
  tabContentContainer.appendChild(tabChangelog);

  consoleContainer.appendChild(tabBar);
  consoleContainer.appendChild(tabContentContainer);
  consoleWindow.appendChild(header);
  consoleWindow.appendChild(consoleContainer);

  document.body.appendChild(consoleWindow);

  // --- Tab Switching ---
  function switchTab(tabName) {
    [tabConsole, tabChat, tabPlugins, tabSettings, tabChangelog].forEach((tab) =>
      tab.classList.remove("active")
    );
    if (tabName === "console") tabConsole.classList.add("active");
    else if (tabName === "chat") tabChat.classList.add("active");
    else if (tabName === "plugins") tabPlugins.classList.add("active");
    else if (tabName === "settings") tabSettings.classList.add("active");
    else if (tabName === "changelog") tabChangelog.classList.add("active");

    Object.keys(tabButtons).forEach((key) => {
      if (key === tabName) {
        tabButtons[key].classList.add("active");
        tabButtons[key].setAttribute("aria-selected", "true");
      } else {
        tabButtons[key].classList.remove("active");
        tabButtons[key].setAttribute("aria-selected", "false");
      }
    });
  }
  switchTab("console");

  // --- Debounced Auto-Scroll ---
  const debouncedScroll = debounce(() => {
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }, 50);

  // --- Chat Functionality ---
  let chatAPI = 'https://classtools.proplayer919.dev/';
  let cachedMessages = [];
  let fingerprint = navigator.userAgent + screen.width + screen.height + screen.colorDepth;

  // Make a request to the server every second
  const intervalId = setInterval(() => {
    fetch(chatAPI + "messages", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Fingerprint": fingerprint
      },
    })
      .then((response) => response.json())
      .then((messages) => {
        chatMessages.innerHTML = "";
        if (messages === cachedMessages) return;
        messages.forEach((message) => {
          const messageElem = document.createElement("div");
          messageElem.style.color = currentTheme.buttonText;
          const messageText = message.message;
          if (messageText.startsWith("::banner{") && messageText.endsWith("}")) {
            const bannerText = messageText.slice(9, -1);
            const bannerElem = document.createElement("div");
            bannerElem.style.background = currentTheme.buttonHoverBg;
            bannerElem.style.padding = "8px";
            bannerElem.style.borderRadius = "8px";
            bannerElem.style.margin = "8px 0";
            bannerElem.innerText = bannerText;
            messageElem.appendChild(bannerElem);
          } else {
            const usernameElem = document.createElement("strong");
            usernameElem.innerText = message.username + ": ";
            messageElem.appendChild(usernameElem);
            messageElem.appendChild(document.createTextNode(messageText));
          }
          chatMessages.appendChild(messageElem);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
        cachedMessages = messages;
      })
      .catch((error) => {
        const errorMsg = document.createElement("div");
        errorMsg.style.color = "red";
        errorMsg.innerText = "Error fetching chat history: " + error;
        chatMessages.appendChild(errorMsg);
      });

    // Check how many people are online
    fetch(chatAPI + "online", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      response.json().then((data) => {
        onlineUserCount.innerText = data.online + " users online";
      });
    })
  }, 1000);

  // Send message on button click or Enter key in messageInput
  function sendChatMessage() {
    const username = usernameInput.value.trim() || "Anonymous";
    const message = messageInput.value.trim();
    if (message === "") return;
    const payload = JSON.stringify({ username, message });
    fetch(chatAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
    })
    messageInput.value = "";
  }
  sendButton.addEventListener("click", sendChatMessage);
  messageInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendChatMessage();
    }
  });

  // Fetch the changelog (github commit history)
  let data = [];
  let page = 1;
  async function fetchCommits() {
    const response = await fetch(`https://api.github.com/repos/proplayer919/classtools/commits?page=${page}`);
    const commits = await response.json();
    data.push(...commits);
    if (commits.length === 30) {
      page++;
      await fetchCommits();
    }
  }
  fetchCommits()
    .then(() => {
      data.forEach(commit => {
        let author = commit.commit.author.name;
        let message = commit.commit.message;
        let link = commit.html_url;
        let date = new Date(commit.commit.author.date);
        let locale = navigator.language || 'en-AU';

        // Extract date components manually for full control
        let day = date.getDate().toString().padStart(2, '0');
        let month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
        let year = date.getFullYear();

        let hours = date.getHours();
        let minutes = date.getMinutes().toString().padStart(2, '0');
        let seconds = date.getSeconds().toString().padStart(2, '0');

        // Convert 24-hour time to 12-hour format
        let period = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12; // Converts 0 to 12 for midnight

        // Force dd/mm/yyyy hh:mm:ss AM/PM format for Australian users
        let formattedDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${period}`;

        let commitElem = document.createElement("div");
        commitElem.style.color = currentTheme.buttonText;
        commitElem.style.backgroundColor = currentTheme.contentBg;
        commitElem.style.marginBottom = "4px";
        commitElem.style.padding = "8px";

        commitElem.innerHTML = `
        <a href="${link}" target="_blank" rel="noopener noreferrer" style="color: ${currentTheme.buttonText}; text-decoration: none;">
          <strong>${author}</strong> - ${message} - ${formattedDate}
        </a>
        `;

        changelogContainer.appendChild(commitElem);
      });

      changelogContainer.scrollTop = changelogContainer.scrollHeight;
    })
    .catch((error) => {
      console.error("Error fetching changelog:", error);
    });


  function consolePrint(text) {
    const msgElem = document.createElement("div");
    msgElem.textContent = text;
    msgElem.style.marginBottom = "4px";
    consoleOutput.appendChild(msgElem);
    debouncedScroll();
  }

  // --- Evaluator (Recursive Descent Parser) ---
  const variables = {};
  function evaluate(expression) {
    let index = 0;
    function skipWhitespace() {
      while (index < expression.length && /\s/.test(expression[index])) index++;
    }
    function parseString() {
      if (expression[index] !== '"')
        throw new Error(`Expected string literal at position ${index}`);
      index++;
      let start = index;
      while (index < expression.length && expression[index] !== '"') index++;
      if (index >= expression.length) throw new Error("Unterminated string literal");
      const str = expression.slice(start, index);
      index++;
      return str;
    }
    function parseNumber() {
      skipWhitespace();
      let start = index;
      while (
        index < expression.length &&
        (/\d/.test(expression[index]) || expression[index] === ".")
      )
        index++;
      if (start === index)
        throw new Error(`Expected number at position ${index}`);
      return parseFloat(expression.slice(start, index));
    }
    function parseIdentifier() {
      skipWhitespace();
      let start = index;
      while (index < expression.length && /[a-zA-Z_]/.test(expression[index])) index++;
      if (start === index)
        throw new Error(`Expected identifier at position ${index}`);
      return expression.slice(start, index);
    }
    const helpMessages = {
      round: "round(x): Rounds x to the nearest integer.",
      roundToDecimalPlace:
        "roundToDecimalPlace(x, d): Rounds x to d decimal places.",
      sprt: "sprt(x) or sqrt(x): Returns the square root of x.",
      sqrt: "sqrt(x): Returns the square root of x.",
      pow: "pow(x, y): Returns x raised to the power of y.",
      sin: "sin(x): Returns the sine of x (in radians).",
      cos: "cos(x): Returns the cosine of x (in radians).",
      tan: "tan(x): Returns the tangent of x (in radians).",
      abs: "abs(x): Returns the absolute value of x.",
      floor: "floor(x): Returns the largest integer ≤ x.",
      ceil: "ceil(x): Returns the smallest integer ≥ x.",
      exp: "exp(x): Returns e raised to the power of x.",
      log: "log(x): Returns the natural logarithm of x.",
      log10: "log10(x): Returns the base-10 logarithm of x.",
      max: "max(x, y, ...): Returns the largest of the provided values.",
      min: "min(x, y, ...): Returns the smallest of the provided values.",
      asin: "asin(x): Returns the arcsine of x (in radians).",
      acos: "acos(x): Returns the arccosine of x (in radians).",
      atan: "atan(x): Returns the arctangent of x (in radians).",
      rand: "rand(): Returns a random number between 0 and 1.",
      cbrt: "cbrt(x): Returns the cube root of x.",
      fact: "fact(n): Returns the factorial of n.",
      help: "help(): Lists available functions. help(func) or help('funcName'): Shows help for that function.",
      clear: "clear(): Clears the console output.",
      print: "print(...args): Prints the provided arguments to the console.",
      version: "version(): Prints the version number.",
    };
    const functions = {
      round: Math.round,
      roundToDecimalPlace: (x, d) =>
        Math.round(x * Math.pow(10, d)) / Math.pow(10, d),
      sprt: Math.sqrt,
      sqrt: Math.sqrt,
      pow: Math.pow,
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      abs: Math.abs,
      floor: Math.floor,
      ceil: Math.ceil,
      exp: Math.exp,
      log: Math.log,
      log10: Math.log10 || ((x) => Math.log(x) / Math.LN10),
      max: Math.max,
      min: Math.min,
      asin: Math.asin,
      acos: Math.acos,
      atan: Math.atan,
      rand: Math.random,
      cbrt: Math.cbrt || ((x) => Math.pow(x, 1 / 3)),
      fact: function (n) {
        if (n < 0) return NaN;
        if (n === 0) return 1;
        let result = 1;
        for (let i = 1; i <= n; i++) result *= i;
        return result;
      },
      help: function (arg) {
        if (arguments.length === 0) {
          const keys = Object.keys(helpMessages).sort();
          const msg =
            "Available functions:\n" +
            keys.map((k) => k + ": " + helpMessages[k]).join("\n");
          consolePrint(msg);
        } else {
          let key;
          if (typeof arg === "string") key = arg;
          else {
            key = null;
            for (let k in functions) {
              if (functions[k] === arg) {
                key = k;
                break;
              }
            }
            if (!key) key = arg.toString();
          }
          if (helpMessages[key]) consolePrint(helpMessages[key]);
          else consolePrint("No help available for: " + key);
        }
      },
      clear: function () {
        consoleOutput.innerHTML = "";
      },
      print: function (...args) {
        consolePrint(args.join(" "));
      },
      version: function () {
        consolePrint("ClassHub v" + version);
      },
    };
    function parseFactor() {
      skipWhitespace();
      if (expression[index] === '"') return parseString();
      if (expression[index] === "+") {
        index++;
        return parseFactor();
      }
      if (expression[index] === "-") {
        index++;
        return -parseFactor();
      }
      if (index < expression.length && /[a-zA-Z_]/.test(expression[index])) {
        let id = parseIdentifier();
        skipWhitespace();
        if (expression[index] === "(") {
          index++;
          let args = [];
          skipWhitespace();
          if (expression[index] !== ")") {
            args.push(parseExpression());
            skipWhitespace();
            while (expression[index] === ",") {
              index++;
              args.push(parseExpression());
              skipWhitespace();
            }
          }
          if (expression[index] !== ")")
            throw new Error(`Expected ')' at position ${index}`);
          index++;
          let func = functions[id];
          if (!func) throw new Error("Unknown function: " + id);
          return func.apply(null, args);
        } else {
          if (variables.hasOwnProperty(id)) return variables[id];
          else if (functions.hasOwnProperty(id)) return functions[id];
          else throw new Error("Unknown identifier: " + id);
        }
      }
      if (expression[index] === "(") {
        index++;
        let value = parseExpression();
        skipWhitespace();
        if (expression[index] !== ")")
          throw new Error(`Expected ')' at position ${index}`);
        index++;
        return value;
      }
      return parseNumber();
    }
    function parseTerm() {
      let value = parseFactor();
      skipWhitespace();
      while (
        index < expression.length &&
        (expression[index] === "*" ||
          expression[index] === "/" ||
          expression[index] === "%")
      ) {
        let op = expression[index++];
        let nextFactor = parseFactor();
        if (op === "*") value *= nextFactor;
        else if (op === "/") value /= nextFactor;
        else if (op === "%") value %= nextFactor;
        skipWhitespace();
      }
      return value;
    }
    function parseExpression() {
      let value = parseTerm();
      skipWhitespace();
      while (
        index < expression.length &&
        (expression[index] === "+" || expression[index] === "-")
      ) {
        let op = expression[index++];
        let nextTerm = parseTerm();
        if (op === "+") value += nextTerm;
        else value -= nextTerm;
        skipWhitespace();
      }
      return value;
    }
    function parseStatement() {
      skipWhitespace();
      let start = index;
      try {
        let id = parseIdentifier();
        skipWhitespace();
        if (expression[index] === "=") {
          index++;
          let value = parseExpression();
          variables[id] = value;
          return value;
        } else {
          index = start;
          return parseExpression();
        }
      } catch (e) {
        index = start;
        return parseExpression();
      }
    }
    let result = parseStatement();
    skipWhitespace();
    if (index < expression.length)
      throw new Error("Unexpected character at position " + index);
    return result;
  }

  // --- Draggable & Resizable Functionality ---
  let isDragging = false,
    dragOffsetX = 0,
    dragOffsetY = 0;
  let isResizing = false,
    resizeStartWidth = 0,
    resizeStartHeight = 0,
    resizeStartX = 0,
    resizeStartY = 0;

  function onDragMouseMove(e) {
    if (isDragging) {
      consoleWindow.style.left = e.clientX - dragOffsetX + "px";
      consoleWindow.style.top = e.clientY - dragOffsetY + "px";
    }
  }
  function onDragMouseUp() {
    isDragging = false;
  }
  function onResizeMouseMove(e) {
    if (isResizing) {
      let newWidth = resizeStartWidth + (e.clientX - resizeStartX);
      let newHeight = resizeStartHeight + (e.clientY - resizeStartY);
      consoleWindow.style.width = newWidth + "px";
      let headerHeight = header.offsetHeight;
      let tabBarHeight = tabBar.offsetHeight;
      consoleWindow.style.height = newHeight + "px";
      tabContentContainer.style.height =
        newHeight - headerHeight - tabBarHeight - 16 + "px";
    }
  }
  function onResizeMouseUp() {
    isResizing = false;
  }
  function onHeaderMouseDown(e) {
    isDragging = true;
    dragOffsetX = e.clientX - consoleWindow.offsetLeft;
    dragOffsetY = e.clientY - consoleWindow.offsetTop;
  }
  function onHeaderTouchStart(e) {
    isDragging = true;
    let touch = e.touches[0];
    dragOffsetX = touch.clientX - consoleWindow.offsetLeft;
    dragOffsetY = touch.clientY - consoleWindow.offsetTop;
    e.preventDefault();
  }
  header.addEventListener("mousedown", onHeaderMouseDown);
  header.addEventListener("touchstart", onHeaderTouchStart);
  document.addEventListener("mousemove", onDragMouseMove);
  document.addEventListener("mouseup", onDragMouseUp);
  document.addEventListener("touchmove", function (e) {
    if (isDragging) {
      let touch = e.touches[0];
      consoleWindow.style.left = touch.clientX - dragOffsetX + "px";
      consoleWindow.style.top = touch.clientY - dragOffsetY + "px";
      e.preventDefault();
    }
  });
  document.addEventListener("touchend", function () {
    isDragging = false;
  });
  document.addEventListener("mousemove", onResizeMouseMove);
  document.addEventListener("mouseup", onResizeMouseUp);

  // --- Keyboard Shortcuts ---
  function onHeaderKeyDown(e) {
    if (e.key.toLowerCase() === "h") {
      consoleWindow.style.display =
        consoleWindow.style.display === "none" ? "block" : "none";
      e.preventDefault();
    }
    if (e.ctrlKey && e.key.toLowerCase() === "l") {
      consoleOutput.innerHTML = "";
      e.preventDefault();
    }
  }
  header.addEventListener("keydown", onHeaderKeyDown);
  document.addEventListener("keydown", function (e) {
    if (
      !(document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement) &&
      e.key.toLowerCase() === "h"
    ) {
      consoleWindow.style.display =
        consoleWindow.style.display === "none" ? "block" : "none";
      e.preventDefault();
    }
  });

  // --- Command History ---
  const commandHistory = [];
  let historyIndex = -1;
  function onConsoleInputKeyDown(e) {
    if (e.key === "ArrowUp") {
      if (commandHistory.length > 0) {
        historyIndex =
          historyIndex <= 0 ? commandHistory.length - 1 : historyIndex - 1;
        consoleInput.value = commandHistory[historyIndex];
        e.preventDefault();
      }
    } else if (e.key === "ArrowDown") {
      if (commandHistory.length > 0) {
        historyIndex =
          historyIndex >= commandHistory.length - 1 ? 0 : historyIndex + 1;
        consoleInput.value = commandHistory[historyIndex];
        e.preventDefault();
      }
    }
  }
  consoleInput.addEventListener("keydown", onConsoleInputKeyDown);

  // --- Handle Command Input ---
  consoleInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const command = consoleInput.value;
      if (command.trim() === "") return;
      consolePrint("> " + command);
      commandHistory.push(command);
      historyIndex = commandHistory.length;
      consoleInput.value = "";
      let startTime = performance.now();
      try {
        let result = evaluate(command);
        if (typeof result !== "undefined") consolePrint("= " + result);
      } catch (err) {
        consolePrint("Error: " + err.message);
      }
      if (showExecutionTime) {
        let endTime = performance.now();
        consolePrint("(Evaluated in " + (endTime - startTime).toFixed(2) + "ms)");
      }
    }
  });

  // --- Load Plugin Links ---
  async function loadPluginLinks() {
    try {
      const linksResponse = await fetch(
        "https://api.github.com/repos/proplayer919/classtools/contents/plugins"
      );
      if (!linksResponse.ok) throw new Error("Failed to load plugins list");
      const linksData = await linksResponse.json();
      const categories = linksData.filter(
        (entry) => entry.type === "dir"
      );
      for (const category of categories) {
        const categoryLinksResponse = await fetch(
          `https://api.github.com/repos/proplayer919/classtools/contents/plugins/${category.name}`
        );
        if (!categoryLinksResponse.ok)
          throw new Error(`Failed to load ${category.name}`);
        const categoryLinksData = await categoryLinksResponse.json();
        const categoryLinks = categoryLinksData.filter(
          (entry) => entry.name.endsWith(".js")
        );
        const categoryDiv = document.createElement("div");
        categoryDiv.className = "category";
        const categoryName = document.createElement("h3");
        categoryName.innerText = category.name;
        categoryDiv.appendChild(categoryName);
        const categoryLinksContainer = document.createElement("div");
        categoryLinksContainer.className = "category-links";
        for (const entry of categoryLinks) {
          const urlResponse = await fetch(
            `https://raw.githubusercontent.com/proplayer919/classtools/main/plugins/${category.name}/${entry.name}`
          );
          if (!urlResponse.ok)
            throw new Error(`Failed to load ${entry.name}`);
          const scriptCode = await urlResponse.text();
          const lines = scriptCode.split("\n");
          const name = lines[0].replace("//", "").trim();
          const btn = document.createElement("button");
          btn.innerText = name;
          // Using new Function instead of eval (note: consider a sandbox for production)
          btn.addEventListener("click", () => {
            try {
              new Function(scriptCode)();
            } catch (error) {
              consolePrint("Error executing plugin: " + error.message);
            }
          });
          categoryLinksContainer.appendChild(btn);
        }
        categoryDiv.appendChild(categoryLinksContainer);
        pluginLinksContainer.appendChild(categoryDiv);
      }
    } catch (error) {
      console.error(error);
      const errorMsg = document.createElement("div");
      errorMsg.innerText = "Error loading plugins.";
      pluginLinksContainer.appendChild(errorMsg);
    }
  }
  loadPluginLinks();

  // --- Settings ---
  settingCheckbox.addEventListener("change", function () {
    showExecutionTime = this.checked;
    consolePrint(
      "Flag 'flag.showExecutionTime' " +
      (showExecutionTime ? "enabled" : "disabled")
    );
  });
  settingInput.addEventListener("input", function () {
    title.innerText =
      this.value.trim() !== ""
        ? this.value + " - Made by proplayer919 (Version " + version + ")"
        : "ClassHub - Made by proplayer919 (Version " + version + ")";
  });

  // --- Minimize & Close ---
  minimizeButton.addEventListener("click", function () {
    consoleContainer.style.display =
      consoleContainer.style.display === "none" ? "block" : "none";
  });
  function cleanup() {
    // Remove event listeners by referring to the named functions
    header.removeEventListener("mousedown", onHeaderMouseDown);
    header.removeEventListener("touchstart", onHeaderTouchStart);
    document.removeEventListener("mousemove", onDragMouseMove);
    document.removeEventListener("mouseup", onDragMouseUp);
    document.removeEventListener("touchmove", onHeaderTouchStart);
    document.removeEventListener("touchend", function () {
      isDragging = false;
    });
    document.removeEventListener("mousemove", onResizeMouseMove);
    document.removeEventListener("mouseup", onResizeMouseUp);
    header.removeEventListener("keydown", onHeaderKeyDown);
    consoleInput.removeEventListener("keydown", onConsoleInputKeyDown);
    consoleWindow.remove();

    clearInterval(intervalId);
  }
  closeButton.addEventListener("click", cleanup);

  // --- Initial Console Message ---
  consolePrint(
    "Use 'help()' to see available functions. Use 'help(function)' for specific help."
  );

  // --- Blacklisted Sites ---
  const blacklistedSites = [
    "essentialassessment.com.au",
    "www.essentialassessment.com.au",
    "acer.edu.au",
    "www.acer.edu.au",
    "alo.acadiencelearning.org",
    "www.alo.acadiencelearning.org"
  ];
  const currentSite = window.location.hostname;
  if (blacklistedSites.includes(currentSite)) {
    document.body.innerHTML =
      "<h1 style='text-align:center; font-size:3em; margin-top:20%;'>Nice try!</h1>";
    document.title = "Nice try!";
  }

  const agreeMessage = 'DISCLAIMER: Use of this software is your own liability, we are not responsible for any actions taken against you for use of this software.';
  const agree = confirm(agreeMessage);
  if (!agree) {
    document.body.innerHTML =
      "<h1 style='text-align:center; font-size:3em; margin-top:20%;'>Access Blocked</h1>";
    document.title = "Access Blocked";
  }
})();
