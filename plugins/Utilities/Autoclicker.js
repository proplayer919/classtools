// Autoclicker
(function (x, y) {
  if (window.click) return;
  window.click = true;
  document.body.style.cursor = 'crosshair';
  var cps = prompt('Autoclicker CPS: (Under 200 recommended)');
  if (!cps || isNaN(cps)) {
    alert('You entered something wrong. Try running the plugin again.');
    return end();
  }
  alert('Autoclicker activated at ' + cps + 'CPS! Do [ctrl+e] to stop.');
  addEventListener('mousemove', e => { x = e.clientX, y = e.clientY });
  addEventListener('keydown', e => {
    if (e.key === 'e' && e.ctrlKey) {
      alert('Autoclicker deactivated! Click the plugin again to reactivate!');
      return end();
    }
  });
  var int = null;
  try {
    int = setInterval(function () {
      var e = document.elementFromPoint(x, y);
      if (e) e.click();
    }, 1e3 / cps);
  } catch (err) {
    alert('An error occurred: ' + err.message);
    end();
  }
  function end() {
    clearInterval(int);
    window.click = false;
    document.body.style.cursor = 'default';
  }
})();
