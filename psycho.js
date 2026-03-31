// Psycho Mantis — typewriter + backspace on menu
// Called every time menu is shown

var initPsychoMantis = (function () {
  var general = [
    "You like to browse... alone, don't you?",
    "I know what you're looking for.",
    "You've been here before.",
    "The screen sees you too.",
    "You hesitated.",
    "You came back.",
    "I wasn't expecting you.",
    "You think you're in control.",
    "Close your eyes. I'm still here.",
    "You blinked.",
    "You're reading this.",
    "So... you're the type who checks every corner.",
    "Your hand moved before you decided.",
    "I know which tab you'll open next.",
    "You don't trust easily. I can tell.",
    "You've done this before. Many times."
  ];

  var fromX = [
    "I see you came from X...",
    "The timeline sent you here.",
    "Still scrolling, aren't you?"
  ];

  var fromGoogle = [
    "You were searching for something...",
    "Google didn't have the answer.",
    "You found it. Or did it find you?"
  ];

  var fromTelegram = [
    "You came from Telegram.",
    "Someone forwarded you here. I know.",
    "Your chat history is showing.",
    "I read the message before you did."
  ];

  var fromWhatsApp = [
    "You came from WhatsApp.",
    "Two blue checkmarks. You opened it.",
    "I was in the group chat.",
    "I read it before you screenshotted."
  ];

  var currentTimeout = null;
  var currentInterval = null;

  return function initPsychoMantis() {
    var el = document.getElementById('menu-psycho');
    if (!el) return;

    // Clear any previous run
    if (currentTimeout) clearTimeout(currentTimeout);
    if (currentInterval) clearInterval(currentInterval);
    el.textContent = '';

    var ref = document.referrer || '';
    var params = new URLSearchParams(window.location.search);
    var from = (params.get('from') || '').toLowerCase();
    var pool = general;

    if (from === 'tg' || /t\.me/i.test(ref)) {
      pool = fromTelegram;
    } else if (from === 'wa' || /whatsapp/i.test(ref)) {
      pool = fromWhatsApp;
    } else if (/x\.com|twitter\.com/i.test(ref)) {
      pool = fromX;
    } else if (/google\./i.test(ref)) {
      pool = fromGoogle;
    }

    var msg = pool[Math.floor(Math.random() * pool.length)];
    var delay = (Math.random() * 2 + 1) * 1000; // 1-3s

    currentTimeout = setTimeout(function () {
      // Typewriter: add chars
      var idx = 0;
      currentInterval = setInterval(function () {
        if (idx < msg.length) {
          el.textContent += msg[idx];
          idx++;
        } else {
          clearInterval(currentInterval);
          // Hold 1.5s then backspace
          currentTimeout = setTimeout(function () {
            currentInterval = setInterval(function () {
              var txt = el.textContent;
              if (txt.length > 0) {
                el.textContent = txt.slice(0, -1);
              } else {
                clearInterval(currentInterval);
                currentInterval = null;
              }
            }, 40);
          }, 1500);
        }
      }, 80);
    }, delay);
  };
})();
