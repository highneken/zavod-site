(function () {
  // DEBUG: always trigger after 5s (revert later)
  // if (localStorage.getItem('zavod_psycho')) return;
  // if (Math.random() > 0.5) return;

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

  var ref = document.referrer || '';
  var pool = general;

  if (/x\.com|twitter\.com/i.test(ref) && Math.random() < 0.3) {
    pool = fromX;
  } else if (/google\./i.test(ref) && Math.random() < 0.3) {
    pool = fromGoogle;
  }

  var msg = pool[Math.floor(Math.random() * pool.length)];
  var delay = 5000; // DEBUG: fixed 5s (original: (Math.random() * 37 + 3) * 1000)

  setTimeout(function () {
    var el = document.getElementById('psycho');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('visible');
    // localStorage.setItem('zavod_psycho', '1'); // DEBUG: disabled

    setTimeout(function () {
      el.classList.remove('visible');
    }, 2200);
  }, delay);
})();
