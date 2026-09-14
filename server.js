const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "CHANGE_THIS_SECRET_BEFORE_PRODUCTION";
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

function initialData() {
  return {
    users: [],
    scholarships: [
      {id:1,name:"Stipendium Hungaricum",provider:"Government of Hungary",country:"Hungary",level:"Undergraduate",funding:"Fully funded",field:"Medicine",deadline:"2026-12-31",source_url:"https://stipendiumhungaricum.hu/",description:"Government scholarship programme with participating institutions.",status:"published",verification_status:"source_checked",created_at:new Date().toISOString(),updated_at:new Date().toISOString()},
      {id:2,name:"DAAD Study Scholarships",provider:"DAAD",country:"Germany",level:"Master's",funding:"Fully funded",field:"Engineering",deadline:"2026-11-30",source_url:"https://www.daad.de/en/",description:"Study funding opportunities administered by DAAD.",status:"published",verification_status:"source_checked",created_at:new Date().toISOString(),updated_at:new Date().toISOString()},
      {id:3,name:"Chevening Scholarships",provider:"UK Government",country:"United Kingdom",level:"Master's",funding:"Fully funded",field:"Business",deadline:"2026-11-04",source_url:"https://www.chevening.org/",description:"UK government scholarship programme.",status:"published",verification_status:"source_checked",created_at:new Date().toISOString(),updated_at:new Date().toISOString()},
      {id:4,name:"Fulbright Foreign Student Program",provider:"U.S. Department of State",country:"United States",level:"Master's",funding:"Fully funded",field:"Natural Sciences",deadline:"2026-10-15",source_url:"https://foreign.fulbrightonline.org/",description:"International graduate study and exchange funding.",status:"published",verification_status:"source_checked",created_at:new Date().toISOString(),updated_at:new Date().toISOString()},
      {id:5,name:"Australia Awards Scholarships",provider:"Australian Government",country:"Australia",level:"Master's",funding:"Fully funded",field:"Engineering",deadline:"2027-04-30",source_url:"https://www.dfat.gov.au/people-to-people/australia-awards",description:"Australian government development scholarship programme.",status:"published",verification_status:"source_checked",created_at:new Date().toISOString(),updated_at:new Date().toISOString()}
    ],
    saved_scholarships: [],
    applications: [],
    subscribers: [],
    counters: {user:0, scholarship:5, application:0, subscriber:0}
  };assistance: 0
}

function loadData() {
  fs.mkdirSync(DATA_DIR, {recursive:true});
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify(initialData(), null, 2));
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
function saveData(data) {
  fs.mkdirSync(DATA_DIR, {recursive:true});
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}
let db = loadData();
function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "";

  if (!email || !password) return;

  const existingAdmin = db.users.find(u => u.role === "admin");

  if (existingAdmin) return;

  const adminUser = {
    id: ++db.counters.user,
    name: "Administrator",
    email,
    password_hash: bcrypt.hashSync(password, 12),
    role: "admin",
    created_at: new Date().toISOString()
  };

  db.users.push(adminUser);
  saveData(db);
}

ensureAdmin();
function auth(req,res,next){
  const token=(req.headers.authorization||"").replace("Bearer ","");
  if(!token) return res.status(401).json({error:"Authentication required"});
  try { req.user=jwt.verify(token,JWT_SECRET); next(); }
  catch { return res.status(401).json({error:"Invalid or expired token"}); }
}
function admin(req,res,next){
  if(req.user?.role!=="admin") return res.status(403).json({error:"Admin access required"});
  next();
}

app.get("/api/health",(req,res)=>res.json({ok:true,service:"Scholarship Opportunity API"}));

app.get("/api/scholarships",(req,res)=>{
  const {q="",level="",funding="",country="",field="",status="published"}=req.query;
  const query=q.toLowerCase();
  const rows=db.scholarships.filter(s=>{
    if(s.status!==status) return false;
    if(level && s.level!==level) return false;
    if(funding && s.funding!==funding) return false;
    if(country && s.country!==country) return false;
    if(field && s.field!==field) return false;
    if(query && ![s.name,s.provider,s.country,s.field,s.description].join(" ").toLowerCase().includes(query)) return false;
    return true;
  }).sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline)));
  res.json(rows);
});

app.get("/api/scholarships/:id",(req,res)=>{
  const row=db.scholarships.find(s=>s.id===Number(req.params.id));
  row ? res.json(row) : res.status(404).json({error:"Scholarship not found"});
});

app.post("/api/auth/register",(req,res)=>{
  const {name,email,password}=req.body||{};
  const normalized=(email||"").trim().toLowerCase();
  if(!name||!normalized||!password||password.length<8) return res.status(400).json({error:"Name, email and password of at least 8 characters are required"});
  if(db.users.some(u=>u.email===normalized)) return res.status(409).json({error:"Email is already registered"});
  const user={id:++db.counters.user,name:String(name).trim(),email:normalized,password_hash:bcrypt.hashSync(password,12),role:"student",created_at:new Date().toISOString()};
  db.users.push(user); saveData(db);
  const safe={id:user.id,name:user.name,email:user.email,role:user.role};
  res.status(201).json({user:safe,token:jwt.sign(safe,JWT_SECRET,{expiresIn:"7d"})});
});

app.post("/api/auth/login",(req,res)=>{
  const email=(req.body?.email||"").trim().toLowerCase();
  const u=db.users.find(x=>x.email===email);
  if(!u||!bcrypt.compareSync(req.body?.password||"",u.password_hash)) return res.status(401).json({error:"Invalid email or password"});
  const user={id:u.id,name:u.name,email:u.email,role:u.role};
  res.json({user,token:jwt.sign(user,JWT_SECRET,{expiresIn:"7d"})});
});
app.get("/api/me",auth,(req,res)=>res.json(req.user));

app.get("/api/saved",auth,(req,res)=>{
  const ids=new Set(db.saved_scholarships.filter(x=>x.user_id===req.user.id).map(x=>x.scholarship_id));
  res.json(db.scholarships.filter(s=>ids.has(s.id)).sort((a,b)=>String(a.deadline).localeCompare(String(b.deadline))));
});
app.post("/api/saved/:id",auth,(req,res)=>{
  const scholarshipId=Number(req.params.id);
  if(!db.scholarships.some(s=>s.id===scholarshipId)) return res.status(404).json({error:"Scholarship not found"});
  const i=db.saved_scholarships.findIndex(x=>x.user_id===req.user.id&&x.scholarship_id===scholarshipId);
  if(i>=0) db.saved_scholarships.splice(i,1); else db.saved_scholarships.push({user_id:req.user.id,scholarship_id:scholarshipId,created_at:new Date().toISOString()});
  saveData(db); res.json({saved:i<0});
});

app.get("/api/applications",auth,(req,res)=>{
  const rows=db.applications.filter(a=>a.user_id===req.user.id).map(a=>{const s=db.scholarships.find(x=>x.id===a.scholarship_id)||{};return {...a,name:s.name,deadline:s.deadline};}).sort((a,b)=>String(b.updated_at).localeCompare(String(a.updated_at)));
  res.json(rows);
});
app.post("/api/applications",auth,(req,res)=>{
  const scholarship_id=Number(req.body?.scholarship_id);
  if(!db.scholarships.some(s=>s.id===scholarship_id)) return res.status(404).json({error:"Scholarship not found"});
  const row={id:++db.counters.application,user_id:req.user.id,scholarship_id,status:req.body?.status||"researching",notes:req.body?.notes||"",updated_at:new Date().toISOString()};
  db.applications.push(row); saveData(db); res.status(201).json({ok:true,id:row.id});
});

app.post("/api/subscribe",(req,res)=>{
  const email=(req.body?.email||"").trim().toLowerCase();
  if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({error:"Valid email required"});
  if(!db.subscribers.some(x=>x.email===email)) db.subscribers.push({id:++db.counters.subscriber,email,created_at:new Date().toISOString()});
  saveData(db); res.json({ok:true,message:"Subscribed"});
});assistance_requests: [],
app.post("/api/assistance",auth,(req,res)=>{
  const {service,scholarship_id,message}=req.body||{};

  const allowed=[
    "Application guidance",
    "Scholarship selection guidance",
    "CV review",
    "Motivation / personal statement review",
    "Application-form guidance",
    "Document checklist",
    "Final application review"
  ];

  if(!allowed.includes(service)){
    return res.status(400).json({error:"Invalid assistance service"});
  }

  const row={
    id:++db.counters.assistance,
    user_id:req.user.id,
    service,
    scholarship_id:scholarship_id||null,
    message:message||"",
    status:"requested",
    created_at:new Date().toISOString()
  };

  db.assistance_requests.push(row);
  saveData(db);

  res.status(201).json(row);
});app.get("/api/assistance",auth,(req,res)=>{
  const requests=db.assistance_requests
    .filter(x=>x.user_id===req.user.id)
    .map(x=>{
      const scholarship=db.scholarships.find(s=>s.id===x.scholarship_id);

      return {
        ...x,
        scholarship_name:scholarship?.name||null,
        scholarship_deadline:scholarship?.deadline||null
      };
    })
    .sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));

  res.json(requests);
});
app.get("/api/scholarships",(req,res)=>{
  const published=db.scholarships
    .filter(s=>s.status==="published")
    .sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));

  res.json(published);
});app.get("/api/admin/scholarships",auth,admin,(req,res)=>res.json([...db.scholarships].sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)))));
app.post("/api/admin/scholarships",auth,admin,(req,res)=>{
  const s=req.body||{}; const now=new Date().toISOString();
  const row={id:++db.counters.scholarship,name:s.name,provider:s.provider,country:s.country,level:s.level,funding:s.funding,field:s.field,deadline:s.deadline,source_url:s.source_url,description:s.description||"",status:s.status||"draft",verification_status:s.verification_status||"pending",created_at:now,updated_at:now};
  db.scholarships.push(row); saveData(db); res.status(201).json({id:row.id});
});
app.put("/api/admin/scholarships/:id",auth,admin,(req,res)=>{
  const i=db.scholarships.findIndex(s=>s.id===Number(req.params.id)); if(i<0) return res.status(404).json({error:"Scholarship not found"});
  const s=req.body||{}; db.scholarships[i]={...db.scholarships[i],...s,id:db.scholarships[i].id,updated_at:new Date().toISOString()}; saveData(db); res.json({ok:true});
});
app.delete("/api/admin/scholarships/:id",auth,admin,(req,res)=>{
  const id=Number(req.params.id); db.scholarships=db.scholarships.filter(s=>s.id!==id); db.saved_scholarships=db.saved_scholarships.filter(x=>x.scholarship_id!==id); saveData(db); res.json({ok:true});
});

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"index.html")));
app.listen(PORT,()=>console.log(`Scholarship Opportunity running at http://localhost:${PORT}`));
