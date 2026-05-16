async function analyzePassword() {

    const password = document.getElementById('password').value;

    const response = await fetch('/check_password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password })
    });

    const data = await response.json();

    document.getElementById('strengthText').innerText =
        `Strength: ${data.strength}`;

    // Checklist
    updateCheck('length', data.checks.length);
    updateCheck('uppercase', data.checks.uppercase);
    updateCheck('lowercase', data.checks.lowercase);
    updateCheck('number', data.checks.number);
    updateCheck('symbol', data.checks.symbol);

    // Password suggestion
    document.getElementById('suggestion').innerText = data.suggestion;

    // Strength Meter
    const meter = document.getElementById('meter');

    if (data.strength === 'Weak') {
        meter.style.width = '30%';
        meter.style.background = 'red';
    }
    else if (data.strength === 'Medium') {
        meter.style.width = '60%';
        meter.style.background = 'orange';
    }
    else if (data.strength === 'Strong') {
        meter.style.width = '80%';
        meter.style.background = '#4CAF50';
    }
    else {
        meter.style.width = '100%';
        meter.style.background = 'green';
    }
}


function updateCheck(id, status) {
    const element = document.getElementById(id);

    if (status) {
        element.innerHTML = `✅ ${element.innerText.substring(2)}`;
    } else {
        element.innerHTML = `❌ ${element.innerText.substring(2)}`;
    }
}


function togglePassword() {

    const passwordField = document.getElementById('password');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
    } else {
        passwordField.type = 'password';
    }
}