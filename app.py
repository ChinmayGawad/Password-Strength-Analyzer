from flask import Flask, render_template, request, jsonify
import random
import string
import re

app = Flask(__name__)


def analyze_password(password):
    score = 0

    checks = {
        "length": len(password) >= 8,
        "uppercase": bool(re.search(r"[A-Z]", password)),
        "lowercase": bool(re.search(r"[a-z]", password)),
        "number": bool(re.search(r"[0-9]", password)),
        "symbol": bool(re.search(r"[!@#$%^&*(),.?\":{}|<>]", password))
    }

    score = sum(checks.values())

    if score <= 2:
        strength = "Weak"
    elif score == 3:
        strength = "Medium"
    elif score == 4:
        strength = "Strong"
    else:
        strength = "Very Strong"

    return strength, checks


# Generate strong password suggestion

def generate_password():
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    password = ''.join(random.choice(characters) for _ in range(12))
    return password


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/check_password', methods=['POST'])
def check_password():
    data = request.get_json()
    password = data.get('password')

    strength, checks = analyze_password(password)
    suggestion = generate_password()

    return jsonify({
        'strength': strength,
        'checks': checks,
        'suggestion': suggestion
    })


if __name__ == '__main__':
    app.run(debug=True)