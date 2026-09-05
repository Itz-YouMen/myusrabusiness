const KEY_PRODUCTS="myusrah_products", KEY_HISTORY="myusrah_history";
const getProducts=()=>JSON.parse(localStorage.getItem(KEY_PRODUCTS)||"[]");
const getHistory=()=>JSON.parse(localStorage.getItem(KEY_HISTORY)||"[]");
const saveProducts=p=>localStorage.setItem(KEY_PRODUCTS,JSON.stringify(p));
const saveHistory=h=>localStorage.setItem(KEY_HISTORY,JSON.stringify(h));
const money=n=>"₦"+Number(n||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const escapeHTML=v=>String(v).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));

function setupMenu(){
 const s=document.getElementById("sidebar"),o=document.getElementById("overlay");
 const open=()=>{s?.classList.add("open");o?.classList.add("show")},close=()=>{s?.classList.remove("open");o?.classList.remove("show")};
 document.getElementById("menuBtn")?.addEventListener("click",open);document.getElementById("closeMenu")?.addEventListener("click",close);o?.addEventListener("click",close);
}

function login(){
 const form=document.getElementById("loginForm"); if(!form)return;
 form.addEventListener("submit",e=>{
  e.preventDefault();
  const username=document.getElementById("username").value.trim(), password=document.getElementById("password").value;
  const error=document.getElementById("loginError");
  if((username==="farida"||username==="Farida")&&password==="1985"){
   sessionStorage.setItem("myusrah_logged_in","true"); location.href="dashboard.html";
  }else{error.textContent="Incorrect username or password.";document.getElementById("password").value="";}
 });
}
function protectPages(){
 if(location.pathname.endsWith("index.html")||location.pathname.endsWith("/"))return;
 if(!sessionStorage.getItem("myusrah_logged_in")) location.href="index.html";
}

function renderHome(){
 const products=getProducts(),history=getHistory(),units=products.reduce((a,p)=>a+p.quantity,0);
 const sales=history.reduce((a,h)=>a+h.total,0),profit=history.reduce((a,h)=>a+h.profit,0),discount=history.reduce((a,h)=>a+h.discount,0),discCount=history.filter(h=>h.discount>0).length;
 const set=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
 set("totalProducts",units);set("totalProductUnits",units+" Products");set("totalSales",money(sales));set("totalTransactions",history.length+" Transactions");
 set("totalProfit",money(profit));set("profitTransactions",history.length+" Transaction"+(history.length!==1?"s":""));set("totalDiscount",money(discount));set("discountCount",discCount+" Discounts");
 const list=document.getElementById("productsList"),empty=document.getElementById("emptyProducts");if(!list)return;list.innerHTML="";
 products.filter(p=>p.quantity>0).forEach(p=>list.innerHTML+=`<div class="product-row"><div><small>Product Name</small><strong>${escapeHTML(p.name)}</strong></div><div><small>Product Price</small><strong>${money(p.sellPrice)}</strong></div><div><small>Product Quantity</small><strong>${p.quantity}</strong></div></div>`);
 empty.style.display=products.some(p=>p.quantity>0)?"none":"block";
}
function addProduct(){
 document.getElementById("addProductForm")?.addEventListener("submit",e=>{
  e.preventDefault();const name=document.getElementById("productName").value.trim(),buy=+document.getElementById("buyPrice").value,sell=+document.getElementById("sellPrice").value,qty=+document.getElementById("quantity").value;
  if(!name||qty<1||buy<0||sell<0)return alert("Please enter valid product information.");
  const ps=getProducts(),same=ps.find(p=>p.name.toLowerCase()===name.toLowerCase()&&p.buyPrice===buy&&p.sellPrice===sell);
  if(same)same.quantity+=qty;else ps.push({id:Date.now(),name,buyPrice:buy,sellPrice:sell,quantity:qty});
  saveProducts(ps);alert("Product added successfully!");location.href="dashboard.html";
 });
}
function sellProduct(){
 const select=document.getElementById("sellSelect");if(!select)return;let products=getProducts(),qty=0;
 const fill=()=>select.innerHTML='<option value="">select product</option>'+products.filter(p=>p.quantity>0).map(p=>`<option value="${p.id}">${escapeHTML(p.name)} (${p.quantity} available)</option>`).join("");
 const selected=()=>products.find(p=>String(p.id)===select.value);
 function update(){const p=selected();if(!p){qty=0;document.getElementById("sellQty").textContent=0;document.getElementById("pricePreview").textContent="₦0";return}if(qty>p.quantity)qty=p.quantity;document.getElementById("sellQty").textContent=qty;const d=Math.min(+document.getElementById("discount").value||0,p.sellPrice*qty);document.getElementById("pricePreview").textContent=money(Math.max(0,p.sellPrice*qty-d));}
 fill();select.onchange=()=>{qty=selected()?1:0;update()};document.getElementById("plusQty").onclick=()=>{const p=selected();if(p&&qty<p.quantity){qty++;update()}};document.getElementById("minusQty").onclick=()=>{if(qty>1){qty--;update()}};document.getElementById("discount").oninput=update;
 document.getElementById("sellProductForm").addEventListener("submit",e=>{e.preventDefault();const p=selected(),client=document.getElementById("clientName").value.trim();if(!p||qty<1||!client)return alert("Please select a product, quantity and client name.");const gross=p.sellPrice*qty,d=Math.min(+document.getElementById("discount").value||0,gross),total=gross-d,profit=total-p.buyPrice*qty,now=new Date();const h=getHistory();h.unshift({id:Date.now(),product:p.name,quantity:qty,total,discount:d,client,date:now.toLocaleDateString(),time:now.toLocaleTimeString(),profit});p.quantity-=qty;saveProducts(products);saveHistory(h);location.href="dashboard.html";});
}
function removeProduct(){
 const select=document.getElementById("removeSelect");if(!select)return;
 const qtyInput=document.getElementById("removeQuantity"),info=document.getElementById("selectedProductInfo");
 const fill=()=>{const ps=getProducts();select.innerHTML='<option value="">select product</option>'+ps.filter(p=>p.quantity>0).map(p=>`<option value="${p.id}">${escapeHTML(p.name)} (${p.quantity} available)</option>`).join("");};
 const selected=()=>getProducts().find(p=>String(p.id)===select.value);
 function mode(){const specific=document.querySelector('input[name="removeMode"]:checked')?.value==="quantity";qtyInput.disabled=!specific;if(!specific)qtyInput.value="";}
 document.querySelectorAll('input[name="removeMode"]').forEach(r=>r.addEventListener("change",mode));
 select.addEventListener("change",()=>{const p=selected();info.textContent=p?`${p.name}: ${p.quantity} product(s) currently available.`:"Select a product to see its available quantity.";if(p)qtyInput.max=p.quantity;});
 document.getElementById("removeProductForm").addEventListener("submit",e=>{e.preventDefault();const ps=getProducts(),p=ps.find(x=>String(x.id)===select.value);if(!p)return alert("Please select a product.");const specific=document.querySelector('input[name="removeMode"]:checked').value==="quantity";
 if(specific){const n=+qtyInput.value;if(!Number.isInteger(n)||n<1)return alert("Enter a valid quantity.");if(n>p.quantity)return alert("You cannot remove more than the available quantity.");p.quantity-=n;if(p.quantity===0)ps.splice(ps.indexOf(p),1);}
 else {if(!confirm(`Delete all of "${p.name}"?`))return;ps.splice(ps.indexOf(p),1);}
 saveProducts(ps);alert("Product updated successfully.");location.href="dashboard.html";});
 fill();mode();
}
function renderHistory(){const list=document.getElementById("historyList"),empty=document.getElementById("emptyHistory");if(!list)return;const h=getHistory();list.innerHTML="";h.forEach(x=>list.innerHTML+=`<article class="history-card"><h3>${escapeHTML(x.product)}</h3><div class="history-grid"><div><span>Quantity</span><br><b>${x.quantity}</b></div><div><span>Total Price</span><br><b>${money(x.total)}</b></div><div><span>Discount</span><br><b>${money(x.discount)}</b></div><div><span>Client Name</span><br><b>${escapeHTML(x.client)}</b></div><div><span>Date</span><br><b>${x.date}</b></div><div><span>Time</span><br><b>${x.time}</b></div></div></article>`);empty.style.display=h.length?"none":"block";}
function resetData(){const modal=document.getElementById("confirmModal");if(!modal)return;document.getElementById("resetBtn").onclick=()=>modal.classList.add("show");document.getElementById("cancelReset").onclick=()=>modal.classList.remove("show");document.getElementById("confirmReset").onclick=()=>{saveProducts([]);saveHistory([]);modal.classList.remove("show");renderHome()};}
let deferredPrompt;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferredPrompt=e});document.addEventListener("click",async e=>{if(e.target.id==="installBtn"&&deferredPrompt){deferredPrompt.prompt();await deferredPrompt.userChoice;deferredPrompt=null}});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("service-worker.js"));
protectPages();setupMenu();login();renderHome();addProduct();sellProduct();removeProduct();renderHistory();resetData();
