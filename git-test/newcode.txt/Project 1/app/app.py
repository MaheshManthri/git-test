
from flask_cors import CORS
from flask import Flask, request, jsonify
from scipy import stats
import math
import matplotlib.pyplot as plt
import io
import base64
import numpy as np

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
        df = None
        dist_name = "Z-test"
        dist = stats.norm()
    else:
        s = float(d["s"])
        stat = (xbar - mu0) / (s / math.sqrt(n))
        df = n - 1
        dist_name = "One-sample t-test"
        dist = stats.t(df)

    # Two-tailed p-value
    p_value = 2 * (1 - dist.cdf(abs(stat)))

    decision = "Reject H₀" if p_value < alpha else "Fail to Reject H₀"

    # Critical values for two-tailed test
    crit_left = dist.ppf(alpha / 2)
    crit_right = dist.ppf(1 - alpha / 2)

    # Generate plot
    fig, ax = plt.subplots(figsize=(8, 4))

    # Range for plot x-axis
    if std_known == "yes":
        x = np.linspace(-4, 4, 500)
    else:
        x = np.linspace(dist.ppf(0.001), dist.ppf(0.999), 500)

    y = dist.pdf(x)
    ax.plot(x, y, 'b-', label=f'{dist_name} PDF')

    # Shade rejection regions (two tails)
    ax.fill_between(x, 0, y, where=(x <= crit_left), color='red', alpha=0.4, label='Rejection Region')
    ax.fill_between(x, 0, y, where=(x >= crit_right), color='red', alpha=0.4)

    # Mark critical values with dashed lines
    ax.axvline(crit_left, color='red', linestyle='--', label=f'Critical Values (±{round(abs(crit_left), decimals)})')
    ax.axvline(crit_right, color='red', linestyle='--')

    # Mark observed test statistic
    ax.axvline(stat, color='green', linestyle='-', linewidth=2, label=f'Test Statistic = {round(stat, decimals)}')

    ax.set_title(f'{dist_name} Distribution with Rejection Regions')
    ax.set_xlabel('Test Statistic Value')
    ax.set_ylabel('Probability Density')
    ax.legend(loc='upper left')

    # Clean up axes
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)

    # Save plot to base64 PNG string
    buf = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buf, format='png')
    plt.close(fig)
    buf.seek(0)
    img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')

    img_html = f'<h3>Visualization</h3><img src="data:image/png;base64,{img_base64}" alt="Distribution Plot" style="max-width:100%;height:auto;border:1px solid #ccc;border-radius:8px;">'

    output = f"""
<h3>Step 1: State the Hypotheses</h3>
<p>H₀: μ = {mu0}<br>H₁: μ ≠ {mu0}</p>

<h3>Step 2: Identify the Test Statistic</h3>
<p>{dist_name}</p>

<h3>Step 3: Level of Significance</h3>
<p>α = {alpha}</p>

<h3>Step 4: Decision Rule</h3>
<p>Reject H₀ if p-value &lt; α</p>

<h3>Step 5: Test Statistic Calculation</h3>
<p>Statistic = {round(stat, decimals)}<br>p-value = {round(p_value, decimals)}</p>

<h3>Step 6: Decision</h3>
<p><b>{decision}</b></p>

{img_html}
"""

    return jsonify({"formatted_output": output})


if __name__ == "__main__":
    app.run(debug=True)
