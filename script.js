(function() {
  "use strict";

  /* ─── Cryptographically Secure RNG ─── */
  var VaultRNG = {
    getInt: function(max) {
      if (max <= 1) return 0;
      var array = new Uint32Array(1);
      var maxUint32 = 0xFFFFFFFF;
      var limit = maxUint32 - (maxUint32 % max);
      var rand;
      do {
        window.crypto.getRandomValues(array);
        rand = array[0];
      } while (rand >= limit);
      return rand % max;
    },
    pickChar: function(str) {
      return str[this.getInt(str.length)];
    },
    pickItem: function(arr) {
      return arr[this.getInt(arr.length)];
    }
  };

  /* ─── Have I Been Pwned Breached API (k-Anonymity) ─── */
  var VaultHIBP = {
    cache: {},
    check: async function(password) {
      if (!password || password.length === 0) return { checked: false, count: 0 };
      var lower = password.toLowerCase();
      if (this.cache[lower] !== undefined) {
        return { checked: true, count: this.cache[lower] };
      }
      try {
        var encoder = new TextEncoder();
        var data = encoder.encode(password);
        var hashBuf = await window.crypto.subtle.digest('SHA-1', data);
        var hashArr = Array.from(new Uint8Array(hashBuf));
        var hashHex = hashArr.map(function(b) {
          return b.toString(16).padStart(2, '0');
        }).join('').toUpperCase();

        var prefix = hashHex.substring(0, 5);
        var suffix = hashHex.substring(5);

        var res = await fetch('https://api.pwnedpasswords.com/range/' + prefix);
        if (!res.ok) throw new Error('API request failed');
        var text = await res.text();
        var lines = text.split('\n');
        var count = 0;
        for (var i = 0; i < lines.length; i++) {
          var parts = lines[i].trim().split(':');
          if (parts[0] === suffix) {
            count = parseInt(parts[1], 10) || 0;
            break;
          }
        }
        this.cache[lower] = count;
        return { checked: true, count: count };
      } catch (err) {
        return { checked: false, count: 0, error: true };
      }
    }
  };

  /* ─── Common Patterns & Leetspeak ─── */
  var COMMON_PATTERNS = [
    'password','123456','12345678','qwerty','abc123','monkey','master',
    'dragon','111111','baseball','iloveyou','trustno1','sunshine',
    'princess','football','shadow','superman','michael','letmein',
    'welcome','admin','login','passw0rd','hello','charlie','donald',
    'password1','qwerty123','1234567890','000000','654321','0987654321',
    'aaaaaaaa','abcdefgh','123123','abcabc','112233'
  ];

  var KEYBOARD_SEQUENCES = [
    'qwertyuiop', 'asdfghjkl', 'zxcvbnm',
    '1234567890', '0987654321', 'qazwsxedc',
    'poiuytrewq', 'lkjhgfdsa', 'mnbvcxz'
  ];

  function normalizeLeet(str) {
    return str.toLowerCase()
      .replace(/@/g, 'a').replace(/4/g, 'a')
      .replace(/3/g, 'e').replace(/1/g, 'i')
      .replace(/!/g, 'i').replace(/0/g, 'o')
      .replace(/5/g, 's').replace(/\$/g, 's')
      .replace(/7/g, 't');
  }

  function hasKeyboardPattern(pw) {
    var lower = pw.toLowerCase();
    for (var i = 0; i < KEYBOARD_SEQUENCES.length; i++) {
      var seq = KEYBOARD_SEQUENCES[i];
      for (var j = 0; j <= seq.length - 4; j++) {
        var sub = seq.substring(j, j + 4);
        if (lower.indexOf(sub) !== -1) return true;
      }
    }
    return false;
  }

  /* ─── Matrix Digital Rain Canvas ─── */
  var canvas = document.getElementById('particles');
  var ctx = canvas.getContext('2d');
  var chars = '0123456789ABCDEF01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
  var fontSize = 13;
  var columns = 0;
  var drops = [];

  function initMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    columns = Math.floor(canvas.width / fontSize);
    drops = [];
    for (var i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
  }
  initMatrix();
  window.addEventListener('resize', initMatrix);

  function drawMatrix() {
    var bgHex = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim() || '#030d06';
    ctx.fillStyle = bgHex.length === 7 ? bgHex + '18' : 'rgba(3,13,6,0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var accentColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#00ff66';
    ctx.fillStyle = accentColor;
    ctx.font = fontSize + 'px "Share Tech Mono", monospace';

    for (var i = 0; i < drops.length; i++) {
      var text = chars[Math.floor(Math.random() * chars.length)];
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();

  /* ─── Build Entropy Bar ─── */
  var entropyBar = document.getElementById('entropyBar');
  var entropyHTML = '';
  for (var i = 0; i < 24; i++) {
    entropyHTML += '<div class="entropy-block" style="height:4px;background:var(--bg-elevated);"></div>';
  }
  entropyBar.innerHTML = entropyHTML;

  /* ─── Format Time Helper ─── */
  function formatTime(seconds) {
    if (seconds < 0.001) return 'Instant';
    if (seconds < 1) return '< 1 sec';
    if (seconds < 60) return Math.round(seconds) + ' secs';
    if (seconds < 3600) return Math.round(seconds / 60) + ' mins';
    if (seconds < 86400) return Math.round(seconds / 3600) + ' hours';
    if (seconds < 86400 * 30) return Math.round(seconds / 86400) + ' days';
    if (seconds < 86400 * 365) return Math.round(seconds / (86400 * 30)) + ' months';
    if (seconds < 86400 * 365 * 1000) return Math.round(seconds / (86400 * 365)) + ' yrs';
    if (seconds < 86400 * 365 * 1e6) return (seconds / (86400 * 365 * 1000)).toFixed(1) + 'k yrs';
    if (seconds < 86400 * 365 * 1e9) return (seconds / (86400 * 365 * 1e6)).toFixed(1) + 'M yrs';
    return 'Trillions+ yrs';
  }

  /* ─── Build ASCII Progress Bar ─── */
  function buildAsciiBar(score) {
    var total = 20;
    var filled = Math.round((score / 100) * total);
    var empty = total - filled;
    var str = '[';
    for (var i = 0; i < filled; i++) str += '█';
    for (var j = 0; j < empty; j++) str += '░';
    str += '] ' + score + '%';
    return str;
  }

  /* ─── Core Analysis Engine ─── */
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

    var lowerPw = pw.toLowerCase();
    var normalized = normalizeLeet(pw);
    var isCommon = false;
    for (var i = 0; i < COMMON_PATTERNS.length; i++) {
      if (COMMON_PATTERNS[i] === lowerPw || COMMON_PATTERNS[i] === normalized) {
        isCommon = true;
        break;
      }
    }

    var hasKbPattern = hasKeyboardPattern(pw);
    var hasRepeatChar = /(.)\1{2,}/.test(pw);
    var hasSeqPattern = /(?:abc|bcd|cde|def|efg|012|123|234|345|456|567|678|789)/i.test(pw);
    var hasYearPattern = /(?:19[5-9]\d|20[0-2]\d)/.test(pw);

    var criteria = [
      { label: 'Length >= 08 chars', met: len >= 8 },
      { label: 'Length >= 12 chars', met: len >= 12 },
      { label: 'Length >= 16 chars', met: len >= 16 },
      { label: 'Uppercase Pool [A-Z]', met: hasUpper },
      { label: 'Lowercase Pool [a-z]', met: hasLower },
      { label: 'Numeric Pool [0-9]', met: hasNum },
      { label: 'Symbol Pool [!@#]', met: hasSymbol },
      { label: 'No Common Dictionary Match', met: !isCommon },
      { label: 'No Repeat Sequences (3+)', met: !hasRepeatChar },
      { label: 'No Keyboard Pattern Walks', met: !hasSeqPattern && !hasKbPattern }
    ];

    var metCount = 0;
    for (var i = 0; i < criteria.length; i++) {
      if (criteria[i].met) metCount++;
    }

    // Linear continuous evaluation formula based on entropy & pool scaling
    var targetMaxEntropy = 80; // 80 bits entropy = 100% security rating
    var rawLinearScore = (entropy / targetMaxEntropy) * 100;
    var lengthBonus = Math.round(len * 2);

    var penaltyCount = 0;
    var penaltyDeduction = 0;
    if (isCommon) { penaltyDeduction += 50; penaltyCount++; }
    if (hasRepeatChar) { penaltyDeduction += 12; penaltyCount++; }
    if (hasSeqPattern) { penaltyDeduction += 10; penaltyCount++; }
    if (hasKbPattern) { penaltyDeduction += 12; penaltyCount++; }
    if (hasYearPattern) { penaltyDeduction += 8; penaltyCount++; }
    if (len < 6) { penaltyDeduction += 15; penaltyCount++; }

    var finalScore = Math.max(0, Math.min(100, Math.round(rawLinearScore - penaltyDeduction)));
    if (isCommon) finalScore = Math.min(finalScore, 10);
    var score = finalScore;

    var totalCombinations = Math.pow(Math.max(1, charsetSize), len);
    var secondsOnline = totalCombinations / (100 / 3600) / 2;
    var secondsSlow = totalCombinations / 10000 / 2;
    var secondsFast = totalCombinations / 1e11 / 2;

    var level, color, colorDim, indexStr;
    if (score < 20) { level = 'STATUS: CRITICAL'; indexStr = 'CRITICAL_LEAK_RISK'; color = 'var(--danger)'; colorDim = 'var(--danger-dim)'; }
    else if (score < 40) { level = 'STATUS: VULNERABLE'; indexStr = 'LOW_ENTROPY_WEAK'; color = 'var(--warning)'; colorDim = 'var(--warning-dim)'; }
    else if (score < 60) { level = 'STATUS: MODERATE'; indexStr = 'ACCEPTABLE_MODERATE'; color = 'var(--warning)'; colorDim = 'var(--warning-dim)'; }
    else if (score < 80) { level = 'STATUS: HIGH_SECURITY'; indexStr = 'STRONG_ENCRYPTED'; color = 'var(--success)'; colorDim = 'var(--success-dim)'; }
    else { level = 'STATUS: MAXIMUM_ENCRYPTION'; indexStr = 'MILITARY_GRADE'; color = 'var(--success)'; colorDim = 'var(--success-dim)'; }

    var tips = [];
    if (len < 12) tips.push('EXPAND: Increase length to 12+ characters to block dictionary attacks.');
    if (len < 16) tips.push('ENHANCE: Use 16+ characters for quantum-resilient brute-force defense.');
    if (!hasUpper) tips.push('POOL: Add uppercase characters [A-Z].');
    if (!hasLower) tips.push('POOL: Add lowercase characters [a-z].');
    if (!hasNum) tips.push('POOL: Add numerical digits [0-9].');
    if (!hasSymbol) tips.push('POOL: Add special symbols [!@#$%^&*].');
    if (isCommon) tips.push('WARNING: Password detected in common rainbow tables / breach dumps.');
    if (hasRepeatChar) tips.push('AVOID: Consecutive character repetition (3+).');
    if (hasKbPattern || hasSeqPattern) tips.push('AVOID: Keyboard walks (qwerty, asdfgh).');
    if (hasYearPattern) tips.push('AVOID: Embedded year tokens.');
    if (score >= 80) tips.push('PASSED: Key verified for secure storage in password vault.');

    return {
      score: score,
      level: level,
      indexStr: indexStr,
      color: color,
      colorDim: colorDim,
      entropy: entropy,
      charsetSize: charsetSize,
      lengthBonus: lengthBonus,
      penaltyCount: penaltyCount,
      crackTimes: {
        online: formatTime(secondsOnline),
        slow: formatTime(secondsSlow),
        fast: formatTime(secondsFast)
      },
      criteria: criteria,
      tips: tips
    };
  }

  /* ─── UI State & Elements Cache ─── */
  var pwInput = document.getElementById('pwInput');
  var charCountLabel = document.getElementById('charCountLabel');
  var highlightedPw = document.getElementById('highlightedPw');
  var strengthLabel = document.getElementById('strengthLabel');
  var asciiProgress = document.getElementById('asciiProgress');
  var scoreRingFill = document.getElementById('scoreRingFill');
  var scoreNumber = document.getElementById('scoreNumber');
  var securityIndexStr = document.getElementById('securityIndexStr');
  var entropyValue = document.getElementById('entropyValue');
  var crackTimeEl = document.getElementById('crackTime');
  var criteriaCard = document.getElementById('criteriaCard');
  var criteriaList = document.getElementById('criteriaList');
  var tipsCard = document.getElementById('tipsCard');
  var tipsList = document.getElementById('tipsList');
  var scoreRing = document.getElementById('scoreRing');
  var inputWrapper = document.getElementById('inputWrapper');
  var breachBanner = document.getElementById('breachBanner');
  var breachText = document.getElementById('breachText');
  var breachBadge = document.getElementById('breachBadge');
  var multiCrackCard = document.getElementById('multiCrackCard');
  var crackOnline = document.getElementById('crackOnline');
  var crackSlow = document.getElementById('crackSlow');
  var crackFast = document.getElementById('crackFast');
  var metricsCard = document.getElementById('metricsCard');
  var metricLength = document.getElementById('metricLength');
  var metricPool = document.getElementById('metricPool');
  var metricPenalties = document.getElementById('metricPenalties');
  var metricBreach = document.getElementById('metricBreach');
  var circumference = 263.9;
  var breachDebounceTimer = null;
  var lastShakeScore = -1;
  var currentDisplayedScore = 0;
  var scoreAnimRaf = null;

  /* ─── Linear Score Animator ─── */
  function animateScoreTo(targetScore, color) {
    if (scoreAnimRaf) cancelAnimationFrame(scoreAnimRaf);

    var startScore = currentDisplayedScore;
    var diff = targetScore - startScore;

    if (diff === 0) {
      scoreNumber.textContent = '' + targetScore;
      asciiProgress.textContent = buildAsciiBar(targetScore);
      var offset = circumference - (circumference * targetScore / 100);
      scoreRingFill.style.strokeDashoffset = '' + offset;
      return;
    }

    var startTime = null;
    // Slower, smooth linear counting transition duration (500ms - 1000ms)
    var duration = Math.min(1000, Math.max(500, Math.abs(diff) * 16));

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min(1, (timestamp - startTime) / duration);
      
      // Linear interpolation
      var interpolated = startScore + (diff * progress);
      currentDisplayedScore = interpolated;

      var intScore = Math.round(interpolated);
      scoreNumber.textContent = '' + intScore;
      scoreNumber.style.color = color;

      asciiProgress.textContent = buildAsciiBar(intScore);
      asciiProgress.style.color = color;

      var offset = circumference - (circumference * interpolated / 100);
      scoreRingFill.style.strokeDashoffset = '' + offset;
      scoreRingFill.style.stroke = color;

      if (progress < 1) {
        scoreAnimRaf = requestAnimationFrame(step);
      } else {
        currentDisplayedScore = targetScore;
        scoreNumber.textContent = '' + targetScore;
        asciiProgress.textContent = buildAsciiBar(targetScore);
      }
    }

    scoreAnimRaf = requestAnimationFrame(step);
  }

  /* ─── Highlight Password Characters ─── */
  function highlightPassword(pw) {
    if (!pw) { highlightedPw.innerHTML = '<span class="text-muted cursor-blink">$ awaiting_input_</span>'; return; }
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
    highlightedPw.innerHTML = html + '<span class="text-accent animate-pulse font-bold">█</span>';
  }

  /* ─── Render Analysis UI ─── */
  function updateUI(result) {
    if (!result) {
      if (scoreAnimRaf) cancelAnimationFrame(scoreAnimRaf);
      currentDisplayedScore = 0;
      charCountLabel.textContent = '[00 CHARS]';
      strengthLabel.textContent = 'STATUS: STANDBY';
      strengthLabel.style.color = 'var(--fg-muted)';
      asciiProgress.textContent = '[░░░░░░░░░░░░░░░░░░░░] 0%';
      asciiProgress.style.color = 'var(--fg-muted)';
      scoreRingFill.style.strokeDashoffset = '' + circumference;
      scoreRingFill.style.stroke = 'var(--fg-muted)';
      scoreNumber.textContent = '—';
      scoreNumber.style.color = 'var(--fg-muted)';
      securityIndexStr.textContent = 'STANDBY';
      securityIndexStr.style.color = 'var(--fg-muted)';
      entropyValue.textContent = '0 bits';
      entropyValue.style.color = 'var(--fg-muted)';
      crackTimeEl.textContent = '> Awaiting input to calculate GPU cracking time...';
      crackTimeEl.style.color = 'var(--fg-muted)';
      
      breachBanner.style.display = 'none';
      multiCrackCard.style.display = 'none';
      metricsCard.style.display = 'none';
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

    var countPad = String(pwInput.value.length).padStart(2, '0');
    charCountLabel.textContent = '[' + countPad + ' CHARS]';
    var score = result.score;
    var color = result.color;

    strengthLabel.textContent = result.level;
    strengthLabel.style.color = color;

    // Linear animated transition to target score
    animateScoreTo(score, color);

    securityIndexStr.textContent = result.indexStr;
    securityIndexStr.style.color = color;

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

    entropyValue.textContent = Math.round(result.entropy) + ' bits';
    entropyValue.style.color = color;

    var maxEntropy = 128;
    var entropyRatio = Math.min(1, result.entropy / maxEntropy);
    var blocks = entropyBar.querySelectorAll('.entropy-block');
    for (var i = 0; i < blocks.length; i++) {
      var blockRatio = (i + 1) / blocks.length;
      if (blockRatio <= entropyRatio) {
        var h = 4 + (20 - 4) * (blockRatio / Math.max(0.01, entropyRatio));
        blocks[i].style.height = Math.min(20, h) + 'px';
        blocks[i].style.background = color;
      } else {
        blocks[i].style.height = '4px';
        blocks[i].style.background = 'var(--bg-elevated)';
      }
    }

    crackTimeEl.innerHTML = '> GPU_CLUSTER_CRACK_TIME: <strong style="color:' + color + ';">' + result.crackTimes.fast + '</strong>';
    crackTimeEl.style.color = 'var(--fg)';

    multiCrackCard.style.display = 'block';
    crackOnline.textContent = result.crackTimes.online;
    crackSlow.textContent = result.crackTimes.slow;
    crackFast.textContent = result.crackTimes.fast;

    metricsCard.style.display = 'block';
    metricLength.textContent = '+' + result.lengthBonus;
    metricPool.textContent = result.charsetSize + ' / 95';
    metricPenalties.textContent = '-' + result.penaltyCount;

    criteriaCard.style.display = 'block';
    var chtml = '';
    for (var i = 0; i < result.criteria.length; i++) {
      var c = result.criteria[i];
      var cls = c.met ? 'met' : 'unmet';
      var tag = c.met ? '[OK]' : '[FAIL]';
      var icon = c.met ? 'fa-check text-accent' : 'fa-xmark text-danger';
      chtml += '<div class="criteria-item ' + cls + '">' +
        '<i class="fas ' + icon + ' text-xs"></i>' +
        '<span class="font-bold mr-1">' + tag + '</span>' +
        '<span>' + c.label + '</span></div>';
    }
    criteriaList.innerHTML = chtml;

    tipsCard.style.display = result.tips.length > 0 ? 'block' : 'none';
    var thtml = '';
    for (var i = 0; i < result.tips.length; i++) {
      thtml += '<li class="flex items-start gap-2">' +
        '<span class="text-accent font-bold">></span>' +
        '<span>' + result.tips[i] + '</span></li>';
    }
    tipsList.innerHTML = thtml;
  }

  /* ─── HIBP Breach Checker Hook ─── */
  function scheduleBreachCheck(pw) {
    if (breachDebounceTimer) clearTimeout(breachDebounceTimer);
    if (!pw || pw.length < 3) {
      breachBanner.style.display = 'none';
      metricBreach.textContent = 'CLEAR';
      metricBreach.style.color = 'var(--success)';
      return;
    }

    breachBanner.style.display = 'flex';
    breachBanner.className = 'breach-banner checking mt-3 p-2.5 rounded flex items-center justify-between gap-2 text-xs font-mono';
    breachText.innerHTML = '<i class="fas fa-spinner fa-spin text-accent"></i><span>[LOG] RUNNING_HIBP_BREACH_QUERY...</span>';
    breachBadge.style.display = 'none';

    breachDebounceTimer = setTimeout(async function() {
      var breach = await VaultHIBP.check(pw);
      if (!breach.checked) {
        breachBanner.style.display = 'none';
        return;
      }
      if (breach.count > 0) {
        breachBanner.className = 'breach-banner leaked mt-3 p-2.5 rounded flex items-center justify-between gap-2 text-xs font-mono';
        breachText.innerHTML = '<i class="fas fa-triangle-exclamation text-danger"></i><span>[ALERT] PASSPHRASE_LEAKED_IN_BREACH_DUMPS!</span>';
        breachBadge.style.display = 'inline-block';
        breachBadge.style.background = 'var(--danger-dim)';
        breachBadge.style.color = 'var(--danger)';
        breachBadge.textContent = breach.count.toLocaleString() + ' LEAKS';
        metricBreach.textContent = 'LEAKED!';
        metricBreach.style.color = 'var(--danger)';
      } else {
        breachBanner.className = 'breach-banner safe mt-3 p-2.5 rounded flex items-center justify-between gap-2 text-xs font-mono';
        breachText.innerHTML = '<i class="fas fa-shield-check text-success"></i><span>[OK] ZERO_MATCHES_IN_KNOWN_PUBLIC_BREACHES</span>';
        breachBadge.style.display = 'inline-block';
        breachBadge.style.background = 'var(--success-dim)';
        breachBadge.style.color = 'var(--success)';
        breachBadge.textContent = 'CLEARED';
        metricBreach.textContent = 'CLEARED';
        metricBreach.style.color = 'var(--success)';
      }
    }, 450);
  }

  /* ─── Input Listener ─── */
  pwInput.addEventListener('input', function() {
    var pw = this.value;
    highlightPassword(pw);
    var result = analyzePassword(pw);
    updateUI(result);
    scheduleBreachCheck(pw);
  });

  /* ─── Controls: Visibility & Clear & Copy Input ─── */
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

  document.getElementById('clearBtn').addEventListener('click', function() {
    pwInput.value = '';
    pwInput.dispatchEvent(new Event('input'));
    pwInput.focus();
  });

  document.getElementById('copyInputBtn').addEventListener('click', function() {
    if (!pwInput.value) {
      showToast('STATUS_FAIL: EMPTY_INPUT');
      return;
    }
    copyToClipboard(pwInput.value);
  });

  /* ─── Toast System ─── */
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

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast('COPIED_TO_CLIPBOARD');
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
    showToast('COPIED_TO_CLIPBOARD');
  }

  /* ─── Theme Switcher ─── */
  var themeBtns = document.querySelectorAll('.theme-btn');
  function setTheme(name) {
    document.documentElement.setAttribute('data-theme', name);
    try { localStorage.setItem('vault_theme', name); } catch(e) {}
    for (var i = 0; i < themeBtns.length; i++) {
      var btn = themeBtns[i];
      if (btn.dataset.themeName === name) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  }

  var savedTheme = 'matrix';
  try { savedTheme = localStorage.getItem('vault_theme') || 'matrix'; } catch(e) {}
  setTheme(savedTheme);

  for (var i = 0; i < themeBtns.length; i++) {
    themeBtns[i].addEventListener('click', function() {
      setTheme(this.dataset.themeName);
    });
  }

  /* ─── Navigation Tabs ─── */
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

  /* ─── Keyboard Shortcuts ─── */
  window.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
      e.preventDefault();
      switchTab('generate');
      generatePasswords();
    } else if (e.key === 'Escape') {
      if (document.activeElement === pwInput || pwInput.value) {
        pwInput.value = '';
        pwInput.dispatchEvent(new Event('input'));
      }
    }
  });

  /* ─── Generator Controls ─── */
  var genOptions = { upper: true, lower: true, numbers: true, symbols: true, noAmbiguous: false };
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

  var lengthSlider = document.getElementById('lengthSlider');
  var lengthDisplay = document.getElementById('lengthDisplay');
  lengthSlider.addEventListener('input', function() {
    lengthDisplay.textContent = this.value;
  });

  /* ─── Generator Algorithm ─── */
  var generatedCard = document.getElementById('generatedCard');
  var generatedList = document.getElementById('generatedList');

  function generatePasswords() {
    var length = parseInt(lengthSlider.value, 10);

    if (!genOptions.upper && !genOptions.lower && !genOptions.numbers && !genOptions.symbols) {
      showToast('SELECT_AT_LEAST_ONE_CHARSET');
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
      if (genOptions.upper) guaranteed.push(VaultRNG.pickChar(upperChars));
      if (genOptions.lower) guaranteed.push(VaultRNG.pickChar(lowerChars));
      if (genOptions.numbers) guaranteed.push(VaultRNG.pickChar(numChars));
      if (genOptions.symbols) guaranteed.push(VaultRNG.pickChar(symChars));

      var remaining = length - guaranteed.length;
      var pwArr = [];
      for (var j = 0; j < remaining; j++) {
        pwArr.push(VaultRNG.pickChar(charset));
      }

      for (var g = 0; g < guaranteed.length; g++) {
        var pos = VaultRNG.getInt(pwArr.length + 1);
        pwArr.splice(pos, 0, guaranteed[g]);
      }
      passwords.push(pwArr.join(''));
    }

    // Passphrase Generation
    var words = ['alpha','bravo','cascade','delta','echo','falcon','glacier','harbor','ivory','jade',
      'kite','lambda','mango','nebula','orbit','prism','quartz','raven','summit','tundra',
      'ultra','vapor','wren','xenon','yield','zenith','coral','drift','ember','frost',
      'grove','haze','iron','jolt','karma','lunar','mist','nova','opal','pike',
      'ridge','sage','thorn','umbra','vivid','whirl','axiom','blaze','crypt','dusk'];
    var sepChars = genOptions.symbols ? ['!','@','#','$','%','&','*','-','_','+','='] : ['-','_'];
    var passphraseParts = [];
    var wordCount = Math.max(3, Math.min(6, Math.floor(length / 4)));
    for (var w = 0; w < wordCount; w++) {
      passphraseParts.push(VaultRNG.pickItem(words));
      if (w < wordCount - 1) passphraseParts.push(VaultRNG.pickItem(sepChars));
      if (genOptions.numbers && VaultRNG.getInt(2) === 1) passphraseParts.push(String(VaultRNG.getInt(100)));
    }
    var passphraseStr = passphraseParts.join('');
    var pAnalysis = analyzePassword(passphraseStr);

    generatedCard.style.display = 'block';
    generatedCard.dataset.generated = '1';

    var html = '';

    // Passphrase Output
    html += '<div class="mb-1 text-[11px] font-bold text-accent">[TYPE: PASSPHRASE]</div>';
    html += '<div class="suggested-pw" data-copy="' + escapeAttr(passphraseStr) + '">';
    html += '<span class="suggested-pw-text text-accent font-bold">' + escapeHtml(passphraseStr) + '</span>';
    html += '<div class="flex items-center gap-2 flex-shrink-0">';
    html += '<span class="text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--bg-elevated)]" style="color:' + pAnalysis.color + ';">SCORE: ' + pAnalysis.score + '</span>';
    html += '<button class="terminal-btn-icon copy-suggested-btn" data-copy="' + escapeAttr(passphraseStr) + '" aria-label="Copy passphrase"><i class="fas fa-copy"></i></button>';
    html += '</div></div>';

    // Random Passwords Output
    html += '<div class="mt-3 mb-1 text-[11px] font-bold text-accent">[TYPE: CRYPTO_RNG_RANDOM]</div>';
    for (var i = 0; i < passwords.length; i++) {
      var pwx = passwords[i];
      var a = analyzePassword(pwx);
      html += '<div class="suggested-pw" data-copy="' + escapeAttr(pwx) + '">';
      html += '<span class="suggested-pw-text">' + escapeHtml(pwx) + '</span>';
      html += '<div class="flex items-center gap-2 flex-shrink-0">';
      html += '<span class="text-xs font-bold px-1.5 py-0.5 rounded bg-[var(--bg-elevated)]" style="color:' + a.color + ';">SCORE: ' + a.score + '</span>';
      html += '<button class="terminal-btn-icon copy-suggested-btn" data-copy="' + escapeAttr(pwx) + '" aria-label="Copy password"><i class="fas fa-copy"></i></button>';
      html += '</div></div>';
    }

    generatedList.innerHTML = html;
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function escapeAttr(str) {
    return str.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  generatedList.addEventListener('click', function(e) {
    var copyBtn = e.target.closest('.copy-suggested-btn');
    if (copyBtn) {
      e.stopPropagation();
      copyToClipboard(copyBtn.dataset.copy);
      return;
    }
    var row = e.target.closest('.suggested-pw');
    if (row && row.dataset.copy) {
      copyToClipboard(row.dataset.copy);
    }
  });

  document.getElementById('generateBtn').addEventListener('click', generatePasswords);
  document.getElementById('regenBtn').addEventListener('click', generatePasswords);

  /* Expose Vault object for testing */
  window.VaultCore = {
    RNG: VaultRNG,
    HIBP: VaultHIBP,
    analyzePassword: analyzePassword,
    normalizeLeet: normalizeLeet,
    hasKeyboardPattern: hasKeyboardPattern
  };

  /* Init */
  updateUI(null);
  highlightPassword('');

})();