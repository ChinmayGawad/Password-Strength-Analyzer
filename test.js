/**
 * Vault — Password Strength Analyzer Test Suite
 */
(function runVaultTests() {
  console.log("==========================================");
  console.log("  Running Vault Core Automated Unit Tests ");
  console.log("==========================================");

  var passes = 0;
  var fails = 0;

  function assert(condition, message) {
    if (condition) {
      console.log("  ✅ PASS: " + message);
      passes++;
    } else {
      console.error("  ❌ FAIL: " + message);
      fails++;
    }
  }

  if (!window.VaultCore) {
    console.error("❌ VaultCore API is not exposed on window.");
    return;
  }

  var VaultCore = window.VaultCore;

  // Test 1: Cryptographically Secure RNG bounds check
  try {
    var validRNG = true;
    for (var i = 0; i < 500; i++) {
      var val = VaultCore.RNG.getInt(10);
      if (typeof val !== 'number' || val < 0 || val >= 10 || isNaN(val)) {
        validRNG = false;
        break;
      }
    }
    assert(validRNG, "VaultRNG.getInt(10) returns valid integers in range [0, 9]");
  } catch(e) {
    assert(false, "VaultRNG error: " + e.message);
  }

  // Test 2: Leetspeak normalization
  var leetResult = VaultCore.normalizeLeet("P@ssw0rd123");
  assert(leetResult.indexOf("password") !== -1, "normalizeLeet correctly parses 'P@ssw0rd123' to contain 'password'");

  // Test 3: Keyboard pattern detection
  assert(VaultCore.hasKeyboardPattern("myqwertykey") === true, "hasKeyboardPattern detects 'qwerty' sequence");
  assert(VaultCore.hasKeyboardPattern("k8#mP!2z$vL") === false, "hasKeyboardPattern returns false for random string");

  // Test 4: Password evaluator scoring for weak vs strong passwords
  var weakAnalysis = VaultCore.analyzePassword("password");
  assert(weakAnalysis && weakAnalysis.score < 25, "Weak password 'password' receives score < 25 (received: " + (weakAnalysis ? weakAnalysis.score : 'null') + ")");

  var strongAnalysis = VaultCore.analyzePassword("K9#xQ!8m2$vP@L7z");
  assert(strongAnalysis && strongAnalysis.score >= 80, "Strong password 'K9#xQ!8m2$vP@L7z' receives score >= 80 (received: " + (strongAnalysis ? strongAnalysis.score : 'null') + ")");

  // Test 5: Multi-scenario crack time output structure
  assert(
    weakAnalysis &&
    weakAnalysis.crackTimes &&
    typeof weakAnalysis.crackTimes.online === 'string' &&
    typeof weakAnalysis.crackTimes.slow === 'string' &&
    typeof weakAnalysis.crackTimes.fast === 'string',
    "analyzePassword returns valid multi-scenario crack times (online, slow, fast)"
  );

  console.log("------------------------------------------");
  console.log("  Test Results: " + passes + " Passed, " + fails + " Failed");
  console.log("==========================================");
})();
