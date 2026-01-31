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

/* ENTER KEY FLOW – UNCHANGED */
document.querySelector("#inputTable tbody").addEventListener("keydown", function (e) {

    if (e.key !== "Enter") return;

    const active = document.activeElement;
    if (!active || active.tagName !== "INPUT") return;

    e.preventDefault();

    const row = active.closest("tr");
    if (!row) return;

    const inputs = Array.from(row.querySelectorAll("input"));
    const index = inputs.indexOf(active);

    if (index < inputs.length - 1) {
        inputs[index + 1].focus();
    } else {
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
    let maxProfit = -Infinity;
    let bestRow, worstRow, bestQ;

    rows.forEach(r=>{
        let q = Number(r.querySelector(".qty").value);
        let p = Number(r.querySelector(".price").value);
        let vc = Number(r.querySelector(".vc").value);
        if(!q || !p || !vc) return;

        let TR = p * q;
        let TC = fixedCost + (vc * q);
        let profit = TR - TC;

        /* ✅ BREAK-EVEN PRICE ADDED */
        let breakEvenPrice = TC / q;

        let row = tbody.insertRow();
        row.innerHTML = `
            <td>${q}</td>
            <td>${TR}</td>
            <td>${TC}</td>
            <td>${profit}</td>
            <td>${breakEvenPrice.toFixed(2)}</td>
        `;

        if(profit > maxProfit){
            maxProfit = profit;
            bestQ = q;
            bestRow = row;
        }

        Q.push(q);
        Profit.push(profit);
    });

    if(bestRow) bestRow.classList.add("max-profit");

    drawProfitChart(Q, Profit);

    document.getElementById("result").innerHTML = `
    <b>📊 Profit Result:</b><br>
    Maximum profit of <b>₹${maxProfit}</b> occurs at Quantity = <b>${bestQ}</b>.<br><br>

    <b>💰 Break-Even Price Analysis:</b><br>
    Break-even price is the minimum price required to cover total cost.<br>
    If actual price is higher than break-even price → profit is earned.<br>
    If actual price is lower than break-even price → loss occurs.<br><br>

    <b>✅ Managerial Decision:</b><br>
    Fix prices above the break-even level and operate near the optimal output.
    `;
}

/* PROFIT CURVE – UNCHANGED */
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