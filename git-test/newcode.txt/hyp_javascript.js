alert("JavaScript is now connected!");

// ===============================
// UPDATE INPUTS BASED ON TEST TYPE
// ===============================
function updateInputs() {
    const type = document.getElementById("testType").value;
    const section = document.getElementById("dataSection");

    if (type === "one") {
        section.innerHTML = `
            <table id="sampleTable">
                <tr>
                    <th>Sample Values</th>
                </tr>
                <tr>
                    <td><input type="number" class="sample-input"></td>
                </tr>
                <tr>
                    <td><input type="number" class="sample-input"></td>
                </tr>
            </table>
            <button type="button" onclick="addRow()">Add Row</button>
        `;
    }

    if (type === "two") {
        section.innerHTML = `
            <p>Two-sample test will be enabled later.</p>
        `;
    }

    if (type === "paired") {
        section.innerHTML = `
            <p>Paired test will be enabled later.</p>
        `;
    }
}

// ===============================
// ADD ROW (ONE SAMPLE)
// ===============================
function addRow() {
    const table = document.getElementById("sampleTable");
    const row = table.insertRow();
    const cell = row.insertCell(0);
    cell.innerHTML = `<input type="number" class="sample-input">`;
}

// ===============================
// RUN HYPOTHESIS TEST (MAIN)
// ===============================
function runHypothesisTest() {

    const testType = document.getElementById("testType").value;
    const mu0 = document.getElementById("mu0").value;
    const alpha = document.getElementById("alpha").value;
    const alternative = document.getElementById("alternative").value;
    const businessContext = document.getElementById("businessContext").value;

    if (testType !== "one") {
        alert("Only One Sample t-Test is enabled for now.");
        return;
    }

    let sample = [];
    document.querySelectorAll(".sample-input").forEach(input => {
        if (input.value !== "") {
            sample.push(parseFloat(input.value));
        }
    });

    if (sample.length < 2) {
        alert("Please enter at least two sample values.");
        return;
    }

    fetch("http://127.0.0.1:5000/hypothesis-test", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            testType: "One Sample t-Test",
            sample: sample,
            mu0: mu0,
            alpha: alpha,
            alternative: alternative,
            businessContext: businessContext
        })
    })
    .then(response => response.json())
    .then(result => {
        displayResults(result);
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error connecting to backend");
    });
}

// ===============================
// DISPLAY RESULTS
// ===============================
function displayResults(result) {
    document.getElementById("output").innerHTML = `
        <h3>Statistical Results</h3>
        <p><b>Sample Size:</b> ${result.sample_size}</p>
        <p><b>Sample Mean:</b> ${result.sample_mean}</p>
        <p><b>t-Statistic:</b> ${result.t_statistic}</p>
        <p><b>p-Value:</b> ${result.p_value}</p>
        <p><b>Decision:</b> ${result.decision}</p>

        <hr>

        <h3>Managerial Conclusion</h3>
        <p>${result.managerial_conclusion}</p>
    `;
}
