from flask_cors import CORS
from flask import Flask, request, jsonify
from scipy import stats
import math

app = Flask(__name__)
CORS(app)

@app.route("/hypothesis-test", methods=["POST"])
def hypothesis_test():

    d = request.json

    mu0 = float(d["mu0"])
    mu1 = float(d["mu1"])
    xbar = float(d["xbar"])
    n = int(d["n"])
    alpha = float(d["alpha"])
    decimals = int(d["decimals"])
    std_known = d["stdKnown"]

    if std_known == "yes":
        sigma = float(d["sigma"])
        stat = (xbar - mu0) / (sigma / math.sqrt(n))
        p_value = 2 * (1 - stats.norm.cdf(abs(stat)))
        test_name = "Z-test"
    else:
        s = float(d["s"])
        stat = (xbar - mu0) / (s / math.sqrt(n))
        p_value = 2 * (1 - stats.t.cdf(abs(stat), df=n-1))
        test_name = "One-sample t-test"

    decision = "Reject H₀" if p_value < alpha else "Fail to Reject H₀"

    output = f"""
<h3>Step 1: State the Hypotheses</h3>
<p>H₀: μ = {mu0}<br>H₁: μ ≠ {mu0}</p>

<h3>Step 2: Identify the Test Statistic</h3>
<p>{test_name}</p>

<h3>Step 3: Level of Significance</h3>
<p>α = {alpha}</p>

<h3>Step 4: Decision Rule</h3>
<p>Reject H₀ if p-value &lt; α</p>

<h3>Step 5: Test Statistic Calculation</h3>
<p>Statistic = {round(stat,decimals)}<br>p-value = {round(p_value,decimals)}</p>

<h3>Step 6: Decision</h3>
<p><b>{decision}</b></p>
"""

    return jsonify({"formatted_output": output})


if __name__ == "__main__":
    app.run(debug=True)
