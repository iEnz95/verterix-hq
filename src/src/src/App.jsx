import { useEffect, useRef, useState } from "react";

/* ─── DATI AGENTI ─── */
const AGENTS = {
  ceo:       { nome:"Luca",        titolo:"CEO & Stratega",          emoji:"👔", mansioni:"Decisioni strategiche, gestione team, obiettivi aziendali, approvazione budget", color:0xc9a84c, hex:"#c9a84c", zone:"ceo"       },
  vale:      { nome:"Vale",        titolo:"Assistente Privata H24",  emoji:"⭐", mansioni:"Agenda personale, email e WhatsApp a nome del capo, filtro comunicazioni, priorità", color:0xfbbf24, hex:"#fbbf24", zone:"segreterie" },
  alba:      { nome:"Alba",        titolo:"Filtro Aziendale",        emoji:"🌅", mansioni:"Riceve comunicazioni aziendali, le filtra e prepara briefing strutturati per Vale", color:0x38bdf8, hex:"#38bdf8", zone:"segreterie" },
  marketing: { nome:"Giulia",      titolo:"Direttrice Marketing",    emoji:"📣", mansioni:"Strategie marketing, campagne pubblicitarie, analisi mercato, brand positioning", color:0xf43f5e, hex:"#f43f5e", zone:"openspace"  },
  social:    { nome:"Marco",       titolo:"Social Media Manager",    emoji:"📱", mansioni:"Instagram, TikTok, LinkedIn, piano editoriale, contenuti virali, crescita organica", color:0xa78bfa, hex:"#a78bfa", zone:"openspace"  },
  venditore: { nome:"Davide",      titolo:"Sales Manager",           emoji:"🤝", mansioni:"Funnel vendita, script commerciali, gestione obiezioni, upsell, pipeline clienti", color:0xfb923c, hex:"#fb923c", zone:"openspace"  },
  finanza:   { nome:"Roberto",     titolo:"CFO & Finanza",           emoji:"💰", mansioni:"Budget, cashflow, proiezioni P&L, KPI finanziari, ottimizzazione costi", color:0x34d399, hex:"#34d399", zone:"openspace"  },
  creativo:  { nome:"Marta",       titolo:"Direttrice Creativa",     emoji:"🎨", mansioni:"Naming prodotti, copywriting, visual identity, slogan, concept campagne creative", color:0xf472b6, hex:"#f472b6", zone:"openspace"  },
  tech:      { nome:"Alessandro",  titolo:"CTO & Tech Lead",         emoji:"💻", mansioni:"Stack tecnologico, automazioni Make.com, API, integrazioni, sicurezza, deployment", color:0x22d3ee, hex:"#22d3ee", zone:"openspace"  },
  psicologo: { nome:"Dr.Ferretti", titolo:"Psicologo & Coach",       emoji:"🧠", mansioni:"Sblocco idee, gestione stress, mindset imprenditoriale, brainstorming, motivazione", color:0xc084fc, hex:"#c084fc", zone:"openspace"  },
};

const PROMPTS = {
  ceo:`Sei Luca, CEO di Verterix. Decidi strategia, gestisci il team. Verterix vende prodotti digitali: template AI (9-49€), corsi (47-97€), SaaS (9-19€/mese). Budget ads 89€/mese. Autonomo su: nicchie, prodotti, ads. Chiedi approvazione per: budget extra, accordi legali. Rispondi in italiano.`,
  vale:`Sei Vale, assistente personale privata H24. Gestisci agenda, scrivi email/WhatsApp a nome del capo, filtri info da Alba. Capo ha due aziende: Verterix (prodotti digitali) e CrazyPack (mystery box). Rispondi in italiano, breve e diretto.`,
  alba:`Sei Alba, filtro aziendale. Analizzi comunicazioni e prepari briefing per Vale. Formato: 📨 BRIEFING — Priorità🔴🟡🟢 / Dettaglio / Azione. Rispondi in italiano.`,
  marketing:`Sei Giulia, Direttrice Marketing di Verterix. Strategia: organico TikTok/Instagram + Meta Ads 89€/mese. Prodotti: template AI, corsi, SaaS. Rispondi in italiano.`,
  social:`Sei Marco, Social Media di Verterix. Gestisci Instagram, TikTok, LinkedIn per creator e imprenditori italiani. Rispondi in italiano.`,
  venditore:`Sei Davide, Sales di Verterix. Funnel: template→corso→SaaS. Script, obiezioni, follow-up, upsell. Rispondi in italiano.`,
  finanza:`Sei Roberto, CFO di Verterix. Budget: Shopify 27€+Make 9€+dominio 1€+ads 63€=100€/mese. Cashflow, ROI, KPI. Rispondi in italiano.`,
  creativo:`Sei Marta, Creativa di Verterix (il nome viene da "vertere"=trasformare). Naming, copy, visual identity. Rispondi in italiano.`,
  tech:`Sei Alessandro, CTO di Verterix. Stack: Shopify+Stripe+Make.com+Vercel. Automazioni e API. Rispondi in italiano.`,
  psicologo:`Sei Dr. Ferretti, psicologo e coach. Aiuti con blocchi mentali, stress, brainstorming. Empatico e diretto. Rispondi in italiano.`,
};

const INITIAL_LOGS = [
  {time:"09:00",agent:"Luca",       msg:"Nicchia selezionata: AI tools per PMI italiane",s:"🎯"},
  {time:"09:08",agent:"Giulia",     msg:"Analisi competitor completata",                 s:"✅"},
  {time:"09:15",agent:"Alessandro", msg:"Shopify — attesa verifica payments",            s:"⏳"},
  {time:"09:22",agent:"Marta",      msg:"Palette Verterix: oro/nero/bianco",             s:"🎨"},
  {time:"09:30",agent:"Roberto",    msg:"Break-even: 8 vendite/mese",                   s:"📊"},
  {time:"09:45",agent:"Vale",       msg:"Sistema operativo — H24 attiva",               s:"⭐"},
];

const TASKS = [
  {agent:"ceo",      desc:"Definizione prodotto lancio",       status:"working"},
  {agent:"tech",     desc:"Make.com → Shopify connection",     status:"waiting"},
  {agent:"marketing",desc:"Piano Meta Ads mese 1",             status:"working"},
  {agent:"creativo", desc:"Brand kit + logo Verterix",         status:"working"},
  {agent:"venditore",desc:"Funnel 3 livelli mappato",          status:"done"  },
  {agent:"finanza",  desc:"Proiezioni cashflow trim. 1",       status:"done"  },
  {agent:"social",   desc:"Setup account social Verterix",     status:"waiting"},
];

/* ─── THREE.JS INLINE (r128 via importmap trick) ─── */
/* Usiamo una canvas 2D avanzata per simulare il 3D — prospettiva isometrica */

function useAnimFrame(cb){
  const ref = useRef();
  useEffect(()=>{
    let id;
    const loop = (t)=>{ cb(t); id=requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(id);
  },[cb]);
}

/* ─── ISOMETRIC 3D RENDERER ─── */
const ISO = {
  // Converte coordinate 3D world in 2D schermo isometrico
  toScreen(x,y,z,cx,cy,scale=28){
    const sx = (x - z) * scale * 0.866 + cx;
    const sy = (x + z) * scale * 0.5 - y * scale + cy;
    return {sx,sy};
  },
  // Disegna parallelepipedo isometrico
  box(ctx, x,y,z, w,h,d, topC,leftC,rightC, cx,cy,scale=28){
    const pts = (dx,dy,dz)=>ISO.toScreen(x+dx,y+dy,z+dz,cx,cy,scale);
    // Top face
    const tl=pts(0,h,0), tr=pts(w,h,0), br=pts(w,h,d), bl=pts(0,h,d);
    ctx.beginPath(); ctx.moveTo(tl.sx,tl.sy); ctx.lineTo(tr.sx,tr.sy); ctx.lineTo(br.sx,br.sy); ctx.lineTo(bl.sx,bl.sy); ctx.closePath();
    ctx.fillStyle=topC; ctx.fill(); ctx.strokeStyle="#00000022"; ctx.lineWidth=0.5; ctx.stroke();
    // Left face
    const ll=pts(0,0,0), lr=pts(0,0,d);
    ctx.beginPath(); ctx.moveTo(tl.sx,tl.sy); ctx.lineTo(bl.sx,bl.sy); ctx.lineTo(lr.sx,lr.sy); ctx.lineTo(ll.sx,ll.sy); ctx.closePath();
    ctx.fillStyle=leftC; ctx.fill(); ctx.stroke();
    // Right face
    const rl=pts(w,0,0), rr=pts(w,0,d);
    ctx.beginPath(); ctx.moveTo(tr.sx,tr.sy); ctx.lineTo(br.sx,br.sy); ctx.lineTo(rr.sx,rr.sy); ctx.lineTo(rl.sx,rl.sy); ctx.closePath();
    ctx.fillStyle=rightC; ctx.fill(); ctx.stroke();
  }
};

/* colori con luminosità variabile */
const shade=(hex,f)=>{
  const n=parseInt(hex.slice(1),16);
  const r=Math.min(255,Math.floor(((n>>16)&0xff)*f));
  const g=Math.min(255,Math.floor(((n>>8)&0xff)*f));
  const b=Math.min(255,Math.floor((n&0xff)*f));
  return `rgb(${r},${g},${b})`;
};

export default function VerterixHQ(){
  const canvasRef   = useRef(null);
  const [size, setSize]     = useState({w:800,h:600});
  const [hovered, setHovered] = useState(null);
  const [activeAgent, setActiveAgent] = useState(null);
  const [conversations, setConversations] = useState(Object.fromEntries(Object.keys(AGENTS).map(k=>[k,[]])));
  const [input,setInput]    = useState("");
  const [loading,setLoading]= useState(false);
  const [logs,setLogs]      = useState(INITIAL_LOGS);
  const [tab,setTab]        = useState("log");
  const [panelOpen,setPanelOpen] = useState(true);
  const [tooltip,setTooltip]= useState({x:0,y:0});
  const [tick,setTick]      = useState(0);
  const msgRef = useRef(null);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // resize
  useEffect(()=>{
    const obs = new ResizeObserver(()=>{
      if(containerRef.current){
        setSize({w:containerRef.current.clientWidth,h:containerRef.current.clientHeight});
      }
    });
    if(containerRef.current) obs.observe(containerRef.current);
    return ()=>obs.disconnect();
  },[]);

  // tick animation
  useEffect(()=>{ const id=setInterval(()=>setTick(t=>t+1),50); return()=>clearInterval(id); },[]);

  // auto logs
  useEffect(()=>{
    const extra=[
      {agent:"Marco",  msg:"Piano editoriale TikTok pronto",     s:"📱"},
      {agent:"Luca",   msg:"Decisione: nicchia AI tools PMI",     s:"🎯"},
      {agent:"Giulia", msg:"Campagna email warmup avviata",       s:"📧"},
      {agent:"Alessandro",msg:"Vercel deployment ok",            s:"✅"},
      {agent:"Davide", msg:"Script vendita L1 completato",        s:"🤝"},
    ];
    let i=0;
    const id=setInterval(()=>{
      if(i<extra.length){
        const l=extra[i++];
        const now=new Date();
        const time=now.getHours().toString().padStart(2,"0")+":"+now.getMinutes().toString().padStart(2,"0");
        setLogs(p=>[{time,...l},...p].slice(0,30));
      }
    },7000);
    return()=>clearInterval(id);
  },[]);

  useEffect(()=>{ if(msgRef.current) msgRef.current.scrollTop=9999; },[conversations,activeAgent]);

  /* ─── LAYOUT SCRIVANIE ─── 
     Coordinate world: x=destra, z=avanti, y=alto
     CEO office: fondo, separato
     Segreterie: stanza laterale sinistra
     Open space: centro/destra
  */
  const DESKS = [
    // CEO — ufficio privato fondo centro
    {key:"ceo",        wx:0,   wz:0,   room:"ceo"},
    // SEGRETERIE — stanza sinistra separata
    {key:"vale",       wx:-7,  wz:4,   room:"seg"},
    {key:"alba",       wx:-7,  wz:7,   room:"seg"},
    // OPEN SPACE — centro/destra
    {key:"marketing",  wx:2,   wz:4,   room:"open"},
    {key:"social",     wx:5,   wz:4,   room:"open"},
    {key:"venditore",  wx:8,   wz:4,   room:"open"},
    {key:"finanza",    wx:2,   wz:7,   room:"open"},
    {key:"creativo",   wx:5,   wz:7,   room:"open"},
    {key:"tech",       wx:8,   wz:7,   room:"open"},
    {key:"psicologo",  wx:5,   wz:10,  room:"open"},
  ];

  /* ─── HIT TEST ─── */
  const deskHits = useRef([]);

  /* ─── RENDER 3D ─── */
  useEffect(()=>{
    const canvas = canvasRef.current;
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    const {w,h} = size;
    canvas.width = w;
    canvas.height = h;

    const CX = w * 0.52;
    const CY = h * 0.18;
    const S  = Math.min(w,h) / 26;
    const p  = (x,y,z)=>ISO.toScreen(x,y,z,CX,CY,S);
    const box = (x,y,z,bw,bh,bd,t,l,r)=>ISO.box(ctx,x,y,z,bw,bh,bd,t,l,r,CX,CY,S);
    const pulse = Math.sin(tick*0.2)*0.08;

    ctx.clearRect(0,0,w,h);

    // Sky gradient
    const sky = ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,"#07090f"); sky.addColorStop(1,"#0a0e18");
    ctx.fillStyle=sky; ctx.fillRect(0,0,w,h);

    // ── PAVIMENTO PRINCIPALE ──
    box(−9,0,0, 20,0.15,13, "#0e1520","#0b1018","#0d1220");
    // ── PAVIMENTO CEO ──
    box(−2,0,−2, 6,0.18,4, "#12191f","#0f1520","#111820");
    // ── PAVIMENTO SEGRETERIE ──
    box(−10,0,3, 4,0.16,6, "#0f1418","#0c1115","#0e1317");

    // ── PARETI CEO OFFICE ──
    // parete fondo
    box(−2,0,−2, 6,3.5,0.15, "#1a2030","#141825","#171d2a");
    // parete destra CEO
    box(3.8,0,−2, 0.15,3.5,4, "#1a2030","#141825","#171d2a");
    // parete sinistra CEO (vetrata — più chiara)
    box(−2,0,−2, 0.15,3.5,2.5, "#c9a84c18","#c9a84c0e","#c9a84c14");
    // separatore vetrato CEO (davanti)
    box(−2,0,1.8, 6.2,2.5,0.1, "#c9a84c11","#c9a84c08","#c9a84c0d");
    // insegna CEO
    box(0,3.2,−1.9, 3,0.4,0.08, "#c9a84c","#a07830","#b08840");

    // ── PARETI SEGRETERIE ──
    box(−10,0,3, 0.15,2.8,6, "#1a1f28","#141820","#171c25");
    box(−10,0,8.9, 4.2,2.8,0.15, "#1a1f28","#141820","#171c25");
    box(−6.1,0,3, 0.15,2.8,3, "#38bdf818","#38bdf810","#38bdf814");
    box(−6.1,0,6, 0.15,2.8,3, "#fbbf2418","#fbbf2410","#fbbf2414");
    // insegna seg
    box(−9,2.3,3.2, 2.5,0.35,0.08, "#38bdf8","#0e7490","#1890aa");

    // ── PARETI OPEN SPACE ──
    box(0.5,0,3, 0.1,2.5,8, "#1a2030","#141825","#171d2a");
    box(−1,0,13, 12,2.5,0.1, "#1a2030","#141825","#171d2a");
    box(10.5,0,3, 0.1,2.5,10, "#1a2030","#141825","#171d2a");

    // ── LUCI SOFFITTO CEO ──
    ctx.save();
    const ceoCenter = p(1,3.8,0.5);
    const glowCeo = ctx.createRadialGradient(ceoCenter.sx,ceoCenter.sy,0,ceoCenter.sx,ceoCenter.sy,S*3);
    glowCeo.addColorStop(0,"rgba(201,168,76,0.12)"); glowCeo.addColorStop(1,"transparent");
    ctx.fillStyle=glowCeo; ctx.fillRect(0,0,w,h); ctx.restore();

    // ── LUCI SOFFITTO OPEN SPACE ──
    [[5.5,6],[5.5,9]].forEach(([lx,lz])=>{
      ctx.save();
      const lp = p(lx,3.5,lz);
      const gl = ctx.createRadialGradient(lp.sx,lp.sy,0,lp.sx,lp.sy,S*4);
      gl.addColorStop(0,"rgba(100,140,220,0.08)"); gl.addColorStop(1,"transparent");
      ctx.fillStyle=gl; ctx.fillRect(0,0,w,h); ctx.restore();
    });

    // ── RENDERING SCRIVANIE + PERSONAGGI ──
    const hits = [];

    // Ordina per depth (z poi x) per painter's algorithm
    const sorted = [...DESKS].sort((a,b)=>(b.wz-a.wz)||(b.wx-a.wx));

    sorted.forEach(({key,wx,wz})=>{
      const ag = AGENTS[key];
      const isHov = hovered===key;
      const isSel = activeAgent===key;
      const col = "#"+ag.color.toString(16).padStart(6,"0");
      const p2 = tick*0.12;
      const bob = isHov ? Math.sin(p2)*0.08 : 0;
      const wy = 0 + bob;

      // SCRIVANIA
      const deskTop   = isHov ? shade(col,0.18) : "#1a2332";
      const deskLeft  = isHov ? shade(col,0.12) : "#141b24";
      const deskRight = isHov ? shade(col,0.15) : "#17202e";
      box(wx,wy,wz, 2.2,0.12,1.2, deskTop,deskLeft,deskRight);

      // GAMBE
      [[wx+0.15,wz+0.15],[wx+1.9,wz+0.15],[wx+0.15,wz+0.9],[wx+1.9,wz+0.9]].forEach(([lx,lz])=>{
        box(lx,0,lz, 0.1,wy+0.12,0.1, "#0f141c","#0c1018","#0e1220");
      });

      // MONITOR BASE
      box(wx+0.6,wy+0.12,wz+0.3, 1,0.06,0.08, "#0d1117","#0a0d12","#0b0f15");
      // MONITOR SCHERMO
      const monGlow = isSel||isHov ? col : shade(col,0.4);
      box(wx+0.5,wy+0.12+0.06,wz+0.32, 1.2,0.75,0.06, monGlow,shade(col,0.3),shade(col,0.25));

      // EMOJI sul monitor
      const mp = p(wx+1.1,wy+0.12+0.45,wz+0.29);
      ctx.font=`${S*0.55}px serif`;
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      ctx.globalAlpha = 0.85+Math.sin(p2+wx)*0.15;
      ctx.fillText(ag.emoji, mp.sx, mp.sy);
      ctx.globalAlpha=1;

      // SEDIA
      box(wx+0.4,wy,wz-0.7, 1.4,0.45,1, "#111820","#0d1318","#0f1620");
      box(wx+0.4,wy+0.45,wz-0.7, 1.4,0.65,0.1, "#111820","#0d1318","#0f1620");

      // AVATAR (sferetta sopra sedia)
      const avp = p(wx+1.1,wy+0.45+0.4,wz-0.3);
      const avR = S*0.28;
      ctx.beginPath();
      ctx.arc(avp.sx,avp.sy,avR,0,Math.PI*2);
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.85+pulse;
      ctx.fill();
      ctx.globalAlpha=1;
      // glow avatar
      if(isHov||isSel){
        ctx.save();
        const gr = ctx.createRadialGradient(avp.sx,avp.sy,0,avp.sx,avp.sy,avR*2.5);
        gr.addColorStop(0,col+"66"); gr.addColorStop(1,"transparent");
        ctx.fillStyle=gr; ctx.beginPath(); ctx.arc(avp.sx,avp.sy,avR*2.5,0,Math.PI*2); ctx.fill();
        ctx.restore();
      }

      // TARGHETTA NOME (sopra monitor)
      const np = p(wx+1.1,wy+0.12+1.0,wz+0.29);
      const label = ag.emoji+" "+ag.nome;
      ctx.font=`bold ${Math.max(9,S*0.38)}px -apple-system,sans-serif`;
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      const tw = ctx.measureText(label).width;
      const pad=5, bh2=14;
      ctx.fillStyle=col+"33"; ctx.strokeStyle=col+"88"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.roundRect(np.sx-tw/2-pad,np.sy-bh2/2,tw+pad*2,bh2,6); ctx.fill(); ctx.stroke();
      ctx.fillStyle=col;
      ctx.fillText(label,np.sx,np.sy);

      // HIT BOX (per click/hover)
      const topLeft = p(wx,wy+0.12+1.1,wz+0.3);
      const botRight = p(wx+2.2,wy,wz+1.2);
      hits.push({key, x1:Math.min(topLeft.sx,botRight.sx)-10, y1:Math.min(topLeft.sy,botRight.sy)-10, x2:Math.max(topLeft.sx,botRight.sx)+10, y2:Math.max(topLeft.sy,botRight.sy)+30});
    });

    deskHits.current = hits;

    // ── LABEL ZONE ──
    [
      {label:"👔 CEO Office",       wx:1,   wz:-1.5, col:"#c9a84c"},
      {label:"📋 Segreterie",       wx:-8.5,wz:5.5,  col:"#38bdf8"},
      {label:"🏢 Open Space Team",  wx:5.5, wz:3.2,  col:"#818cf8"},
    ].forEach(({label,wx,wz,col})=>{
      const lp=p(wx,3.8,wz);
      ctx.font=`bold ${Math.max(10,S*0.42)}px -apple-system,sans-serif`;
      ctx.textAlign="center";
      ctx.textBaseline="middle";
      ctx.fillStyle=col;
      ctx.globalAlpha=0.7;
      ctx.fillText(label,lp.sx,lp.sy);
      ctx.globalAlpha=1;
    });

    // ── TAVOLO RIUNIONI open space ──
    box(3.5,0.12,8.2, 3.5,0.1,2.2, "#111d2a","#0d1520","#0f1825");
    const tp=p(5.25,0.25,9.3);
    ctx.font=`${S*0.35}px serif`; ctx.textAlign="center"; ctx.fillStyle="#c9a84c44"; ctx.fillText("🏢",tp.sx,tp.sy);

  },[tick,size,hovered,activeAgent]);

  /* ─── MOUSE HANDLERS ─── */
  const handleMouseMove = e=>{
    const rect = canvasRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    let found=null;
    for(const h of deskHits.current){
      if(mx>=h.x1&&mx<=h.x2&&my>=h.y1&&my<=h.y2){ found=h.key; break; }
    }
    setHovered(found);
    setTooltip({x:e.clientX,y:e.clientY});
    canvasRef.current.style.cursor=found?"pointer":"default";
  };
  const handleClick=e=>{
    const rect=canvasRef.current.getBoundingClientRect();
    const mx=e.clientX-rect.left,my=e.clientY-rect.top;
    for(const h of deskHits.current){
      if(mx>=h.x1&&mx<=h.x2&&my>=h.y1&&my<=h.y2){
        setActiveAgent(h.key);
        setTimeout(()=>inputRef.current?.focus(),100);
        return;
      }
    }
  };

  /* ─── CHAT ─── */
  const sendMsg=async()=>{
    if(!activeAgent||loading||!input.trim()) return;
    const text=input.trim(); setInput(""); setLoading(true);
    const newConv=[...(conversations[activeAgent]||[]),{role:"user",content:text}];
    setConversations(p=>({...p,[activeAgent]:newConv}));
    const now=new Date();
    const time=now.getHours().toString().padStart(2,"0")+":"+now.getMinutes().toString().padStart(2,"0");
    setLogs(p=>[{time,agent:AGENTS[activeAgent].nome,msg:`"${text.substring(0,35)}..."`,s:"💬"},...p].slice(0,30));
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:PROMPTS[activeAgent],messages:newConv})
      });
      const data=await res.json();
      const reply=data.content?.map(b=>b.text||"").join("")||"Errore.";
      setConversations(p=>({...p,[activeAgent]:[...newConv,{role:"assistant",content:reply}]}));
      setLogs(p=>[{time,agent:AGENTS[activeAgent].nome,msg:"Risposta inviata",s:"✅"},...p].slice(0,30));
    }catch{
      setConversations(p=>({...p,[activeAgent]:[...newConv,{role:"assistant",content:"⚠️ Carica su Vercel con API key per usare la chat."}]}));
    }
    setLoading(false);
  };

  const pulse=Math.sin(tick*0.2)*0.5+0.5;
  const ag=activeAgent?AGENTS[activeAgent]:null;

  return(
    <div style={{display:"flex",height:"100vh",fontFamily:"-apple-system,'SF Pro Display',sans-serif",background:"#07090f",color:"#e8eaf0",overflow:"hidden"}}>

      {/* ── SIDEBAR ── */}
      <div style={{width:210,background:"#0a0d14",borderRight:"1px solid #ffffff09",display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
        <div style={{padding:"14px 14px 10px",borderBottom:"1px solid #ffffff09"}}>
          <div style={{fontSize:14,fontWeight:800,color:"#c9a84c",letterSpacing:"-0.5px"}}>VERTERIX HQ</div>
          <div style={{fontSize:9,color:"#2a3449",marginTop:1,textTransform:"uppercase",letterSpacing:1}}>Ufficio Virtuale AI</div>
        </div>

        {/* Team con mansioni */}
        {[
          {label:"👔 CEO Office", keys:["ceo"]},
          {label:"📋 Segreterie", keys:["vale","alba"]},
          {label:"🏢 Open Space", keys:["marketing","social","venditore","finanza","creativo","tech","psicologo"]},
        ].map(group=>(
          <div key={group.label}>
            <div style={{fontSize:9,color:"#2a3449",fontWeight:700,textTransform:"uppercase",letterSpacing:1.2,padding:"10px 12px 4px"}}>{group.label}</div>
            {group.keys.map(k=>{
              const a=AGENTS[k];
              const isSel=activeAgent===k;
              const convN=Math.floor((conversations[k]||[]).length/2);
              return(
                <div key={k} onClick={()=>{setActiveAgent(k);setTimeout(()=>inputRef.current?.focus(),100);}}
                  style={{padding:"8px 12px",cursor:"pointer",background:isSel?"#111c2a":"transparent",borderLeft:isSel?`2px solid ${a.hex}`:"2px solid transparent",transition:"all 0.15s"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                    <span style={{fontSize:13}}>{a.emoji}</span>
                    <span style={{fontSize:12,fontWeight:600,color:isSel?a.hex:"#94a3b8",flex:1}}>{a.nome}</span>
                    {k==="vale"&&<div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",flexShrink:0}}/>}
                    {convN>0&&<span style={{fontSize:9,background:a.hex+"22",color:a.hex,padding:"1px 4px",borderRadius:6,fontWeight:700}}>{convN}</span>}
                  </div>
                  <div style={{fontSize:10,color:"#3a4a5a",lineHeight:1.4,paddingLeft:20}}>{a.mansioni}</div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Stats */}
        <div style={{marginTop:"auto",padding:"10px 12px",borderTop:"1px solid #ffffff09"}}>
          {[["Agenti attivi","10"],["Budget ads","€89/mese"],["Shopify","In verifica"],["Fase","1 di 5"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}>
              <span style={{fontSize:9,color:"#2a3449"}}>{l}</span>
              <span style={{fontSize:9,fontWeight:700,color:"#c9a84c"}}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Topbar */}
        <div style={{height:46,background:"#0a0d14",borderBottom:"1px solid #ffffff09",display:"flex",alignItems:"center",padding:"0 16px",gap:10,flexShrink:0}}>
          <div style={{fontSize:13,fontWeight:700,flex:1}}>🏢 Verterix HQ — Vista 3D</div>
          <div style={{display:"flex",alignItems:"center",gap:5,fontSize:10,color:"#22c55e"}}>
            <div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e",opacity:0.5+pulse*0.5}}/>Team operativo
          </div>
          {["vale","ceo"].map(k=>(
            <button key={k} onClick={()=>{setActiveAgent(k);setTimeout(()=>inputRef.current?.focus(),100);}}
              style={{background:AGENTS[k].hex+"18",border:`1px solid ${AGENTS[k].hex}44`,borderRadius:7,padding:"4px 10px",color:AGENTS[k].hex,fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
              {AGENTS[k].emoji} {AGENTS[k].nome}
            </button>
          ))}
        </div>

        {/* Canvas 3D */}
        <div ref={containerRef} style={{flex:1,position:"relative",overflow:"hidden"}}>
          <canvas ref={canvasRef} onMouseMove={handleMouseMove} onClick={handleClick} onMouseLeave={()=>setHovered(null)}
            style={{display:"block",width:"100%",height:"100%"}}/>

          {/* Tooltip hover */}
          {hovered&&!activeAgent&&(
            <div style={{position:"fixed",left:tooltip.x+14,top:tooltip.y-8,background:"#0d1420",border:`1px solid ${AGENTS[hovered].hex}66`,borderRadius:10,padding:"10px 14px",pointerEvents:"none",zIndex:50,minWidth:180,boxShadow:`0 8px 24px #00000090`}}>
              <div style={{fontSize:13,fontWeight:700,color:AGENTS[hovered].hex}}>{AGENTS[hovered].emoji} {AGENTS[hovered].nome}</div>
              <div style={{fontSize:11,color:"#64748b",marginTop:1}}>{AGENTS[hovered].titolo}</div>
              <div style={{fontSize:10,color:"#4a5568",marginTop:6,lineHeight:1.5}}>{AGENTS[hovered].mansioni}</div>
              <div style={{fontSize:10,color:"#22c55e",marginTop:6}}>● Clicca per interagire</div>
            </div>
          )}

          <div style={{position:"absolute",bottom:8,left:"50%",transform:"translateX(-50%)",fontSize:9,color:"#2a3449",letterSpacing:1,textTransform:"uppercase",pointerEvents:"none"}}>
            Clicca su una scrivania per interagire con l'agente
          </div>
        </div>

        {/* Bottom panel */}
        <div style={{height:panelOpen?170:34,background:"#0a0d14",borderTop:"1px solid #ffffff09",display:"flex",flexDirection:"column",flexShrink:0,transition:"height 0.25s"}}>
          <div style={{display:"flex",borderBottom:panelOpen?"1px solid #ffffff09":"none",flexShrink:0}}>
            {[["log","📋 Log"],["kpi","📊 KPI"],["tasks","⚡ Task"]].map(([id,label])=>(
              <div key={id} onClick={()=>{setTab(id);setPanelOpen(true);}} style={{padding:"7px 12px",fontSize:10,color:tab===id&&panelOpen?"#c9a84c":"#2a3449",cursor:"pointer",borderBottom:tab===id&&panelOpen?"2px solid #c9a84c":"2px solid transparent"}}>
                {label}
              </div>
            ))}
            <button onClick={()=>setPanelOpen(o=>!o)} style={{marginLeft:"auto",background:"none",border:"none",color:"#2a3449",cursor:"pointer",padding:"0 12px",fontSize:11}}>
              {panelOpen?"▼":"▲"}
            </button>
          </div>
          {panelOpen&&(
            <div style={{flex:1,overflowY:"auto",padding:"6px 12px"}}>
              {tab==="log"&&logs.map((l,i)=>(
                <div key={i} style={{display:"flex",gap:8,padding:"2px 0",borderBottom:"1px solid #ffffff04",fontSize:10}}>
                  <span style={{color:"#2a3449",width:38,flexShrink:0}}>{l.time}</span>
                  <span style={{color:"#c9a84c",fontWeight:600,width:72,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.agent}</span>
                  <span style={{color:"#64748b",flex:1}}>{l.msg}</span>
                  <span style={{flexShrink:0}}>{l.s}</span>
                </div>
              ))}
              {tab==="kpi"&&(
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,paddingTop:4}}>
                  {[["€0","Vendite","Setup in corso"],["0","Prodotti","In configurazione"],["€89","Budget Ads","Disponibile"],["1/5","Fase","Fase 1 ✅"]].map(([v,l,s])=>(
                    <div key={l} style={{background:"#111820",border:"1px solid #1a2332",borderRadius:8,padding:"8px 10px"}}>
                      <div style={{fontSize:16,fontWeight:800,color:"#c9a84c"}}>{v}</div>
                      <div style={{fontSize:9,color:"#2a3449",textTransform:"uppercase",letterSpacing:0.5,marginTop:2}}>{l}</div>
                      <div style={{fontSize:9,color:"#22c55e",marginTop:3}}>{s}</div>
                    </div>
                  ))}
                </div>
              )}
              {tab==="tasks"&&TASKS.map((t,i)=>{
                const a=AGENTS[t.agent];
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0",borderBottom:"1px solid #ffffff04",fontSize:10}}>
                    <span style={{color:a.hex,fontWeight:600,width:72,flexShrink:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.emoji} {a.nome}</span>
                    <span style={{color:"#64748b",flex:1}}>{t.desc}</span>
                    <span style={{fontSize:9,padding:"1px 6px",borderRadius:5,fontWeight:700,background:t.status==="done"?"#22c55e18":t.status==="working"?"#3b82f618":"#f59e0b18",color:t.status==="done"?"#4ade80":t.status==="working"?"#60a5fa":"#fbbf24"}}>
                      {t.status==="done"?"Completato":t.status==="working"?"In corso":"In attesa"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── CHAT OVERLAY ── */}
      {activeAgent&&ag&&(
        <div style={{position:"fixed",inset:0,background:"#000000aa",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={e=>{if(e.target===e.currentTarget){setActiveAgent(null);setInput("");}}}>
          <div style={{background:"#0d1420",border:`1px solid ${ag.hex}44`,borderRadius:16,width:460,maxHeight:"82vh",display:"flex",flexDirection:"column",overflow:"hidden",boxShadow:`0 24px 60px #00000099,0 0 40px ${ag.hex}11`}}>
            <div style={{padding:"14px 18px",borderBottom:"1px solid #ffffff09",display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:42,height:42,borderRadius:11,background:ag.hex+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,border:`1px solid ${ag.hex}44`,flexShrink:0}}>{ag.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,fontSize:14,color:"#e8eaf0"}}>{ag.nome}</div>
                <div style={{fontSize:10,color:"#4a5568",marginTop:1}}>{ag.titolo}</div>
                <div style={{fontSize:10,color:"#2a3a4a",marginTop:2,lineHeight:1.4}}>{ag.mansioni}</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:4,fontSize:10,color:"#22c55e",flexShrink:0}}>
                <div style={{width:5,height:5,borderRadius:"50%",background:"#22c55e"}}/>Operativo
              </div>
              <button onClick={()=>{setActiveAgent(null);setInput("");}} style={{background:"none",border:"none",color:"#2a3449",cursor:"pointer",fontSize:20,padding:"0 4px",marginLeft:6}}>×</button>
            </div>

            <div ref={msgRef} style={{flex:1,overflowY:"auto",padding:"14px",display:"flex",flexDirection:"column",gap:10,minHeight:160,maxHeight:340}}>
              {!(conversations[activeAgent]||[]).length&&(
                <div style={{background:"#111820",border:"1px solid #1a2332",borderRadius:"12px 12px 12px 2px",padding:"10px 13px",fontSize:13,color:"#64748b",alignSelf:"flex-start",maxWidth:"80%"}}>
                  Ciao! Sono {ag.nome}. {ag.mansioni.split(",")[0]}. Come posso aiutarti?
                </div>
              )}
              {(conversations[activeAgent]||[]).map((m,i)=>(
                <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                  <div style={{maxWidth:"80%",padding:"10px 13px",fontSize:13,lineHeight:1.55,whiteSpace:"pre-wrap",wordBreak:"break-word",
                    borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",
                    background:m.role==="user"?ag.hex:"#111820",
                    color:m.role==="user"?"#0a0a0f":"#e8eaf0",
                    border:m.role==="user"?"none":"1px solid #1a2332",
                    fontWeight:m.role==="user"?500:400,
                  }}>{m.content}</div>
                </div>
              ))}
              {loading&&(
                <div style={{display:"flex",gap:5,padding:"10px 13px",background:"#111820",border:"1px solid #1a2332",borderRadius:"12px 12px 12px 2px",width:"fit-content"}}>
                  {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:ag.hex,opacity:0.3+pulse*0.7,transform:`translateY(${Math.sin(tick*0.2+i*1.5)*4}px)`,transition:"transform 0.05s"}}/>)}
                </div>
              )}
            </div>

            <div style={{padding:"10px 14px",borderTop:"1px solid #ffffff09",display:"flex",gap:8}}>
              <input ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();sendMsg();}}}
                placeholder={`Scrivi a ${ag.nome}...`}
                style={{flex:1,background:"#111820",border:`1px solid ${ag.hex}33`,borderRadius:10,padding:"9px 12px",color:"#e8eaf0",fontSize:13,fontFamily:"inherit",outline:"none"}}
                onFocus={e=>e.target.style.borderColor=ag.hex}
                onBlur={e=>e.target.style.borderColor=ag.hex+"33"}
              />
              <button onClick={sendMsg} disabled={loading||!input.trim()} style={{background:!input.trim()||loading?"#111820":ag.hex,border:"none",borderRadius:10,padding:"9px 14px",color:!input.trim()||loading?"#2a3449":"#0a0a0f",fontSize:16,cursor:!input.trim()||loading?"not-allowed":"pointer",transition:"all 0.15s",fontWeight:700}}>↑</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
