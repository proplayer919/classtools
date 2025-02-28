// Cloak URL
let url = prompt("Enter URL to open without adding to history:")
if (url) {
  w = window.open()
  w.document.body.innerHTML = `<iframe src="${url}" style="width:100%;height:100%;"></iframe>`
}