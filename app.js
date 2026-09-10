const KEY_PRODUCTS="myusrah_products", KEY_HISTORY="myusrah_history", KEY_STATS="myusrah_stats";
const getProducts=()=>JSON.parse(localStorage.getItem(KEY_PRODUCTS)||"[]");
const getHistory=()=>JSON.parse(localStorage.getItem(KEY_HISTORY)||"[]");
const getStats=()=>JSON.parse(localStorage.getItem(KEY_STATS)||'{"sales":0,"profit":0,"discount":0,"transactions":0,"discountCount":0}');
const saveProducts=p=>localStorage.setItem(KEY_PRODUCTS,JSON.stringify(p));
const saveHistory=h=>localStorage.setItem(KEY_HISTORY,JSON.stringify(h));
const saveStats=s=>localStorage.setItem(KEY_STATS,JSON.stringify(s));
const money=n=>"₦"+Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const escapeHTML=v=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const page=location.pathname.split("/").pop()||"index.html";

function setupMenu(){
 const s=document.getElementById("sidebar"),o=document.getElementById("overlay");
 const open=()=>{s?.classList.add("open");o?.classList.add("show")};
 const close=()=>{s?.classList.remove("open");o?.classList.remove("show")};
 document.getElementById("menuBtn")?.addEventListener("click",open);
 document.getElementById("closeMenu")?.addEventListener("click",close);
 o?.addEventListener("click",close);
}
function protectPages(){if(page==="index.html"||page==="")return;if(!sessionStorage.getItem("myusrah_logged_in"))location.href="index.html";}
async function notify(title,body){
 if(!('Notification' in window)) return false;
 try{
  if(Notification.permission!=='granted'){
   if(Notification.permission==='denied') return false;
   const permission=await Notification.requestPermission();
   if(permission!=='granted') return false;
  }
  if(navigator.serviceWorker){
   const registration=await navigator.serviceWorker.ready;
   await registration.showNotification(title,{body,icon:'icon-192.png',badge:'icon-192.png'});
  }else{
   new Notification(title,{body,icon:'icon-192.png'});
  }
  return true;
 }catch(e){return false}
}
function login(){
 const form=document.getElementById("loginForm");if(!form)return;
 form.addEventListener("submit",e=>{e.preventDefault();const u=document.getElementById("username").value.trim(),p=document.getElementById("password").value,err=document.getElementById("loginError");
 const valid=(u==="farida"||u==="Farida")&&p==="1985" || (u==="youmen"||u==="Youmen")&&p==="0622" || (u==="Business"||u==="business")&&p==="2030";
 if(valid){sessionStorage.setItem("myusrah_logged_in","true");notify("Y-M Business Analysis","Wellcome to YM Business Analysis").finally(()=>{location.href="dashboard.html"})}
 else{err.textContent="Incorrect username or password.";document.getElementById("password").value=""}})
}

function renderHome(){
 const products=getProducts(),stats=getStats(),list=document.getElementById("productsList"),empty=document.getElementById("emptyProducts");if(!list)return;
 const units=products.reduce((a,p)=>a+Number(p.quantity),0);
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
 set("totalProducts",units);set("totalProductUnits",products.filter(p=>p.quantity>0).length+" Product Types • "+units+" Units");
 set("totalSales",money(stats.sales));set("totalTransactions",stats.transactions+" Transactions");set("totalProfit",money(stats.profit));set("profitTransactions",stats.transactions+" Transaction"+(stats.transactions!==1?"s":""));set("totalDiscount",money(stats.discount));set("discountCount",stats.discountCount+" Discounts");
 list.innerHTML="";const active=products.filter(p=>p.quantity>0);active.forEach((p,i)=>list.innerHTML+=`<div class="product-row"><div class="product-no">#${i+1}</div><div><small>Product Name</small><strong>${escapeHTML(p.name)}</strong></div><div><small>Product Price</small><strong>${money(p.sellPrice)}</strong></div><div><small>Product Quantity</small><strong>${p.quantity}</strong></div></div>`);
 empty.style.display=active.length?"none":"block";
}
function addProduct(){document.getElementById("addProductForm")?.addEventListener("submit",e=>{e.preventDefault();const name=document.getElementById("productName").value.trim(),buy=+document.getElementById("buyPrice").value,sell=+document.getElementById("sellPrice").value,qty=+document.getElementById("quantity").value;if(!name||qty<1||buy<0||sell<0)return alert("Please enter valid product information.");const ps=getProducts(),same=ps.find(p=>p.name.toLowerCase()===name.toLowerCase()&&p.buyPrice===buy&&p.sellPrice===sell);if(same)same.quantity+=qty;else ps.push({id:Date.now(),name,buyPrice:buy,sellPrice:sell,quantity:qty});saveProducts(ps);alert("Product added successfully!");location.href="dashboard.html"})}

function receiptText(h){return `Y-M BUSINESS ANALYSIS\n------------------------------\nSALES RECEIPT\nReceipt No: ${h.receiptNo}\nProduct: ${h.product}\nQuantity: ${h.quantity}\nUnit Price: ${money(h.unitPrice)}\nSubtotal: ${money(h.subtotal)}\nDiscount: ${money(h.discount)}\nTOTAL: ${money(h.total)}\nClient: ${h.client}\nDate: ${h.date}\nTime: ${h.time}\n------------------------------\nThank you for your patronage.`}
function receiptHTML(h){return `<div class="receipt"><div class="receipt-brand">Y-M BUSINESS ANALYSIS</div><div class="receipt-title">SALES RECEIPT</div><div class="receipt-line"><span>Receipt No.</span><b>${escapeHTML(h.receiptNo)}</b></div><div class="receipt-line"><span>Product</span><b>${escapeHTML(h.product)}</b></div><div class="receipt-line"><span>Quantity</span><b>${h.quantity}</b></div><div class="receipt-line"><span>Unit Price</span><b>${money(h.unitPrice)}</b></div><div class="receipt-line"><span>Subtotal</span><b>${money(h.subtotal)}</b></div><div class="receipt-line"><span>Discount</span><b>${money(h.discount)}</b></div><div class="receipt-total"><span>TOTAL</span><b>${money(h.total)}</b></div><div class="receipt-line"><span>Client</span><b>${escapeHTML(h.client)}</b></div><div class="receipt-line"><span>Date</span><b>${h.date}</b></div><div class="receipt-line"><span>Time</span><b>${h.time}</b></div><p>Thank you for your patronage.</p></div>`}
function openReceipt(h,redirect=false){const modal=document.getElementById("receiptModal");if(!modal)return;modal.classList.add("show");document.getElementById("receiptContent").innerHTML=receiptHTML(h);document.getElementById("shareReceipt").onclick=()=>shareReceipt(h);document.getElementById("printReceipt")?.addEventListener("click",()=>printReceipt(h));document.getElementById("okReceipt").onclick=()=>{modal.classList.remove("show");if(redirect)location.href="dashboard.html"};}
async function shareReceipt(h){
 const text=receiptText(h);
 try{
   const canvas=document.createElement("canvas");
   const scale=2, width=900, padding=55, lineH=54;
   const lines=[
    ["Y-M BUSINESS ANALYSIS",true], ["SALES RECEIPT",true], ["",false],
    ["Receipt No.",h.receiptNo], ["Product",h.product], ["Quantity",String(h.quantity)],
    ["Unit Price",money(h.unitPrice)], ["Subtotal",money(h.subtotal)], ["Discount",money(h.discount)],
    ["TOTAL",money(h.total)], ["Client",h.client], ["Date",h.date], ["Time",h.time],
    ["",false], ["Thank you for your patronage.",false]
   ];
   canvas.width=width*scale; canvas.height=(padding*2+lines.length*lineH)*scale;
   const ctx=canvas.getContext("2d"); ctx.scale(scale,scale); ctx.fillStyle="#ffffff"; ctx.fillRect(0,0,width,canvas.height/scale);
   ctx.strokeStyle="#777"; ctx.setLineDash([8,6]); ctx.strokeRect(20,20,width-40,canvas.height/scale-40); ctx.setLineDash([]);
   let y=padding;
   lines.forEach((row,i)=>{
     if(row[0]===""){y+=18;return}
     if(i===0){ctx.textAlign="center";ctx.font="bold 32px Arial";ctx.fillStyle="#2165bf";ctx.fillText(row[0],width/2,y);y+=lineH;return}
     if(i===1){ctx.font="bold 25px Arial";ctx.fillStyle="#222";ctx.fillText(row[0],width/2,y);y+=lineH;return}
     if(i===9){ctx.font="bold 25px Arial";ctx.fillStyle="#111";ctx.fillText(row[0]+"     "+row[1],width/2,y);ctx.textAlign="center";y+=lineH;return}
     ctx.textAlign="left";ctx.font="21px Arial";ctx.fillStyle="#555";ctx.fillText(row[0],70,y);
     ctx.textAlign="right";ctx.font="bold 21px Arial";ctx.fillStyle="#111";ctx.fillText(String(row[1]),width-70,y);
     ctx.strokeStyle="#ddd";ctx.beginPath();ctx.moveTo(70,y+14);ctx.lineTo(width-70,y+14);ctx.stroke();y+=lineH;
   });
   const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));
   const file=new File([blob],`${h.receiptNo}.png`,{type:"image/png"});
   if(navigator.share){
     if(navigator.canShare&&navigator.canShare({files:[file]})) await navigator.share({title:`Y-M Receipt ${h.receiptNo}`,text:`Receipt ${h.receiptNo} — ${h.product} sold to ${h.client}`,files:[file]});
     else await navigator.share({title:`Y-M Receipt ${h.receiptNo}`,text});
   }else{
     const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${h.receiptNo}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
     alert("Receipt image created. You can now share the PNG image.");
   }
 }catch(e){
   try{await navigator.clipboard?.writeText(text)}catch(_){}
   alert("Image sharing is not available on this browser. The receipt text was copied instead.");
 }
}
function printReceipt(h){
 const w=window.open('','_blank','width=480,height=700');if(!w)return;
 w.document.write(`<!doctype html><html><head><title>${h.receiptNo}</title><style>body{font-family:Arial;padding:20px}.receipt{max-width:380px;margin:auto;border:1px dashed #777;padding:20px}.line{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px dashed #ddd}.total{font-size:20px;font-weight:bold;border-top:2px solid #222;border-bottom:2px solid #222;padding:10px 0}</style></head><body><div class="receipt"><h2 style="text-align:center">Y-M BUSINESS ANALYSIS</h2><h3 style="text-align:center">SALES RECEIPT</h3><div class="line"><span>Receipt</span><b>${escapeHTML(h.receiptNo)}</b></div><div class="line"><span>Product</span><b>${escapeHTML(h.product)}</b></div><div class="line"><span>Quantity</span><b>${h.quantity}</b></div><div class="line"><span>Unit Price</span><b>${money(h.unitPrice)}</b></div><div class="line"><span>Subtotal</span><b>${money(h.subtotal)}</b></div><div class="line"><span>Discount</span><b>${money(h.discount)}</b></div><div class="total"><span>TOTAL</span> ${money(h.total)}</div><div class="line"><span>Client</span><b>${escapeHTML(h.client)}</b></div><div class="line"><span>Date</span><b>${h.date}</b></div><div class="line"><span>Time</span><b>${h.time}</b></div><p style="text-align:center">Thank you.</p></div><script>window.onload=()=>window.print()<\/script></body></html>`);w.document.close();
}

function shareReceiptFromHistory(h){openReceipt(h,false)}
function sellProduct(){
 const select=document.getElementById("sellSelect");if(!select)return;let products=getProducts(),qty=0;
 const fill=()=>select.innerHTML='<option value="">select product</option>'+products.filter(p=>p.quantity>0).map(p=>`<option value="${p.id}">${escapeHTML(p.name)} (${p.quantity} available)</option>`).join("");
 const selected=()=>products.find(p=>String(p.id)===select.value);
 const qtyInput=document.getElementById("sellQuantityInput");
 function update(){const p=selected();if(!p){qty=0;if(qtyInput)qtyInput.value="";if(document.getElementById("sellQty"))document.getElementById("sellQty").textContent=0;document.getElementById("pricePreview").textContent="₦0";return}if(qty>p.quantity)qty=p.quantity;if(qty<0)qty=0;if(qtyInput)qtyInput.value=qty||"";if(document.getElementById("sellQty"))document.getElementById("sellQty").textContent=qty;const d=Math.min(+document.getElementById("discount").value||0,p.sellPrice*qty);document.getElementById("pricePreview").textContent=money(Math.max(0,p.sellPrice*qty-d));if(document.getElementById("priceBreakdown"))document.getElementById("priceBreakdown").textContent=`${money(p.sellPrice)} × ${qty} item(s)${d>0?` • Discount ${money(d)}`:""}`;}
 fill();select.onchange=()=>{const p=selected();qty=p?1:0;update()};
 document.getElementById("plusQty").onclick=()=>{const p=selected();if(p&&qty<p.quantity){qty++;update()}};
 document.getElementById("minusQty").onclick=()=>{if(qty>1){qty--;update()}};
 qtyInput?.addEventListener("input",()=>{const p=selected();let n=parseInt(qtyInput.value||"0",10);if(!p){qty=0;return}if(n>p.quantity){alert(`Only ${p.quantity} item(s) are available.`);n=p.quantity;qtyInput.value=n}qty=Math.max(0,n);update()});
 document.getElementById("discount").oninput=update;
 document.getElementById("sellProductForm").addEventListener("submit",e=>{e.preventDefault();products=getProducts();const p=products.find(x=>String(x.id)===select.value),client=document.getElementById("clientName").value.trim(),entered=parseInt(qtyInput?.value||qty,10);if(!p||!client||!Number.isInteger(entered)||entered<1)return alert("Please select a product, enter a valid quantity and client name.");if(entered>p.quantity){return alert(`Only ${p.quantity} item(s) are available. You cannot sell more than the available quantity.`)}qty=entered;const gross=p.sellPrice*qty,d=Math.min(+document.getElementById("discount").value||0,gross),total=gross-d,profit=total-p.buyPrice*qty,now=new Date(),h=getHistory(),receiptNo="MY-"+now.getFullYear()+String(now.getMonth()+1).padStart(2,"0")+String(now.getDate()).padStart(2,"0")+"-"+String(Date.now()).slice(-6),item={id:Date.now(),receiptNo,product:p.name,quantity:qty,unitPrice:p.sellPrice,subtotal:gross,total,discount:d,client,date:now.toLocaleDateString(),time:now.toLocaleTimeString(),profit};h.unshift(item);const previousQuantity=p.quantity;p.quantity-=qty;saveProducts(products);saveHistory(h);const s=getStats();s.sales+=total;s.profit+=profit;s.discount+=d;s.transactions++;if(d>0)s.discountCount++;saveStats(s);openReceipt(item,true);notify(`${p.name} sold to ${client}`,`${p.name} sold to ${client} • ${item.date} • ${item.time}`);if(previousQuantity>10&&p.quantity<=10){notify("Low stock alert",`${p.name} has only ${p.quantity} item(s) remaining.`)};});
}
function renderHistory(){const list=document.getElementById("historyList"),empty=document.getElementById("emptyHistory");if(!list)return;const h=getHistory();list.innerHTML="";h.forEach(x=>list.innerHTML+=`<article class="history-card"><div class="history-head"><div><h3>${escapeHTML(x.product)}</h3><small>${escapeHTML(x.receiptNo)}</small></div></div><div class="history-grid"><div><span>Quantity</span><br><b>${x.quantity}</b></div><div><span>Total Price</span><br><b>${money(x.total)}</b></div><div><span>Discount</span><br><b>${money(x.discount)}</b></div><div><span>Client Name</span><br><b>${escapeHTML(x.client)}</b></div><div><span>Date</span><br><b>${x.date}</b></div><div><span>Time</span><br><b>${x.time}</b></div></div><button class="view-receipt" data-id="${x.id}">View Receipt</button></article>`);empty.style.display=h.length?"none":"block";list.querySelectorAll(".view-receipt").forEach(b=>b.onclick=()=>{const x=getHistory().find(x=>x.id===+b.dataset.id);if(x)openReceipt(x,false)})}
function deleteAllHistory(){const b=document.getElementById("deleteAllHistory");if(!b)return;b.onclick=()=>{if(confirm("Delete ALL sales history? This cannot be undone.")){saveHistory([]);renderHistory()}}}
function resetData(){const modal=document.getElementById("confirmModal");if(!modal)return;document.getElementById("resetBtn").onclick=()=>modal.classList.add("show");document.getElementById("cancelReset").onclick=()=>modal.classList.remove("show");document.getElementById("confirmReset").onclick=()=>{saveProducts([]);saveStats({sales:0,profit:0,discount:0,transactions:0,discountCount:0});modal.classList.remove("show");renderHome()}}
function removeProduct(){
 const select=document.getElementById("removeSelect");if(!select)return;const qtyInput=document.getElementById("editQuantity"),nameInput=document.getElementById("editName"),buyInput=document.getElementById("editBuyPrice"),sellInput=document.getElementById("editSellPrice"),info=document.getElementById("selectedProductInfo");
 const fill=()=>{const ps=getProducts();select.innerHTML='<option value="">select product</option>'+ps.filter(p=>p.quantity>0).map(p=>`<option value="${p.id}">${escapeHTML(p.name)} (${p.quantity} available)</option>`).join("")};
 const selected=()=>getProducts().find(p=>String(p.id)===select.value);
 select.onchange=()=>{const p=selected();if(!p){info.textContent="Select a product to edit.";return}nameInput.value=p.name;buyInput.value=p.buyPrice;sellInput.value=p.sellPrice;qtyInput.value=p.quantity;info.textContent=`Editing: ${p.name} • ${p.quantity} available.`};
 document.getElementById("removeProductForm").onsubmit=e=>{e.preventDefault();const ps=getProducts(),p=ps.find(x=>String(x.id)===select.value);if(!p)return alert("Please select a product.");const q=+qtyInput.value,b=+buyInput.value,sp=+sellInput.value,n=nameInput.value.trim();if(!n||!Number.isInteger(q)||q<1||b<0||sp<0)return alert("Enter valid product details.");p.name=n;p.quantity=q;p.buyPrice=b;p.sellPrice=sp;saveProducts(ps);alert("Product updated successfully.");location.href="dashboard.html"};fill();
}

function analytics(){
 const host=document.getElementById("analyticsCharts");if(!host)return;
 const products=getProducts(),history=getHistory();
 const datasets={
  available:{title:"Available Products",items:products.filter(p=>p.quantity>0).map(p=>({n:p.name,v:Number(p.quantity)}))},
  mostSold:{title:"Most Sold Products",items:Object.entries(history.reduce((a,h)=>(a[h.product]=(a[h.product]||0)+h.quantity,a),{})).map(([n,v])=>({n,v})).sort((a,b)=>b.v-a.v).slice(0,8)},
  sales:{title:"Total Sales",items:daily(history,h=>h.total)},
  profit:{title:"Total Profit",items:daily(history,h=>h.profit)},
  discounts:{title:"Total Discounts",items:daily(history,h=>h.discount)},
  sold:{title:"Products Sold",items:daily(history,h=>h.quantity)}
 };
 function daily(h,fn){const d={};h.forEach(x=>d[x.date]=(d[x.date]||0)+Number(fn(x)||0));return Object.entries(d).map(([n,v])=>({n,v})).sort((a,b)=>new Date(a.n)-new Date(b.n)).slice(-14)}
 function draw(c,data,title){const dpr=devicePixelRatio||1,w=c.clientWidth,h=c.clientHeight;c.width=w*dpr;c.height=h*dpr;const x=c.getContext("2d");x.scale(dpr,dpr);x.clearRect(0,0,w,h);x.fillStyle="#3d4147";x.font="16px Arial";x.fillText(title,12,24);const vals=data.map(d=>Number(d.v)),max=Math.max(1,...vals),L=42,B=h-42,T=48,g=10,bw=Math.max(18,(w-L-g*(data.length+1))/Math.max(1,data.length));x.strokeStyle="#aab4c1";x.beginPath();x.moveTo(L,T);x.lineTo(L,B);x.lineTo(w-8,B);x.stroke();data.forEach((q,i)=>{const bh=(B-T)*q.v/max,xx=L+g+i*(bw+g),yy=B-bh;x.fillStyle="#2165bf";x.fillRect(xx,yy,bw,bh);x.fillStyle="#4f5862";x.font="11px Arial";x.fillText(String(q.v),xx,yy-5);x.save();x.translate(xx+bw/2,B+13);x.rotate(-.55);x.textAlign="right";x.fillText(String(q.n).slice(0,12),0,0);x.restore()})}
 host.innerHTML="";Object.entries(datasets).forEach(([key,ds])=>{const card=document.createElement("section");card.className="chart-card";card.innerHTML=`<canvas></canvas><a class="chart-history-btn" href="analytics-history.html?metric=${key}">View history</a>`;host.appendChild(card);draw(card.querySelector("canvas"),ds.items,ds.title)});window.onresize=()=>analytics();
}

function renderAnalyticsHistory(){
 const c=document.getElementById("historyMetricChart");if(!c)return;
 const key=new URLSearchParams(location.search).get("metric")||"mostSold",history=getHistory();
 const titleMap={available:"Available Products",mostSold:"Most Sold Products",sales:"Total Sales",profit:"Total Profit",discounts:"Total Discounts",sold:"Products Sold"};
 const title=titleMap[key]||"Analysis";document.getElementById("historyMetricTitle").textContent=title+" History";
 const weekdayDate=d=>{const raw=String(d||"");let dt=null;if(/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(raw)){const [dd,mm,yyyy]=raw.split("/").map(Number);dt=new Date(yyyy,mm-1,dd)}else if(/^\d{4}-\d{1,2}-\d{1,2}$/.test(raw)){const [yyyy,mm,dd]=raw.split("-").map(Number);dt=new Date(yyyy,mm-1,dd)}else dt=new Date(raw);const day=isNaN(dt)?"":dt.toLocaleDateString(undefined,{weekday:"long"});return day?`${raw} • ${day}`:raw};
 let data=[];
 if(key==="mostSold"){
   const grouped={};history.forEach(x=>{const k=x.date+"|||"+x.product;grouped[k]=(grouped[k]||0)+Number(x.quantity||0)});
   data=Object.entries(grouped).map(([k,v])=>{const [date,product]=k.split("|||");return {date,day:weekdayDate(date),product,v}}).sort((a,b)=>b.v-a.v);
 }else if(key==="available"){
   data=getProducts().map(p=>({date:"Today",day:"Today",product:p.name,v:Number(p.quantity)||0}));
 }else{
   const fn=key==="sales"?x=>x.total:key==="profit"?x=>x.profit:key==="discounts"?x=>x.discount:x=>x.quantity;const grouped={};history.forEach(x=>grouped[x.date]=(grouped[x.date]||0)+Number(fn(x)||0));
   data=Object.entries(grouped).map(([date,v])=>({date,day:weekdayDate(date),v}));
 }
 const dpr=devicePixelRatio||1,w=c.clientWidth||320,hgt=c.clientHeight||300;c.width=w*dpr;c.height=hgt*dpr;const ctx=c.getContext("2d");ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,hgt);
 ctx.fillStyle="#3d4147";ctx.font="bold 16px Arial";ctx.fillText(title,12,24);
 const max=Math.max(1,...data.map(q=>q.v||0)),L=48,B=hgt-62,T=52,g=10,bw=Math.max(18,(w-L-g*(data.length+1))/Math.max(1,data.length));
 data.slice(0,40).reverse().forEach((q,i)=>{const bh=(B-T)*(q.v||0)/max,xx=L+g+i*(bw+g),yy=B-bh;ctx.fillStyle="#2165bf";ctx.fillRect(xx,yy,bw,bh);ctx.fillStyle="#4f5862";ctx.font="11px Arial";ctx.textAlign="center";ctx.fillText(String(q.v||0),xx+bw/2,yy-5);ctx.save();ctx.translate(xx+bw/2,B+14);ctx.rotate(-.6);ctx.textAlign="right";ctx.fillText(String(q.day||q.date).slice(0,22),0,0);ctx.restore()});
 const list=document.getElementById("historyTable");
 list.innerHTML=data.map(q=>`<div class="analysis-history-row"><div><b>${escapeHTML(q.day||q.date)}</b>${q.product?`<small>${escapeHTML(q.product)}</small>`:""}</div><span>${key==="sales"||key==="profit"||key==="discounts"?money(q.v):q.v}</span></div>`).join("")||'<div class="empty-state">No historical data yet.</div>';
}

let deferredPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e});document.addEventListener("click",async e=>{if(e.target.id==="installBtn"&&deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null}});if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js"));
protectPages();setupMenu();login();renderHome();addProduct();sellProduct();removeProduct();renderHistory();resetData();analytics();
