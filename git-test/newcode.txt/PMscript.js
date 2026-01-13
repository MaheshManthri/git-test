function addRow() {
    let table = document.querySelector("#inputTable tbody");
    let row = document.createElement("tr");

    row.innerHTML = `
        <td><input type="number" class="qty"></td>
        <td><input type="number" class="price"></td>
        <td><input type="number" class="vc"></td>
    `;

    table.appendChild(row);
}

/* ---------------- PROFIT CALCULATION ---------------- */

function calculateProfit() {

    let fixedCost = Number(document.getElementById("fixedCost").value);

    if (fixedCost === 0) {
        alert("Please enter Fixed Cost");
        return;
    }

    let rows = document.querySelectorAll("#inputTable tbody tr");

    let output = `<h3>📊 Profit Calculation</h3>`;
    output += `<table>
        <tr>
            <th>Q</th><th>P</th><th>VC</th>
            <th>TR</th><th>TC</th><th>Profit</th>
        </tr>`;

    let maxProfit = -Infinity;
    let bestQ = 0;

    rows.forEach(row => {
        let Q = Number(row.querySelector(".qty").value);
        let P = Number(row.querySelector(".price").value);
        let VC = Number(row.querySelector(".vc").value);

        if (Q && P && VC) {
            let TR = P * Q;
            let TC = fixedCost + (VC * Q);
            let profit = TR - TC;

            if (profit > maxProfit) {
                maxProfit = profit;
                bestQ = Q;
            }

            output += `
                <tr>
                    <td>${Q}</td>
                    <td>${P}</td>
                    <td>${VC}</td>
                    <td>${TR}</td>
                    <td>${TC}</td>
                    <td>${profit}</td>
                </tr>
            `;
        }
    });

    output += `</table>`;

    output += `
    <div class="result">
        <b>📌 Decision & Recommendation</b><br><br>
        ✔ Maximum profit of <b>${maxProfit}</b> occurs at output level <b>${bestQ}</b>.<br>
        ✔ Producing below this level means lost revenue.<br>
        ✔ Producing above this level increases unnecessary costs.<br>
        ✔ Maintain production close to <b>${bestQ}</b> units.<br>
        ✔ This ensures optimal use of resources and higher business efficiency.
    </div>
    `;

    document.querySelector(".container").insertAdjacentHTML("beforeend", output);
}// ===============================
// ENTER KEY AUTO FLOW FOR INPUTS
// ===============================
document.addEventListener("keydown", function (e) {

    if (e.key !== "Enter") return;

    let active = document.activeElement;

    if (!active || active.tagName !== "INPUT") return;

    e.preventDefault(); // stop page refresh

    let row = active.closest("tr");
    if (!row) return;

    let inputs = Array.from(row.querySelectorAll("input"));
    let index = inputs.indexOf(active);

    // Move to next input in same row
    if (index < inputs.length - 1) {
        inputs[index + 1].focus();
    } 
    // If last input (VC), add new row
    else {
        addRow();

        setTimeout(() => {
            let allQty = document.querySelectorAll(".qty");
            allQty[allQty.length - 1].focus();
        }, 50);
    }
});
