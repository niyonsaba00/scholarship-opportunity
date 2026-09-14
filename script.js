
 let scholarships = [];

let saved = JSON.parse(localStorage.getItem("savedScholarships") || "[]");
let sortSoon = true;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const daysUntil = date => Math.ceil((new Date(date)-new Date())/86400000);
const esc = s => String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
async function loadScholarships(){
  try{
    const r=await fetch("/api/scholarships");

    if(!r.ok){
      throw new Error("Failed to load scholarships");
    }

    scholarships=await r.json();

    render();
    renderDeadlines();

  }catch(e){
    console.error(e);
  
    $("#scholarshipGrid").innerHTML=`
      <div class="empty">
        <h3>Unable to load scholarships</h3>
        <p>Please refresh the page and try again.</p>
      </div>
    `;

    $("#resultCount").textContent="0 opportunities";
  }
}
function render(list=scholarships){
  const grid=$("#scholarshipGrid");
  if(!list.length){grid.innerHTML='<div class="empty"><h3>No scholarships found</h3><p>Try removing a filter or using a broader search.</p></div>';$("#resultCount").textContent="0 opportunities";return}
  const sorted=[...list].sort((a,b)=>sortSoon?new Date(a.deadline)-new Date(b.deadline):a.name.localeCompare(b.name));
grid.innerHTML=sorted.map(s=>`
    <article class="card">
      <div class="card-top">
        <span class="badge">${esc(s.funding)}</span>
        <button class="save ${saved.includes(s.id)?"active":""}" data-save="${s.id}" aria-label="Save">★</button>
      </div>

      <h3>${esc(s.name)}</h3>
      <div class="provider">${esc(s.provider)}</div>

      <div class="meta">
        <span>🎓 ${esc(s.level)}</span>
        <span>🌍 ${esc(s.country)}</span>
        <span>📚 ${esc(s.field)}</span>
      </div>

      <div class="card-bottom">
        <div class="deadline">
          Deadline
          <strong>${new Date(s.deadline).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"})}</strong>
        </div>
      </div>

      <div class="card-description">
        <p>${esc(s.description || "No description available.")}</p>
      </div>

      <div class="card-actions">
  <button class="btn btn-primary" data-details="${s.id}">View details</button>
</div>
    </article>`).join("");
  $("#resultCount").textContent=`${list.length} opportunities`;
  $$("[data-save]").forEach(b=>b.onclick=()=>toggleSave(+b.dataset.save));

  $$("[data-details]").forEach(b=>b.onclick=()=>{
  const s=scholarships.find(x=>x.id===Number(b.dataset.details));
  if(!s)return;

  modal(
    s.name,
    `
      <p><strong>Provider:</strong> ${esc(s.provider)}</p>
      <p><strong>Country:</strong> ${esc(s.country)}</p>
      <p><strong>Level:</strong> ${esc(s.level)}</p>
      <p><strong>Funding:</strong> ${esc(s.funding)}</p>
      <p><strong>Field:</strong> ${esc(s.field)}</p>
      <p><strong>Deadline:</strong> ${new Date(s.deadline).toLocaleDateString()}</p>
      <hr>
      <p>${esc(s.description || "No description available.")}</p>
      ${s.source_url ? `<a class="btn btn-primary" href="${esc(s.source_url)}" target="_blank" rel="noopener">Visit official page ↗</a>` : ""}
    `
  );
});
}
function toggleSave(id){saved=saved.includes(id)?saved.filter(x=>x!==id):[...saved,id];localStorage.setItem("savedScholarships",JSON.stringify(saved));applyFilters();renderDeadlines();}
function applyFilters(){
  const q=($("#searchInput").value||$("#heroSearch").value||"").toLowerCase().trim();
  const level=$("#levelFilter").value, funding=$("#fundingFilter").value, country=$("#countryFilter").value, field=$("#fieldFilter").value;
  const list=scholarships.filter(s=>{
    const hay=[s.name,s.provider,s.country,s.level,s.funding,s.field].join(" ").toLowerCase();
    return (!q||hay.includes(q))&&(!level||s.level===level)&&(!funding||s.funding===funding)&&(!country||s.country===country)&&(!field||s.field===field);
  });
  render(list);
}
function renderDeadlines(){
  const list=scholarships.filter(s=>saved.includes(s.id)).sort((a,b)=>new Date(a.deadline)-new Date(b.deadline));
  $("#deadlinePanel").innerHTML=list.length?list.slice(0,5).map(s=>`<div class="deadline-item"><div><h4>${esc(s.name)}</h4><p>${esc(s.country)} · ${new Date(s.deadline).toLocaleDateString()}</p></div><div class="days">${Math.max(0,daysUntil(s.deadline))} days</div></div>`).join(""):'<div class="deadline-item"><div><h4>Your shortlist is empty</h4><p>Click ★ on a scholarship to track its deadline here.</p></div></div>';
}
function modal(title,body){$("#modalContent").innerHTML=`<h2>${title}</h2>${body}`;$("#modal").classList.remove("hidden")}
$("#modalClose").onclick=()=>$("#modal").classList.add("hidden");
$("#modal").onclick=e=>{if(e.target.id==="modal")$("#modal").classList.add("hidden")};

$("#heroSearchBtn").onclick=()=>{ $("#searchInput").value=$("#heroSearch").value; document.querySelector("#scholarships").scrollIntoView(); applyFilters(); };
$("#heroSearch").addEventListener("keydown",e=>{if(e.key==="Enter")$("#heroSearchBtn").click()});
["searchInput","levelFilter","fundingFilter","countryFilter","fieldFilter"].forEach(id=>$("#"+id).addEventListener("input",applyFilters));
$$("[data-search]").forEach(b=>b.onclick=()=>{$("#heroSearch").value=b.dataset.search;$("#heroSearchBtn").click()});
$$("[data-country]").forEach(b=>b.onclick=()=>{$("#countryFilter").value=b.dataset.country;$("#scholarships").scrollIntoView();applyFilters()});
$("#resetFilters").onclick=()=>{["searchInput","levelFilter","fundingFilter","countryFilter","fieldFilter"].forEach(id=>$("#"+id).value="");$("#heroSearch").value="";applyFilters()};
$("#sortBtn").onclick=()=>{sortSoon=!sortSoon;$("#sortBtn").textContent=sortSoon?"Sort: Deadline soonest ↕":"Sort: Name A–Z ↕";applyFilters()};
$("#savedBtn").onclick=()=>{$("#searchInput").value="";$("#levelFilter").value="";$("#fundingFilter").value="";$("#countryFilter").value="";$("#fieldFilter").value="";render(scholarships.filter(s=>saved.includes(s.id)));document.querySelector("#scholarships").scrollIntoView()};
$("#alertBtn").onclick=()=>modal("Scholarship alerts",`<p>Get new opportunity alerts in your inbox.</p><input id="modalEmail" type="email" placeholder="Email address"><button class="btn btn-primary" id="modalSubscribe">Subscribe</button>`);
$("#loginBtn").onclick=()=>{
  modal(
    "Student account",
    `<p>Log in to your account.</p>
    <input id="loginEmail" type="email" placeholder="Email address">
    <input id="loginPassword" type="password" placeholder="Password">
    <button class="btn btn-primary" id="doLogin">Login</button>
    <p id="loginMsg"></p>`
  );

  $("#doLogin").onclick=async()=>{
    const email=$("#loginEmail").value.trim();
    const password=$("#loginPassword").value;
    const msg=$("#loginMsg");

    msg.textContent="Logging in...";

    try{
      const r=await fetch("/api/auth/login",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          email,
          password
        })
      });

      const data=await r.json();

      if(!r.ok){
        throw new Error(data.error||"Login failed");
      }

      localStorage.setItem("token",data.token);
      localStorage.setItem("user",JSON.stringify(data.user));

      msg.textContent=`Welcome, ${data.user.name}!`;

      setTimeout(()=>{
        window.location.href="/admin.html";
      },800);

    }catch(e){
      msg.textContent=e.message;
    }
  };
};$("#newsletterForm").onsubmit=e=>{e.preventDefault();$("#newsletterMsg").textContent="You're on the list. Check your inbox for confirmation.";$("#emailInput").value=""};
$$("[data-guide]").forEach(b=>b.onclick=()=>{
 const data={
  application:["Build a stronger application","Start with eligibility. Then prepare the CV, academic records, recommendation letters, statement and any required proof. Follow the provider's exact instructions rather than copying a generic checklist."],
  essay:["Write a better scholarship essay","Use evidence: what happened, what you did, what you learned and what changed. Connect your experience to the scholarship's mission and your future contribution. Avoid empty claims and exaggerated language."],
  scams:["Check the provider's official domain, confirm the deadline and eligibility, and compare the announcement with the institution's official page. Be suspicious of guaranteed awards, pressure to pay unusual fees, requests for passwords or unexplained personal documents."],
  deadline:["Prepare before deadlines","Create a reverse timeline: research → eligibility → documents → recommenders → draft → review → submit. Aim to submit before the final day because portals can close early or experience technical problems."]
 };
 modal(data[b.dataset.guide][0],`<p>${data[b.dataset.guide][1]}</p>`);
});
$(".menu-toggle").onclick=()=>$("#mainNav").classList.toggle("open");
loadScholarships();
