function addRow(){
    const tbody=document.querySelector("#inputTable tbody");
    let r=tbody.rows.length+1;
    let row=tbody.insertRow();
    row.innerHTML=`
        <td>${r}</td>
        <td><input type="number" class="price"></td>
        <td><input type="number" class="qty"></td>
    `;
}

// Auto add row on Enter
document.addEventListener("keydown", function(e){
    if(e.key === "Enter" && e.target.tagName === "INPUT"){
        let currentInput = e.target;
        let row = currentInput.closest("tr");

        let priceInput = row.querySelector(".price");
        let qtyInput   = row.querySelector(".qty");

        // CASE 1: Cursor is in Price → move to Quantity
        if(currentInput.classList.contains("price")){
            qtyInput.focus();
        }

        // CASE 2: Cursor is in Quantity → add new row and move to next Price
        else if(currentInput.classList.contains("qty")){
            if(priceInput.value !== "" && qtyInput.value !== ""){
                addRow();
                setTimeout(()=>{
                    let allPrices = document.querySelectorAll(".price");
                    allPrices[allPrices.length - 1].focus();
                },50);
            }
        }

        e.preventDefault(); // stop form submission
    }
});


function calculate(){
    let P=[],Q=[];
    document.querySelectorAll(".price").forEach((el,i)=>{
        let q=document.querySelectorAll(".qty")[i];
        if(el.value!=="" && q.value!==""){
            P.push(Number(el.value));
            Q.push(Number(q.value));
        }
    });

    if(P.length<2){
        alert("Enter at least 2 observations");
        return;
    }

    let n=P.length;
    let sumP=0,sumQ=0,sumP2=0,sumPQ=0;

    let tbody=document.querySelector("#calcTable tbody");
    tbody.innerHTML="";

    for(let i=0;i<n;i++){
        let p2=P[i]*P[i];
        let pq=P[i]*Q[i];
        sumP+=P[i];
        sumQ+=Q[i];
        sumP2+=p2;
        sumPQ+=pq;

        let row=tbody.insertRow();
        row.innerHTML=`<td>${P[i]}</td><td>${Q[i]}</td><td>${p2}</td><td>${pq}</td>`;
    }

    let tfoot=document.querySelector("#calcTable tfoot tr");
    tfoot.innerHTML=`<th>${sumP}</th><th>${sumQ}</th><th>${sumP2}</th><th>${sumPQ}</th>`;

    let b=(n*sumPQ - sumP*sumQ)/(n*sumP2 - sumP*sumP);
    let a=(sumQ - b*sumP)/n;

    let Pavg=sumP/n;
    let Qavg=sumQ/n;
    let Ep=b*(Pavg/Qavg);

    drawChart(P,Q,a,b);
    buildDecision(a,b,Ep);
}

let chart;
function drawChart(P,Q,a,b){
    let ctx=document.getElementById("demandChart");
    if(chart) chart.destroy();

    let Pmin=Math.min(...P);
    let Pmax=Math.max(...P);

    chart=new Chart(ctx,{
        type:"scatter",
        data:{
            datasets:[
                {
                    label:"Observed Data",
                    data:P.map((p,i)=>({x:p,y:Q[i]})),
                    backgroundColor:"#4da6ff"
                },
                {
                    label:"Estimated Demand Curve",
                    type:"line",
                    data:[
                        {x:Pmin,y:a+b*Pmin},
                        {x:Pmax,y:a+b*Pmax}
                    ],
                    borderColor:"#003a5c",
                    fill:false
                }
            ]
        },
        options:{
            scales:{
                x:{title:{display:true,text:"Price"}},
                y:{title:{display:true,text:"Quantity"}}
            }
        }
    });
}

function buildDecision(a,b,Ep){
    let text=`<b>Estimated Demand Function:</b><br>
    Q = ${a.toFixed(2)} + (${b.toFixed(2)})P<br><br>
    <b>Price Elasticity:</b> ${Ep.toFixed(2)}<br><br>`;

    if(Math.abs(Ep)>1){
 text+=`📊 <b>Fact:</b> Customers are highly sensitive to price changes.<br>
💡 <b>Decision:</b> Lowering the price can attract more customers and increase total sales.<br>
👉 <b>Suggestion:</b> Use discounts, offers, or promotional pricing strategies.`;
}else{
text+=`📊 <b>Fact:</b> Customers are not very sensitive to price changes.<br>
💡 <b>Decision:</b> You can increase the price without losing many customers.<br>
👉 <b>Suggestion:</b> Focus on value-based pricing rather than discounts.`;
}


    document.getElementById("result").innerHTML=text;
}
