(function() {
  "use strict";

  /* ─── State ─── */
  var genOptions = { upper: true, lower: true, numbers: true, symbols: true, noAmbiguous: false };
  var lastShakeScore = -1;

  /* ─── Common passwords list ─── */
  var COMMON_PATTERNS = [
    'password','123456','12345678','qwerty','abc123','monkey','master',
    'dragon','111111','baseball','iloveyou','trustno1','sunshine',
    'princess','football','shadow','superman','michael','letmein',
    'welcome','admin','login','passw0rd','hello','charlie','donald',
    'password1','qwerty123','1234567890','000000','654321','0987654321',
    'aaaaaaaa','abcdefgh','123123','abcabc','112233'
  ];

  /* ─── Particles ─── */
  var canvas = document.getElementById('particles');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var PARTICLE_COUNT = 35;

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  for (var i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      alpha: Math.random() * 0.3 + 0.1
    });
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.1, p.r), 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(212,168,67,' + p.alpha + ')';
      ctx.fill();
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  /* ─── Build entropy bar blocks ─── */
  var entropyBar = document.getElementById('entropyBar');
  var entropyHTML = '';
  for (var i = 0; i < 24; i++) {
    entropyHTML += '<div class="entropy-block" style="height:4px;background:var(--bg-elevated);"></div>';
  }
  entropyBar.innerHTML = entropyHTML;

  /* ─── Tab switching ─── */
  var tabAnalyze = document.getElementById('tabAnalyze');
  var tabGenerate = document.getElementById('tabGenerate');
  var panelAnalyze = document.getElementById('panelAnalyze');
  var panelGenerate = document.getElementById('panelGenerate');

  function switchTab(tab) {
    if (tab === 'analyze') {
      panelAnalyze.style.display = 'block';
      panelGenerate.style.display = 'none';
      tabAnalyze.classList.add('active');
      tabGenerate.classList.remove('active');
    } else {
      panelAnalyze.style.display = 'none';
      panelGenerate.style.display = 'block';
      tabAnalyze.classList.remove('active');
      tabGenerate.classList.add('active');
      if (!generatedCard.dataset.generated) {
        generatePasswords();
      }
    }
  }

  tabAnalyze.addEventListener('click', function() { switchTab('analyze'); });
  tabGenerate.addEventListener('click', function() { switchTab('generate'); });

  /* ─── Visibility toggle ─── */
  var pwInput = document.getElementById('pwInput');
  var eyeBtn = document.getElementById('eyeBtn');
  var eyeIcon = document.getElementById('eyeIcon');

  eyeBtn.addEventListener('click', function() {
    if (pwInput.type === 'password') {
      pwInput.type = 'text';
      eyeIcon.className = 'fas fa-eye-slash';
    } else {
      pwInput.type = 'password';
      eyeIcon.className = 'fas fa-eye';
    }
  });

  /* ─── Clear button ─── */
  document.getElementById('clearBtn').addEventListener('click', function() {
    pwInput.value = '';
    pwInput.dispatchEvent(new Event('input'));
    pwInput.focus();
  });

  /* ─── Toast ─── */
  var toastEl = document.getElementById('toast');
  var toastMsg = document.getElementById('toastMsg');
  var toastTimeout = null;

  function showToast(msg) {
    toastMsg.textContent = msg;
    toastEl.classList.add('visible');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(function() {
      toastEl.classList.remove('visible');
    }, 2200);
  }

  /* ─── Copy to clipboard ─── */
  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('Copied to clipboard');
      }).catch(function() {
        fallbackCopy(text);
      });
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    document.body.removeChild(ta);
    showToast('Copied to clipboard');
  }

  /* ─── Highlight password characters ─── */
  var highlightedPw = document.getElementById('highlightedPw');

  function highlightPassword(pw) {
    if (!pw) { highlightedPw.innerHTML = ''; return; }
    var html = '';
    for (var i = 0; i < pw.length; i++) {
      var ch = pw[i];
      var cls = 'char-lower';
      if (/[A-Z]/.test(ch)) cls = 'char-upper';
      else if (/[0-9]/.test(ch)) cls = 'char-num';
      else if (/[^a-zA-Z0-9]/.test(ch)) cls = 'char-symbol';
      var safe = ch.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
      html += '<span class="char-span ' + cls + '">' + safe + '</span>';
    }
    highlightedPw.innerHTML = html;
  }

  /* ─── Format time ─── */
  function formatTime(seconds) {
    if (seconds < 0.001) return 'Instant';
    if (seconds < 1) return 'Less than a second';
    if (seconds < 60) return Math.round(seconds) + ' seconds';
    if (seconds < 3600) return Math.round(seconds / 60) + ' minutes';
    if (seconds < 86400) return Math.round(seconds / 3600) + ' hours';
    if (seconds < 86400 * 30) return Math.round(seconds / 86400) + ' days';
    if (seconds < 86400 * 365) return Math.round(seconds / (86400 * 30)) + ' months';
    if (seconds < 86400 * 365 * 1000) return Math.round(seconds / (86400 * 365)) + ' years';
    if (seconds < 86400 * 365 * 1e6) return (seconds / (86400 * 365 * 1000)).toFixed(1) + ' thousand years';
    if (seconds < 86400 * 365 * 1e9) return (seconds / (86400 * 365 * 1e6)).toFixed(1) + ' million years';
    if (seconds < 86400 * 365 * 1e12) return (seconds / (86400 * 365 * 1e9)).toFixed(1) + ' billion years';
    return 'Trillions+ of years';
  }

  /* ─── Core analysis ─── */
  function analyzePassword(pw) {
    if (!pw) return null;

    var len = pw.length;
    var hasUpper = /[A-Z]/.test(pw);
    var hasLower = /[a-z]/.test(pw);
    var hasNum = /[0-9]/.test(pw);
    var hasSymbol = /[^a-zA-Z0-9]/.test(pw);

    var charsetSize = 0;
    if (hasUpper) charsetSize += 26;
    if (hasLower) charsetSize += 26;
    if (hasNum) charsetSize += 10;
    if (hasSymbol) charsetSize += 33;

    var entropy = len > 0 ? Math.log2(Math.pow(Math.max(1, charsetSize), len)) : 0;

    var isCommon = false;
    for (var i = 0; i < COMMON_PATTERNS.length; i++) {
      if (COMMON_PATTERNS[i] === pw.toLowerCase()) { isCommon = true; break; }
    }

    var criteria = [
      { label: 'At least 8 characters', met: len >= 8 },
      { label: 'At least 12 characters', met: len >= 12 },
      { label: 'At least 16 characters', met: len >= 16 },
      { label: 'Contains uppercase letters', met: hasUpper },
      { label: 'Contains lowercase letters', met: hasLower },
      { label: 'Contains numbers', met: hasNum },
      { label: 'Contains special symbols', met: hasSymbol },
      { label: 'Not a common password', met: !isCommon },
      { label: 'No excessive character repetition', met: !/(.)\1{2,}/.test(pw) },
      { label: 'No simple sequences (abc, 123)', met: !/(?:abc|bcd|cde|def|efg|012|123|234|345|456|567|678|789)/i.test(pw) }
    ];

    var metCount = 0;
    for (var i = 0; i < criteria.length; i++) {
      if (criteria[i].met) metCount++;
    }

    var score = 0;
    score += Math.min(25, len * 1.8);
    if (hasUpper) score += 10;
    if (hasLower) score += 10;
    if (hasNum) score += 10;
    if (hasSymbol) score += 15;
    score += metCount * 2;

    if (isCommon) score = Math.min(score, 10);
    if (/(.)\1{2,}/.test(pw)) score -= 10;
    if (/(?:abc|bcd|cde|def|012|123|234|345|456|567|678|789)/i.test(pw)) score -= 8;
    if (len < 6) score = Math.min(score, 15);

    score = Math.max(0, Math.min(100, Math.round(score)));

    var guessesPerSec = 1e10;
    var totalCombinations = Math.pow(Math.max(1, charsetSize), len);
    var secondsToCrack = totalCombinations / guessesPerSec / 2;
    var crackTimeStr = formatTime(secondsToCrack);

    var level, color, colorDim;
    if (score < 20) { level = 'Very Weak'; color = '#e05252'; colorDim = 'rgba(224,82,82,0.12)'; }
    else if (score < 40) { level = 'Weak'; color = '#f97316'; colorDim = 'rgba(249,115,22,0.12)'; }
    else if (score < 60) { level = 'Fair'; color = '#e0a852'; colorDim = 'rgba(224,168,82,0.12)'; }
    else if (score < 80) { level = 'Strong'; color = '#84cc16'; colorDim = 'rgba(132,204,22,0.12)'; }
    else { level = 'Excellent'; color = '#4ade80'; colorDim = 'rgba(74,222,128,0.12)'; }

    var tips = [];
    if (len < 12) tips.push('Increase length to at least 12 characters for better security.');
    if (len < 16) tips.push('Consider 16+ characters for maximum protection against brute force.');
    if (!hasUpper) tips.push('Add uppercase letters to increase the character pool.');
    if (!hasLower) tips.push('Add lowercase letters for a more balanced character set.');
    if (!hasNum) tips.push('Include numbers to boost entropy.');
    if (!hasSymbol) tips.push('Special symbols (!@#$%...) dramatically increase strength.');
    if (isCommon) tips.push('This is a commonly used password — it will be cracked instantly.');
    if (/(.)\1{2,}/.test(pw)) tips.push('Avoid repeating the same character 3+ times in a row.');
    if (/(?:abc|bcd|cde|def|012|123|234|345|456|567|678|789)/i.test(pw)) tips.push('Avoid simple alphabetical or numerical sequences.');
    if (score >= 80) tips.push('Great password! Make sure to store it in a reputable password manager.');

    return { score: score, level: level, color: color, colorDim: colorDim, entropy: entropy, crackTimeStr: crackTimeStr, criteria: criteria, tips: tips };
  }

  /* ─── Update UI ─── */
  var strengthFill = document.getElementById('strengthFill');
  var strengthLabel = document.getElementById('strengthLabel');
  var scoreRingFill = document.getElementById('scoreRingFill');
  var scoreNumber = document.getElementById('scoreNumber');
  var entropyValue = document.getElementById('entropyValue');
  var crackTimeEl = document.getElementById('crackTime');
  var criteriaCard = document.getElementById('criteriaCard');
  var criteriaList = document.getElementById('criteriaList');
  var tipsCard = document.getElementById('tipsCard');
  var tipsList = document.getElementById('tipsList');
  var scoreRing = document.getElementById('scoreRing');
  var inputWrapper = document.getElementById('inputWrapper');
  var circumference = 263.9;

  function updateUI(result) {
    if (!result) {
      strengthFill.style.width = '0%';
      strengthFill.style.background = 'var(--fg-muted)';
      strengthLabel.textContent = '—';
      strengthLabel.style.color = 'var(--fg-muted)';
      scoreRingFill.style.strokeDashoffset = '' + circumference;
      scoreRingFill.style.stroke = 'var(--fg-muted)';
      scoreNumber.textContent = '—';
      scoreNumber.style.color = 'var(--fg-muted)';
      entropyValue.textContent = '0 bits';
      entropyValue.style.color = 'var(--fg-muted)';
      crackTimeEl.textContent = 'Enter a password to see estimated crack time';
      crackTimeEl.style.color = 'var(--fg-muted)';
      criteriaCard.style.display = 'none';
      tipsCard.style.display = 'none';
      scoreRing.classList.remove('pulse-success');
      inputWrapper.style.borderColor = 'var(--border)';

      var blocks = entropyBar.querySelectorAll('.entropy-block');
      for (var i = 0; i < blocks.length; i++) {
        blocks[i].style.height = '4px';
        blocks[i].style.background = 'var(--bg-elevated)';
      }
      return;
    }

    var score = result.score;
    var color = result.color;
    var colorDim = result.colorDim;
    var level = result.level;
    var entropy = result.entropy;
    var crackTimeStr = result.crackTimeStr;
    var criteria = result.criteria;
    var tips = result.tips;

    strengthFill.style.width = score + '%';
    strengthFill.style.background = color;
    strengthLabel.textContent = level;
    strengthLabel.style.color = color;

    var offset = circumference - (circumference * score / 100);
    scoreRingFill.style.strokeDashoffset = '' + offset;
    scoreRingFill.style.stroke = color;
    scoreNumber.textContent = '' + score;
    scoreNumber.style.color = color;

    if (score >= 80) {
      scoreRing.classList.add('pulse-success');
      inputWrapper.style.borderColor = color;
    } else {
      scoreRing.classList.remove('pulse-success');
      inputWrapper.style.borderColor = 'var(--border)';
    }

    if (score < 20 && lastShakeScore >= 20) {
      inputWrapper.classList.remove('shake');
      void inputWrapper.offsetWidth;
      inputWrapper.classList.add('shake');
    }
    lastShakeScore = score;

    entropyValue.textContent = Math.round(entropy) + ' bits';
    entropyValue.style.color = color;

    var maxEntropy = 128;
    var entropyRatio = Math.min(1, entropy / maxEntropy);
    var blocks = entropyBar.querySelectorAll('.entropy-block');
    for (var i = 0; i < blocks.length; i++) {
      var blockRatio = (i + 1) / blocks.length;
      if (blockRatio <= entropyRatio) {
        var h = 4 + (24 - 4) * (blockRatio / Math.max(0.01, entropyRatio));
        blocks[i].style.height = Math.min(24, h) + 'px';
        blocks[i].style.background = color;
      } else {
        blocks[i].style.height = '4px';
        blocks[i].style.background = 'var(--bg-elevated)';
      }
    }

    crackTimeEl.innerHTML = '<i class="fas fa-clock mr-1" style="color:' + color + ';opacity:0.7;"></i>Estimated crack time: <strong style="color:' + color + ';">' + crackTimeStr + '</strong>';
    crackTimeEl.style.color = 'var(--fg)';

    criteriaCard.style.display = 'block';
    var chtml = '';
    for (var i = 0; i < criteria.length; i++) {
      var c = criteria[i];
      var cls = c.met ? 'met' : 'unmet';
      var icon = c.met ? 'fa-check' : 'fa-xmark';
      var txtColor = c.met ? 'var(--fg)' : 'var(--fg-muted)';
      chtml += '<div class="criteria-item ' + cls + '">' +
        '<div class="criteria-icon"><i class="fas ' + icon + '"></i></div>' +
        '<span class="text-sm" style="color:' + txtColor + ';">' + c.label + '</span></div>';
    }
    criteriaList.innerHTML = chtml;

    tipsCard.style.display = tips.length > 0 ? 'block' : 'none';
    var thtml = '';
    for (var i = 0; i < tips.length; i++) {
      thtml += '<li class="flex items-start gap-3">' +
        '<i class="fas fa-circle text-xs mt-1.5" style="color:' + color + ';font-size:5px;"></i>' +
        '<span class="text-sm" style="color:var(--fg-muted);">' + tips[i] + '</span></li>';
    }
    tipsList.innerHTML = thtml;
  }

  /* ─── Input listener ─── */
  pwInput.addEventListener('input', function() {
    var pw = this.value;
    highlightPassword(pw);
    var result = analyzePassword(pw);
    updateUI(result);
  });

  /* ─── Toggle options (delegated) ─── */
  var toggleContainer = document.getElementById('toggleContainer');
  toggleContainer.addEventListener('click', function(e) {
    var track = e.target.closest('.toggle-track');
    if (!track) return;
    var key = track.dataset.option;
    if (!key) return;
    genOptions[key] = !genOptions[key];
    track.classList.toggle('active', genOptions[key]);
    track.setAttribute('aria-checked', '' + genOptions[key]);
  });
  toggleContainer.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var track = e.target.closest('.toggle-track');
      if (!track) return;
      e.preventDefault();
      track.click();
    }
  });

  /* ─── Length slider ─── */
  var lengthSlider = document.getElementById('lengthSlider');
  var lengthDisplay = document.getElementById('lengthDisplay');
  lengthSlider.addEventListener('input', function() {
    lengthDisplay.textContent = this.value;
  });

  /* ─── Escape HTML ─── */
  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  /* ─── Generate passwords ─── */
  var generatedCard = document.getElementById('generatedCard');
  var generatedList = document.getElementById('generatedList');

  function generatePasswords() {
    var length = parseInt(lengthSlider.value, 10);

    if (!genOptions.upper && !genOptions.lower && !genOptions.numbers && !genOptions.symbols) {
      showToast('Select at least one character type');
      return;
    }

    var upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var lowerChars = 'abcdefghijklmnopqrstuvwxyz';
    var numChars = '0123456789';
    var symChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (genOptions.noAmbiguous) {
      upperChars = upperChars.replace(/[OI]/g, '');
      lowerChars = lowerChars.replace(/[l]/g, '');
      numChars = numChars.replace(/[01]/g, '');
      symChars = symChars.replace(/[|`']/g, '');
    }

    var charset = '';
    if (genOptions.upper) charset += upperChars;
    if (genOptions.lower) charset += lowerChars;
    if (genOptions.numbers) charset += numChars;
    if (genOptions.symbols) charset += symChars;

    var passwords = [];
    for (var p = 0; p < 4; p++) {
      var guaranteed = [];
      if (genOptions.upper) guaranteed.push(upperChars[Math.floor(Math.random() * upperChars.length)]);
      if (genOptions.lower) guaranteed.push(lowerChars[Math.floor(Math.random() * lowerChars.length)]);
      if (genOptions.numbers) guaranteed.push(numChars[Math.floor(Math.random() * numChars.length)]);
      if (genOptions.symbols) guaranteed.push(symChars[Math.floor(Math.random() * symChars.length)]);

      var remaining = length - guaranteed.length;
      var pw = '';
      for (var j = 0; j < remaining; j++) {
        pw += charset[Math.floor(Math.random() * charset.length)];
      }

      for (var g = 0; g < guaranteed.length; g++) {
        var pos = Math.floor(Math.random() * (pw.length + 1));
        pw = pw.slice(0, pos) + guaranteed[g] + pw.slice(pos);
      }
      passwords.push(pw);
    }

    // Passphrase
    var words = ['alpha','bravo','cascade','delta','echo','falcon','glacier','harbor','ivory','jade',
      'kite','lambda','mango','nebula','orbit','prism','quartz','raven','summit','tundra',
      'ultra','vapor','wren','xenon','yield','zenith','coral','drift','ember','frost',
      'grove','haze','iron','jolt','karma','lunar','mist','nova','opal','pike',
      'ridge','sage','thorn','umbra','vivid','whirl','axiom','blaze','crypt','dusk'];
    var sepChars = genOptions.symbols ? ['!','@','#','$','%','&','*','-','_','+','='] : ['-','_'];
    var passphraseParts = [];
    var wordCount = Math.max(3, Math.min(6, Math.floor(length / 4)));
    for (var w = 0; w < wordCount; w++) {
      passphraseParts.push(words[Math.floor(Math.random() * words.length)]);
      if (w < wordCount - 1) passphraseParts.push(sepChars[Math.floor(Math.random() * sepChars.length)]);
      if (genOptions.numbers && Math.random() > 0.5) passphraseParts.push(String(Math.floor(Math.random() * 100)));
    }
    var passphraseStr = passphraseParts.join('');
    var pAnalysis = analyzePassword(passphraseStr);

    generatedCard.style.display = 'block';
    generatedCard.dataset.generated = '1';

    var html = '';

    // Passphrase
    html += '<div class="mb-2"><span class="text-xs font-semibold px-2 py-1 rounded" style="background:rgba(251,191,36,0.1);color:#fbbf24;">PASSPHRASE</span></div>';
    html += '<div class="suggested-pw" data-copy="' + escapeAttr(passphraseStr) + '">';
    html += '<span class="suggested-pw-text">' + escapeHtml(passphraseStr) + '</span>';
    html += '<div class="flex items-center gap-2 flex-shrink-0">';
    html += '<span class="text-xs font-semibold px-2 py-1 rounded" style="background:' + pAnalysis.colorDim + ';color:' + pAnalysis.color + ';">' + pAnalysis.score + '</span>';
    html += '<button class="btn-icon copy-suggested-btn" data-copy="' + escapeAttr(passphraseStr) + '" style="width:34px;height:34px;" aria-label="Copy passphrase">';
    html += '<i class="fas fa-copy" style="font-size:13px;"></i></button>';
    html += '</div></div>';

    // Random passwords
    html += '<div class="mt-4 mb-2"><span class="text-xs font-semibold px-2 py-1 rounded" style="background:var(--accent-dim);color:var(--accent);">RANDOM</span></div>';
    for (var i = 0; i < passwords.length; i++) {
      var pwx = passwords[i];
      var a = analyzePassword(pwx);
      html += '<div class="suggested-pw" data-copy="' + escapeAttr(pwx) + '">';
      html += '<span class="suggested-pw-text">' + escapeHtml(pwx) + '</span>';
      html += '<div class="flex items-center gap-2 flex-shrink-0">';
      html += '<span class="text-xs font-semibold px-2 py-1 rounded" style="background:' + a.colorDim + ';color:' + a.color + ';">' + a.score + '</span>';
      html += '<button class="btn-icon copy-suggested-btn" data-copy="' + escapeAttr(pwx) + '" style="width:34px;height:34px;" aria-label="Copy password">';
      html += '<i class="fas fa-copy" style="font-size:13px;"></i></button>';
      html += '</div></div>';
    }

    generatedList.innerHTML = html;
  }

  /* ─── Safe attribute escaping ─── */
  function escapeAttr(str) {
    return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  /* ─── Delegated click for generated passwords ─── */
  generatedList.addEventListener('click', function(e) {
    // If they clicked the copy button directly, copy and stop
    var copyBtn = e.target.closest('.copy-suggested-btn');
    if (copyBtn) {
      e.stopPropagation();
      copyToClipboard(copyBtn.dataset.copy);
      return;
    }
    // Otherwise if they clicked the row, copy
    var row = e.target.closest('.suggested-pw');
    if (row && row.dataset.copy) {
      copyToClipboard(row.dataset.copy);
    }
  });

  /* ─── Generate + Regenerate buttons ─── */
  document.getElementById('generateBtn').addEventListener('click', generatePasswords);
  document.getElementById('regenBtn').addEventListener('click', generatePasswords);

  /* ─── Init ─── */
  updateUI(null);

})();