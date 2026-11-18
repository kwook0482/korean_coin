const palette = [
  {name:"1만 개 이하",max:10000,color:"#e34d4d"},
  {name:"5만 개 이하",max:50000,color:"#f28b32"},
  {name:"10만 개 이하",max:100000,color:"#f2cf45"},
  {name:"50만 개 이하",max:500000,color:"#4fa66a"},
  {name:"100만 개 이하",max:1000000,color:"#438bd1"},
  {name:"500만 개 이하",max:5000000,color:"#525db0"},
  {name:"1,000만 개 이하",max:10000000,color:"#8a55b4"}
];
const neutral = "#e8e8e5";
let selected = "500";
const data = window.COIN_DATA;
const byId = Object.fromEntries(data.denominations.map(x=>[x.id,x]));

function fmt(n){return Number(n).toLocaleString("ko-KR")+"개"}
function getValue(value){
  if(value===null || value===undefined) return {text:"미발행",status:"미발행",color:"#efefed"};
  if(typeof value==="object" && "amount" in value) return {text:fmt(value.amount),status:value.estimated?"추정":"발행",amount:value.amount,estimated:!!value.estimated};
  if(typeof value==="object" && ("old" in value || "new" in value)) return {dual:true,old:value.old,new:value.new};
  return {text:fmt(value),status:"발행",amount:value};
}
function band(amount){
  if(amount===undefined || amount===null) return neutral;
  const found=palette.find(x=>amount<=x.max);
  return found?found.color:neutral;
}
function renderCoins(){
  const grid=document.getElementById("coinGrid");
  grid.innerHTML=data.denominations.map(c=>`
    <button class="coin-card ${c.id===selected?"active":""}" data-id="${c.id}" aria-pressed="${c.id===selected}">
      <img src="${c.image}" alt="${c.label} 주화">
      <strong>${c.label}</strong><small>${c.design}</small>
    </button>`).join("");
  grid.querySelectorAll("button").forEach(btn=>btn.addEventListener("click",()=>{selected=btn.dataset.id;renderCoins();renderTable();}));
}
function renderLegend(){
  document.getElementById("legendItems").innerHTML=palette.map(x=>`
    <div class="legend-item"><span class="swatch" style="background:${x.color}"></span><span>${x.name}</span></div>`).join("")+
    `<div class="legend-item"><span class="swatch" style="background:${neutral}"></span><span>1,000만 초과</span></div>`;
}
function renderTable(){
  const coin=byId[selected];
  document.getElementById("selectedCoinImage").src=coin.image;
  document.getElementById("selectedCoinImage").alt=coin.label+" 주화";
  document.getElementById("tableTitle").textContent=coin.label+" 주화 발행량";
  document.getElementById("coinDescription").textContent=coin.design+" 도안 · 연도별 발행 수량";
  const q=document.getElementById("yearSearch").value.trim();
  const order=document.getElementById("sortOrder").value;
  let rows=[...data.rows].filter(r=>!q || String(r.year).includes(q));
  rows.sort((a,b)=>order==="asc"?a.year-b.year:b.year-a.year);
  const tbody=document.getElementById("coinRows");
  tbody.innerHTML=rows.map(r=>{
    const v=getValue(r.values[selected]);
    if(v.dual){
      return `<tr><td>${r.year}년</td><td><div class="amount-cell"><span class="amount-chip" style="background:${band(v.old)}">구형 ${fmt(v.old)}</span><span class="amount-chip" style="background:${band(v.new)}">신형 ${fmt(v.new)}</span></div></td><td><div class="type-stack"><span class="type-pill">구형</span><span class="type-pill">신형</span></div></td></tr>`;
    }
    const bg=v.amount!==undefined?band(v.amount):neutral;
    const statusClass=v.estimated?"status estimate":"status";
    return `<tr><td>${r.year}년</td><td><div class="amount-cell"><span class="amount-chip" style="background:${bg}">${v.text}</span>${v.estimated?'<span class="status estimate">추정</span>':''}</div></td><td><span class="${statusClass}">${v.status}</span></td></tr>`;
  }).join("");
  document.getElementById("tableCount").textContent=`${rows.length}개 연도 표시 · 발행량 색상은 수량 구간을 나타내며 실제 거래 가격이나 잔존 수량을 의미하지 않습니다.`;
}
document.getElementById("yearSearch").addEventListener("input",renderTable);
document.getElementById("sortOrder").addEventListener("change",renderTable);
renderCoins();renderLegend();renderTable();