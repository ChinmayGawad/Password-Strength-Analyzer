document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password-input');
    const toggleVisibilityBtn = document.getElementById('toggle-visibility');
    const meter = document.getElementById('strength-meter');
    const strengthText = document.getElementById('strength-text');
    const generateBtn = document.getElementById('generate-btn');
    const generatedPasswordDisplay = document.getElementById('generated-password');
    
    // New Elements for Auto-Suggestion
    const weakSuggestionBox = document.getElementById('weak-suggestion-box');
    const autoSuggestedPassword = document.getElementById('auto-suggested-password');
    const useSuggestionBtn = document.getElementById('use-suggestion-btn');

    // Checklist Elements
    const criteria = {
        length: { regex: /.{8,}/, element: document.getElementById('crit-length') },
        uppercase: { regex: /[A-Z]/, element: document.getElementById('crit-uppercase') },
        lowercase: { regex: /[a-z]/, element: document.getElementById('crit-lowercase') },
        number: { regex: /[0-9]/, element: document.getElementById('crit-number') },
        symbol: { regex: /[^A-Za-z0-9]/, element: document.getElementById('crit-symbol') }
    };

    // Helper Function: Generate a secure password
    function createStrongPassword() {
        const chars = {
            uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
            lowercase: "abcdefghijklmnopqrstuvwxyz",
            numbers: "0123456789",
            symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-="
        };
        
        let password = "";
        password += chars.uppercase[Math.floor(Math.random() * chars.uppercase.length)];
        password += chars.lowercase[Math.floor(Math.random() * chars.lowercase.length)];
        password += chars.numbers[Math.floor(Math.random() * chars.numbers.length)];
        password += chars.symbols[Math.floor(Math.random() * chars.symbols.length)];

        const allChars = chars.uppercase + chars.lowercase + chars.numbers + chars.symbols;
        const length = Math.floor(Math.random() * 5) + 12; // 12 to 16 chars

        for (let i = password.length; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }
        return password.split('').sort(() => 0.5 - Math.random()).join('');
    }

    // Toggle Password Visibility
    toggleVisibilityBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        toggleVisibilityBtn.textContent = type === 'password' ? 'Show' : 'Hide';
    });

    // Analyze Password Strength
    passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        let fulfilledCriteria = 0;

        for (const key in criteria) {
            const rule = criteria[key];
            if (rule.regex.test(password)) {
                rule.element.classList.replace('invalid', 'valid');
                rule.element.querySelector('span').textContent = '✓';
                fulfilledCriteria++;
            } else {
                rule.element.classList.replace('valid', 'invalid');
                rule.element.querySelector('span').textContent = '✗';
            }
        }

        updateMeter(fulfilledCriteria, password.length);
    });

    // Update Progress Bar and trigger auto-suggestions
    function updateMeter(score, length) {
        if (length === 0) {
            meter.style.width = '0%';
            meter.style.backgroundColor = 'transparent';
            strengthText.textContent = 'Strength: None';
            strengthText.style.color = 'var(--text-muted)';
            weakSuggestionBox.classList.add('hidden'); // Hide suggestion if empty
            return;
        }

        let width = (score / 5) * 100;
        meter.style.width = `${width}%`;

        if (score <= 2) {
            meter.style.backgroundColor = 'var(--weak)';
            strengthText.textContent = 'Strength: Weak';
            strengthText.style.color = 'var(--weak)';
            
            // SHOW Auto-suggestion if it's currently hidden
            if (weakSuggestionBox.classList.contains('hidden')) {
                autoSuggestedPassword.textContent = createStrongPassword();
                weakSuggestionBox.classList.remove('hidden');
            }
        } else {
            // Hide suggestion if they fix the password
            weakSuggestionBox.classList.add('hidden');
            
            if (score === 3) {
                meter.style.backgroundColor = 'var(--medium)';
                strengthText.textContent = 'Strength: Medium';
                strengthText.style.color = 'var(--medium)';
            } else if (score === 4) {
                meter.style.backgroundColor = 'var(--strong)';
                strengthText.textContent = 'Strength: Strong';
                strengthText.style.color = 'var(--strong)';
            } else if (score === 5) {
                meter.style.backgroundColor = 'var(--very-strong)';
                strengthText.textContent = 'Strength: Very Strong';
                strengthText.style.color = 'var(--very-strong)';
            }
        }
    }

    // Auto-Suggestion "Use This" Button
    useSuggestionBtn.addEventListener('click', () => {
        const suggested = autoSuggestedPassword.textContent;
        passwordInput.value = suggested;
        passwordInput.dispatchEvent(new Event('input')); // Retrigger analysis
        
        // Change button text temporarily to show feedback
        const originalText = useSuggestionBtn.textContent;
        useSuggestionBtn.textContent = "Applied!";
        setTimeout(() => { useSuggestionBtn.textContent = originalText; }, 1500);
    });

    // Generate Strong Password (Manual Button)
    generateBtn.addEventListener('click', () => {
        const newPassword = createStrongPassword();
        generatedPasswordDisplay.textContent = newPassword;
        generatedPasswordDisplay.classList.remove('hidden');
        
        passwordInput.value = newPassword;
        passwordInput.dispatchEvent(new Event('input'));
    });
});