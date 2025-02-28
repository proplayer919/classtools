// --- Global Flags ---
let showExecutionTime = false

// --- Utility: Debounce Function ---
/**
 * Returns a debounced version of the given function.
 * @param {Function} func - The function to debounce.
 * @param {number} wait - The number of milliseconds to delay.
 * @returns {Function}
 */
const debounce = (func, wait) => {
  let timeout
  return function (...args) {
    clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// --- Dynamic Theme Management ---
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
}

/**
 * Determines the current theme based on OS preferences.
 * @returns {Object} - The theme color set.
 */
function getCurrentTheme() {
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? themeColors.dark
    : themeColors.light
}
const currentColors = getCurrentTheme()

// --- Main Container (Draggable & Resizable Window) ---
const consoleWindow = document.createElement("div")
consoleWindow.setAttribute("role", "dialog")
consoleWindow.setAttribute("aria-label", "Interactive Console App")
consoleWindow.style.position = "fixed"
consoleWindow.style.width = "600px"
consoleWindow.style.top = "100px"
consoleWindow.style.left = "100px"
consoleWindow.style.boxShadow = "0 0 15px rgba(0,0,0,0.6)"
consoleWindow.style.borderRadius = "8px"
consoleWindow.style.zIndex = "10000"
consoleWindow.style.fontFamily = "Arial, sans-serif"

const consoleWindowWithoutHeader = document.createElement("div")
consoleWindowWithoutHeader.style.height = "500px"
consoleWindowWithoutHeader.style.border = "1px solid " + currentColors.border
consoleWindowWithoutHeader.style.backgroundColor = currentColors.windowBg
consoleWindowWithoutHeader.style.display = "flex"
consoleWindowWithoutHeader.style.flexDirection = "column"
consoleWindowWithoutHeader.style.userSelect = "none"
consoleWindowWithoutHeader.style.overflow = "hidden"

// --- Header (Draggable Area & Window Controls) ---
const header = document.createElement("div")
header.setAttribute("role", "banner")
header.tabIndex = 0
header.style.backgroundColor = currentColors.headerBg
header.style.color = currentColors.headerText
header.style.padding = "8px 10px"
header.style.cursor = "move"
header.style.display = "flex"
header.style.justifyContent = "space-between"
header.style.alignItems = "center"
header.style.borderTopLeftRadius = "8px"
header.style.borderTopRightRadius = "8px"

const title = document.createElement("span")
title.innerText = "ClassHub - Made by proplayer919"
title.style.userSelect = "none"

// Header Buttons (Minimize & Close)
const headerButtons = document.createElement("div")
function styleButton(btn) {
  btn.style.backgroundColor = currentColors.buttonBg
  btn.style.color = currentColors.buttonText
  btn.style.border = "none"
  btn.style.padding = "4px 8px"
  btn.style.marginLeft = "4px"
  btn.style.borderRadius = "4px"
  btn.style.cursor = "pointer"
  btn.style.fontSize = "12px"
  btn.addEventListener("mouseenter", () => {
    btn.style.backgroundColor = currentColors.buttonHoverBg
  })
  btn.addEventListener("mouseleave", () => {
    btn.style.backgroundColor = currentColors.buttonBg
  })
}
const minimizeButton = document.createElement("button")
minimizeButton.innerText = "_"
minimizeButton.setAttribute("aria-label", "Minimize app")
styleButton(minimizeButton)
const closeButton = document.createElement("button")
closeButton.innerText = "X"
closeButton.setAttribute("aria-label", "Close app")
styleButton(closeButton)
headerButtons.appendChild(minimizeButton)
headerButtons.appendChild(closeButton)
header.appendChild(title)
header.appendChild(headerButtons)

// --- Tab Bar ---
const tabBar = document.createElement("div")
tabBar.style.display = "flex"
tabBar.style.backgroundColor = currentColors.headerBg
const tabs = ["Console", "Plugins", "Settings"]
const tabButtons = {}
tabs.forEach((tabName) => {
  const btn = document.createElement("button")
  btn.innerText = tabName
  btn.setAttribute("data-tab", tabName.toLowerCase())
  btn.style.flex = "1"
  btn.style.padding = "8px"
  btn.style.cursor = "pointer"
  btn.style.backgroundColor = currentColors.headerBg
  btn.style.border = "none"
  btn.style.color = currentColors.headerText
  btn.addEventListener("click", () => switchTab(tabName.toLowerCase()))
  tabButtons[tabName.toLowerCase()] = btn
  tabBar.appendChild(btn)
})

// --- Tab Content Container ---
const tabContentContainer = document.createElement("div")
tabContentContainer.style.flex = "1"
tabContentContainer.style.overflow = "auto"

// --- Tab: Console ---
const tabConsole = document.createElement("div")
tabConsole.id = "tabConsole"
const consoleContent = document.createElement("div")
consoleContent.style.padding = "8px"
consoleContent.style.height = "100%"
consoleContent.style.overflow = "auto"
consoleContent.style.backgroundColor = currentColors.contentBg

const consoleOutput = document.createElement("div")
consoleOutput.style.fontFamily = "monospace"
consoleOutput.style.fontSize = "13px"
consoleOutput.style.whiteSpace = "pre-wrap"
consoleOutput.style.marginBottom = "6px"
consoleOutput.style.color = currentColors.outputText

const consoleInput = document.createElement("input")
consoleInput.type = "text"
consoleInput.setAttribute("aria-label", "Command input")
consoleInput.style.width = "100%"
consoleInput.style.boxSizing = "border-box"
consoleInput.style.padding = "6px"
consoleInput.style.border = "1px solid " + currentColors.border
consoleInput.style.borderRadius = "4px"
consoleInput.style.backgroundColor = currentColors.inputBg
consoleInput.style.color = currentColors.inputText
consoleInput.placeholder = "Enter command..."

consoleContent.appendChild(consoleOutput)
consoleContent.appendChild(consoleInput)
tabConsole.appendChild(consoleContent)

// --- Tab: Plugins ---
const tabPlugins = document.createElement("div")
tabPlugins.id = "tabPlugins"
tabPlugins.style.padding = "16px"
const pluginLinksContainer = document.createElement("div")
pluginLinksContainer.style.display = "flex"
pluginLinksContainer.style.flexWrap = "wrap"
pluginLinksContainer.style.gap = "8px"
tabPlugins.appendChild(pluginLinksContainer)

// --- Tab: Settings ---
const tabSettings = document.createElement("div")
tabSettings.id = "tabSettings"
tabSettings.style.padding = "16px"
// Setting for Show Execution Time.
const settingCheckboxLabel = document.createElement("label")
const settingCheckbox = document.createElement("input")
settingCheckbox.type = "checkbox"
settingCheckbox.id = "enableFeature"
settingCheckboxLabel.innerText = " Show Execution Time "
settingCheckboxLabel.appendChild(settingCheckbox)
settingCheckboxLabel.style.color = currentColors.buttonText

// Setting for Title.
const settingInputLabel = document.createElement("label")
settingInputLabel.style.display = "block"
settingInputLabel.style.marginTop = "12px"
settingInputLabel.style.color = currentColors.buttonText
settingInputLabel.innerText = "Custom Title:"
const settingInput = document.createElement("input")
settingInput.type = "text"
settingInput.style.marginLeft = "8px"
settingInputLabel.appendChild(settingInput)

// Info
const infoText = document.createElement("p")
infoText.innerText =
  "Copyright (c) proplayer919 2025. All rights reserved. Version 1.1."
infoText.style.color = currentColors.buttonText

tabSettings.appendChild(settingCheckboxLabel)
tabSettings.appendChild(settingInputLabel)
tabSettings.appendChild(infoText)

// --- Assemble Tab Panels ---
tabContentContainer.appendChild(tabConsole)
tabContentContainer.appendChild(tabPlugins)
tabContentContainer.appendChild(tabSettings)

// --- Assemble Main Container ---
consoleWindow.appendChild(header)
consoleWindowWithoutHeader.appendChild(tabBar)
consoleWindowWithoutHeader.appendChild(tabContentContainer)

// --- Resizer Element ---
const resizer = document.createElement("div")
resizer.style.width = "16px"
resizer.style.height = "16px"
resizer.style.background = "transparent"
resizer.style.position = "absolute"
resizer.style.right = "0"
resizer.style.bottom = "0"
resizer.style.cursor = "se-resize"
consoleWindow.appendChild(resizer)

consoleWindow.appendChild(consoleWindowWithoutHeader)

document.body.appendChild(consoleWindow)

// --- Tab Switching Functionality ---
function switchTab(tabName) {
  tabConsole.style.display = tabName === "console" ? "block" : "none"
  tabPlugins.style.display = tabName === "plugins" ? "block" : "none"
  tabSettings.style.display = tabName === "settings" ? "block" : "none"
  Object.keys(tabButtons).forEach((key) => {
    tabButtons[key].style.borderBottom =
      key === tabName ? "2px solid " + currentColors.buttonHoverBg : "none"
  })
}
switchTab("console")

// --- Dynamic Theme Update ---
function updateTheme() {
  const theme = getCurrentTheme()
  consoleWindow.style.backgroundColor = theme.windowBg
  consoleWindow.style.border = "1px solid " + theme.border
  header.style.backgroundColor = theme.headerBg
  header.style.color = theme.headerText
  tabBar.style.backgroundColor = theme.headerBg
  Object.keys(tabButtons).forEach((key) => {
    tabButtons[key].style.backgroundColor = theme.headerBg
    tabButtons[key].style.color = theme.headerText
  })
  consoleContent.style.backgroundColor = theme.contentBg
  consoleOutput.style.color = theme.outputText
  consoleInput.style.backgroundColor = theme.inputBg
  consoleInput.style.color = theme.inputText
  consoleInput.style.border = "1px solid " + theme.border
}
const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
mediaQuery.addEventListener("change", updateTheme)

// --- Debounced Auto-Scroll for Console Output ---
const debouncedScroll = debounce(() => {
  consoleOutput.scrollTop = consoleOutput.scrollHeight
}, 50)

/**
 * Appends text to the console output.
 * @param {string} text - The text to print.
 */
function consolePrint(text) {
  const msgElem = document.createElement("div")
  msgElem.textContent = text
  msgElem.style.marginBottom = "4px"
  consoleOutput.appendChild(msgElem)
  debouncedScroll()
}

// --- Evaluator (Recursive Descent Parser) ---
const variables = {}
function evaluate(expression) {
  let index = 0
  const skipWhitespace = () => {
    while (index < expression.length && /\s/.test(expression[index])) {
      index++
    }
  }
  function parseString() {
    if (expression[index] !== '"') {
      throw new Error(`Expected string literal at position ${index}`)
    }
    index++
    let start = index
    while (index < expression.length && expression[index] !== '"') {
      index++
    }
    if (index >= expression.length)
      throw new Error("Unterminated string literal")
    const str = expression.slice(start, index)
    index++
    return str
  }
  function parseNumber() {
    skipWhitespace()
    let start = index
    while (
      index < expression.length &&
      (/\d/.test(expression[index]) || expression[index] === ".")
    ) {
      index++
    }
    if (start === index) throw new Error(`Expected number at position ${index}`)
    return parseFloat(expression.slice(start, index))
  }
  function parseIdentifier() {
    skipWhitespace()
    let start = index
    while (index < expression.length && /[a-zA-Z_]/.test(expression[index])) {
      index++
    }
    if (start === index)
      throw new Error(`Expected identifier at position ${index}`)
    return expression.slice(start, index)
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
  }
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
      if (n < 0) return NaN
      if (n === 0) return 1
      let result = 1
      for (let i = 1; i <= n; i++) result *= i
      return result
    },
    help: function (arg) {
      if (arguments.length === 0) {
        const keys = Object.keys(helpMessages).sort()
        const msg =
          "Available functions:\n" +
          keys.map((k) => k + ": " + helpMessages[k]).join("\n")
        consolePrint(msg)
      } else {
        let key
        if (typeof arg === "string") {
          key = arg
        } else {
          key = null
          for (let k in functions) {
            if (functions[k] === arg) {
              key = k
              break
            }
          }
          if (!key) key = arg.toString()
        }
        if (helpMessages[key]) consolePrint(helpMessages[key])
        else consolePrint("No help available for: " + key)
      }
    },
    clear: function () {
      consoleOutput.innerHTML = ""
    },
    print: function (...args) {
      consolePrint(args.join(" "))
    },
  }
  function parseFactor() {
    skipWhitespace()
    if (expression[index] === '"') return parseString()
    if (expression[index] === "+") {
      index++
      return parseFactor()
    }
    if (expression[index] === "-") {
      index++
      return -parseFactor()
    }
    if (index < expression.length && /[a-zA-Z_]/.test(expression[index])) {
      let id = parseIdentifier()
      skipWhitespace()
      if (expression[index] === "(") {
        index++
        let args = []
        skipWhitespace()
        if (expression[index] !== ")") {
          args.push(parseExpression())
          skipWhitespace()
          while (expression[index] === ",") {
            index++
            args.push(parseExpression())
            skipWhitespace()
          }
        }
        if (expression[index] !== ")")
          throw new Error(`Expected ')' at position ${index}`)
        index++
        let func = functions[id]
        if (!func) throw new Error("Unknown function: " + id)
        return func.apply(null, args)
      } else {
        if (variables.hasOwnProperty(id)) return variables[id]
        else if (functions.hasOwnProperty(id)) return functions[id]
        else throw new Error("Unknown identifier: " + id)
      }
    }
    if (expression[index] === "(") {
      index++
      let value = parseExpression()
      skipWhitespace()
      if (expression[index] !== ")")
        throw new Error(`Expected ')' at position ${index}`)
      index++
      return value
    }
    return parseNumber()
  }
  function parseTerm() {
    let value = parseFactor()
    skipWhitespace()
    while (
      index < expression.length &&
      (expression[index] === "*" ||
        expression[index] === "/" ||
        expression[index] === "%")
    ) {
      let op = expression[index++]
      let nextFactor = parseFactor()
      if (op === "*") value *= nextFactor
      else if (op === "/") value /= nextFactor
      else if (op === "%") value %= nextFactor
      skipWhitespace()
    }
    return value
  }
  function parseExpression() {
    let value = parseTerm()
    skipWhitespace()
    while (
      index < expression.length &&
      (expression[index] === "+" || expression[index] === "-")
    ) {
      let op = expression[index++]
      let nextTerm = parseTerm()
      if (op === "+") value += nextTerm
      else value -= nextTerm
      skipWhitespace()
    }
    return value
  }
  function parseStatement() {
    skipWhitespace()
    let start = index
    try {
      let id = parseIdentifier()
      skipWhitespace()
      if (expression[index] === "=") {
        index++
        let value = parseExpression()
        variables[id] = value
        return value
      } else {
        index = start
        return parseExpression()
      }
    } catch (e) {
      index = start
      return parseExpression()
    }
  }
  let result = parseStatement()
  skipWhitespace()
  if (index < expression.length)
    throw new Error("Unexpected character at position " + index)
  return result
}

// --- Draggable and Resizable Functionality ---
let isDragging = false,
  dragOffsetX = 0,
  dragOffsetY = 0
let isResizing = false,
  resizeStartWidth = 0,
  resizeStartHeight = 0,
  resizeStartX = 0,
  resizeStartY = 0

const dragMouseMove = (e) => {
  if (isDragging) {
    consoleWindow.style.left = e.clientX - dragOffsetX + "px"
    consoleWindow.style.top = e.clientY - dragOffsetY + "px"
  }
}
const dragMouseUp = () => {
  isDragging = false
}
header.addEventListener("mousedown", (e) => {
  isDragging = true
  dragOffsetX = e.clientX - consoleWindow.offsetLeft
  dragOffsetY = e.clientY - consoleWindow.offsetTop
})
header.addEventListener("touchstart", (e) => {
  isDragging = true
  let touch = e.touches[0]
  dragOffsetX = touch.clientX - consoleWindow.offsetLeft
  dragOffsetY = touch.clientY - consoleWindow.offsetTop
  e.preventDefault()
})
document.addEventListener("mousemove", dragMouseMove)
document.addEventListener("mouseup", dragMouseUp)
document.addEventListener("touchmove", (e) => {
  if (isDragging) {
    let touch = e.touches[0]
    consoleWindow.style.left = touch.clientX - dragOffsetX + "px"
    consoleWindow.style.top = touch.clientY - dragOffsetY + "px"
    e.preventDefault()
  }
})
document.addEventListener("touchend", () => {
  isDragging = false
})

resizer.addEventListener("mousedown", (e) => {
  isResizing = true
  resizeStartWidth = consoleWindow.offsetWidth
  resizeStartHeight = consoleWindow.offsetHeight
  resizeStartX = e.clientX
  resizeStartY = e.clientY
  e.preventDefault()
})
const resizeMouseMove = (e) => {
  if (isResizing) {
    let newWidth = resizeStartWidth + (e.clientX - resizeStartX)
    let newHeight = resizeStartHeight + (e.clientY - resizeStartY)
    consoleWindow.style.width = newWidth + "px"
    let headerHeight = header.offsetHeight
    let tabBarHeight = tabBar.offsetHeight
    consoleWindow.style.height = newHeight + "px"
    tabContentContainer.style.height =
      newHeight - headerHeight - tabBarHeight - 16 + "px"
  }
}
const resizeMouseUp = () => {
  isResizing = false
}
document.addEventListener("mousemove", resizeMouseMove)
document.addEventListener("mouseup", resizeMouseUp)

// --- Keyboard Shortcuts ---
header.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "h") {
    consoleWindow.style.display =
      consoleWindow.style.display === "none" ? "block" : "none"
    e.preventDefault()
  }
  if (e.ctrlKey && e.key.toLowerCase() === "l") {
    consoleOutput.innerHTML = ""
    e.preventDefault()
  }
})
document.addEventListener("keydown", (e) => {
  if (
    !(
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement
    ) &&
    e.key.toLowerCase() === "h"
  ) {
    consoleWindow.style.display =
      consoleWindow.style.display === "none" ? "block" : "none"
    e.preventDefault()
  }
})

// --- Command History for Console ---
const commandHistory = []
let historyIndex = -1
consoleInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    if (commandHistory.length > 0) {
      historyIndex =
        historyIndex <= 0 ? commandHistory.length - 1 : historyIndex - 1
      consoleInput.value = commandHistory[historyIndex]
      e.preventDefault()
    }
  } else if (e.key === "ArrowDown") {
    if (commandHistory.length > 0) {
      historyIndex =
        historyIndex >= commandHistory.length - 1 ? 0 : historyIndex + 1
      consoleInput.value = commandHistory[historyIndex]
      e.preventDefault()
    }
  }
})

// --- Handle Command Input in Console Tab ---
consoleInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const command = consoleInput.value
    if (command.trim() === "") return
    consolePrint("> " + command)
    commandHistory.push(command)
    historyIndex = commandHistory.length
    consoleInput.value = ""
    let startTime = performance.now()
    try {
      let result = evaluate(command)
      if (typeof result !== "undefined") consolePrint("= " + result)
    } catch (err) {
      consolePrint("Error: " + err.message)
    }
    if (showExecutionTime) {
      let endTime = performance.now()
      consolePrint("(Evaluated in " + (endTime - startTime).toFixed(2) + "ms)")
    }
  }
})

// --- Load Links for the Plugins Tab from GitHub ---
async function loadPluginLinks() {
  try {
    const linksResponse = await fetch(
      "https://raw.githubusercontent.com/proplayer919/classtools/main/links.json",
    )
    if (!linksResponse.ok) throw new Error("Failed to load links.json")
    const linksData = await linksResponse.json()
    for (const entry of linksData) {
      const urlResponse = await fetch(
        `https://raw.githubusercontent.com/proplayer919/classtools/main/${entry.link}`,
      )
      if (!urlResponse.ok) throw new Error(`Failed to load ${entry.link}`)
      const scriptCode = await urlResponse.text()
      const btn = document.createElement("button")
      btn.innerText = entry.name
      styleButton(btn)
      btn.addEventListener("click", () => eval(scriptCode))
      pluginLinksContainer.appendChild(btn)
    }
  } catch (error) {
    console.error(error)
    const errorMsg = document.createElement("div")
    errorMsg.innerText = "Error loading links."
    pluginLinksContainer.appendChild(errorMsg)
  }
}
loadPluginLinks()

// --- Settings Functionality ---
// When the "Show execution time" checkbox is toggled, update our flag and log a message.
settingCheckbox.addEventListener("change", function () {
  showExecutionTime = this.checked
  consolePrint(
    "Flag 'flag.showExecutionTime' " +
    (showExecutionTime ? "enabled" : "disabled"),
  )
})
// When the title input changes, update the header title.
settingInput.addEventListener("input", function () {
  title.innerText =
    this.value.trim() !== ""
      ? this.value + " - Made by proplayer919"
      : "ClassHub - Made by proplayer919"
})

// Minimise/Close Functionality
minimizeButton.addEventListener("click", () => {
  if (consoleWindowWithoutHeader.style.display === "none") {
    consoleWindowWithoutHeader.style.display = "block"
  } else {
    consoleWindowWithoutHeader.style.display = "none"
  }
})
closeButton.addEventListener("click", () => {
  consoleWindow.remove()
})

consolePrint(
  "Use 'help()' to see available functions. Use 'help(function)' to get specific help. Check the Google Site for information on how to use ClassScript.",
)

const blacklistedSites = [
  "essentialassessment.com.au",
  "www.essentialassessment.com.au",
]

// Get the current website's hostname
const currentSite = window.location.hostname

// Check if the current site is in the blacklist
if (blacklistedSites.includes(currentSite)) {
  document.body.innerHTML =
    "<h1 style='text-align:center; font-size:3em; margin-top:20%;'>Nice try!</h1>"
  document.title = "Nice try!" // Change the tab title
}