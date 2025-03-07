// Fake Update
(function () {
    var overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "#FFFFFF";
    overlay.style.opacity = "0.95";
    overlay.style.zIndex = "9999999";

    var dialog = document.createElement("div");
    dialog.style.position = "absolute";
    dialog.style.top = "50%";
    dialog.style.left = "50%";
    dialog.style.transform = "translate(-50%, -50%)";
    dialog.style.width = "450px";
    dialog.style.padding = "20px";
    dialog.style.background = "#FFFFFF";
    dialog.style.border = "1px solid #333333";
    dialog.style.borderRadius = "5px";
    dialog.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
    dialog.style.zIndex = "99999999";

    var title = document.createElement("h1");
    title.innerHTML = "Google Chrome Update";
    title.style.marginTop = "0";
    title.style.textAlign = "center";
    dialog.appendChild(title);

    var message = document.createElement("p");
    message.innerHTML = "Your version of Google Chrome is outdated. Please click the button below to update now.";
    message.style.margin = "20px 0";
    message.style.textAlign = "center";
    dialog.appendChild(message);

    var button = document.createElement("button");
    button.innerHTML = "Update Now";
    button.style.background = "#0078D7";
    button.style.border = "none";
    button.style.color = "#FFFFFF";
    button.style.padding = "10px 20px";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.addEventListener("click", function() {
        window.location.href = "https://google.com/chrome";
    });
    dialog.appendChild(button);

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
})();
