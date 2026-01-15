function addRow() {
    const tbody = document.querySelector("#inputTable tbody");
    const row = document.createElement("tr");

    row.innerHTML = `
        <td><input type="number" class="qty"></td>
        <td><input type="number" class="price"></td>
        <td><input type="number" class="vc"></td>
    `;
    tbody.appendChild(row);
}

/* ENTER KEY FLOW */
/* ENTER KEY FLOW – ONLY FOR INPUT TABLE */
document.querySelector("#inputTable tbody").addEventListener("keydown", function (e) {

    if (e.key !== "Enter") return;

    const active = document.activeElement;
    if (!active || active.tagName !== "INPUT") return;

    e.preventDefault();

    const row = active.closest("tr");
    if (!row) return;

    const inputs = Array.from(row.querySelectorAll("input"));
    const index = inputs.indexOf(active);

    // Q → P → VC
    if (index < inputs.length - 1) {
        inputs[index + 1].focus();
    }
    // VC → new row → Q
    else {
        addRow();
        setTimeout(() => {
            const lastQty = document.querySelector("#inputTable tbody tr:last-child .qty");
            if (lastQty) lastQty.focus();
        }, 10);
    }
});

/* PROFIT CALCULATION */
function calculateProfit(){

    const fixedCost = Number(document.getElementById("fixedCost").value);
    if(!fixedCost){ alert("Enter Fixed Cost"); return; }

    const rows = document.querySelectorAll("#inputTable tbody tr");
    const tbody = document.querySelector("#calcTable tbody");
    tbody.innerHTML = "";

    let Q = [], Profit = [];
    let maxProfit = -Infinity, minProfit = Infinity;
    let bestRow, worstRow, bestQ;

    rows.forEach(r=>{
        let q = Number(r.querySelector(".qty").value);
        let p = Number(r.querySelector(".price").value);
        let vc = Number(r.querySelector(".vc").value);
        if(!q || !p || !vc) return;

        let TR = p * q;
        let TC = fixedCost + (vc * q);
        let profit = TR - TC;

        let row = tbody.insertRow();
        row.innerHTML = `<td>${q}</td><td>${TR}</td><td>${TC}</td><td>${profit}</td>`;

        if(profit > maxProfit){
            maxProfit = profit;
            bestQ = q;
            bestRow = row;
        }
        if(profit < minProfit){
            minProfit = profit;
            worstRow = row;
        }

        Q.push(q);
        Profit.push(profit);
    });

    if(bestRow) bestRow.classList.add("max-profit");
    if(worstRow) worstRow.classList.add("worst-profit");

    drawProfitChart(Q, Profit);

    document.getElementById("result").innerHTML = `
    <b>📊 Fact:</b><br>
    Profit increases up to Quantity = <b>${bestQ}</b> and then declines.<br><br>

    <b>📌 Insight:</b><br>
    Maximum profit of <b>₹${maxProfit}</b> occurs at this output level.<br><br>

    <b>💡 Recommendation:</b><br>
    Produce <b>${bestQ}</b> units to achieve the highest profit.<br><br>

    <b>⚠ Warning:</b><br>
    Producing beyond this level reduces profitability.<br><br>

    <b>✅ Action:</b><br>
    Maintain output close to the optimal level.
    `;
}

/* PROFIT CURVE */
function drawProfitChart(Q, Profit){
    const canvas = document.getElementById("profitChart");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const pad = 60;
    const maxQ = Math.max(...Q);
    const maxP = Math.max(...Profit);
    const minP = Math.min(...Profit);

    ctx.beginPath();
    ctx.moveTo(pad,20);
    ctx.lineTo(pad,canvas.height-pad);
    ctx.lineTo(canvas.width-20,canvas.height-pad);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle="#e84393";
    ctx.lineWidth=3;

    Q.forEach((q,i)=>{
        let x = pad + (q/maxQ)*(canvas.width-pad-40);
        let y = canvas.height-pad - ((Profit[i]-minP)/(maxP-minP))*(canvas.height-pad-40);
        if(i===0) ctx.moveTo(x,y);
        else ctx.lineTo(x,y);
    });
    ctx.stroke();
}
