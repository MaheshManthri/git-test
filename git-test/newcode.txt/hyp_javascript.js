alert("JavaScript connected");

// Toggle σ / s
function toggleStd() {
    const val = document.getElementById("stdKnown").value;
    document.getElementById("sigmaRow").style.display = val === "yes" ? "flex" : "none";
    document.getElementById("sRow").style.display = val === "no" ? "flex" : "none";
}

// Run test
function runTest() {

    const payload = {
        mu0: document.getElementById("mu0").value,
        mu1: document.getElementById("mu1").value,
        xbar: document.getElementById("xbar").value,
        n: document.getElementById("n").value,
        alpha: document.getElementById("alpha").value,
        decimals: document.getElementById("decimals").value,
        stdKnown: document.getElementById("stdKnown").value,
        sigma: document.getElementById("sigma").value,
        s: document.getElementById("s").value
    };

    fetch("http://127.0.0.1:5000/hypothesis-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById("output").innerHTML = data.formatted_output;
    })
    .catch(() => alert("Backend connection error"));
}
