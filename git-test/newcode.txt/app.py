from flask import Flask, request, jsonify
from flask_cors import CORS
import math
from scipy import stats

app = Flask(__name__)
CORS(app)


@app.route("/")
def home():
    return "Decision Analytics Backend Running"

# ===============================
# HYPOTHESIS TEST API
# ===============================
@app.route("/hypothesis-test", methods=["POST"])
def hypothesis_test():

    data = request.json

    test_type = data.get("testType")
    sample = data.get("sample")
    mu0 = float(data.get("mu0"))
    alpha = float(data.get("alpha"))
    alternative = data.get("alternative")
    business_context = data.get("businessContext")

    n = len(sample)
    sample_mean = sum(sample) / n
    sample_std = math.sqrt(sum((x - sample_mean) ** 2 for x in sample) / (n - 1))

    # t-statistic
    t_stat = (sample_mean - mu0) / (sample_std / math.sqrt(n))

    # p-value based on alternative hypothesis
    if alternative == "Two-tailed":
        p_value = 2 * (1 - stats.t.cdf(abs(t_stat), df=n-1))
    elif alternative == "Right-tailed":
        p_value = 1 - stats.t.cdf(t_stat, df=n-1)
    else:  # Left-tailed
        p_value = stats.t.cdf(t_stat, df=n-1)

    # Decision
    reject_null = p_value < alpha

    # Managerial Conclusion
    if reject_null:
        decision = "Reject the null hypothesis"
        business_conclusion = (
            "The data provides sufficient statistical evidence to support a change in business strategy."
        )
    else:
        decision = "Fail to reject the null hypothesis"
        business_conclusion = (
            "The data does not provide sufficient evidence to justify a strategic change at this time."
        )

    return jsonify({
        "test_type": test_type,
        "sample_size": n,
        "sample_mean": round(sample_mean, 4),
        "t_statistic": round(t_stat, 4),
        "p_value": round(p_value, 4),
        "alpha": alpha,
        "decision": decision,
        "managerial_conclusion": business_conclusion,
        "business_context": business_context
    })


if __name__ == "__main__":
    app.run(debug=True)
