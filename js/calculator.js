// Alumni email cost estimate on /cost-comparison/.
// Per-alumnus rates come from the Forward Email university case study.
// The page shows a static default result, so it works without this script.
(function () {
  'use strict';

  var FORWARD_EMAIL_PER_YEAR = 3000; // Enterprise: $250 per month
  var form = document.getElementById('calc-form');
  if (!form) return;

  var count = document.getElementById('alumni-count');
  var rate = document.getElementById('current-solution');
  var currentCost = document.getElementById('current-cost');
  var newCost = document.getElementById('new-cost');
  var savings = document.getElementById('savings');

  function money(n) {
    return '$' + Math.round(n).toLocaleString('en-US');
  }

  function update() {
    var alumni = Math.max(0, Math.floor(Number(count.value) || 0));
    var current = alumni * Number(rate.value);
    var diff = current - FORWARD_EMAIL_PER_YEAR;
    currentCost.textContent = money(current);
    newCost.textContent = money(FORWARD_EMAIL_PER_YEAR);
    savings.textContent = diff >= 0 ? money(diff) : '-' + money(-diff);
  }

  form.addEventListener('input', update);
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    update();
  });
  update();
})();
