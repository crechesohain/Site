/* « La crèche de tous » : crèche participative.
   - Fresque : la Sainte Famille, les Rois mages et les personnages des visiteurs ; un ciel d'étoiles-intentions.
   - Création d'un personnage (genre → visage → vêtements → accessoires → nom), publié tout de suite.
   - Étoile : une intention, publiée après relecture par un bénévole (page /benevoles.html).
   Données : Supabase (API REST appelée directement, sans bibliothèque ni cookie). Configuration : tous-config.js. */
(function(){
  var CFG = window.TOUS_CONFIG || {};
  var ACTIF = !!(CFG.url && CFG.cle);
  function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

  /* ---------- choix possibles (la base de données vérifie la même liste) ---------- */
  var OPTIONS = {
    genre: [['fille','Une fille'],['garcon','Un garçon']],
    teint: [['#f6dcc4','Peau très claire'],['#e8c19c','Peau claire'],['#d9a77f','Peau mate'],['#a8714a','Peau brune'],['#6e4a32','Peau foncée']],
    cheveux: [['court','Courts'],['ras','Ras'],['frange','Frange'],['raie','Raie'],['boucle','Bouclés'],['milong','Mi-longs'],['long','Longs'],['nattes','Nattes'],['chignon','Chignon']],
    couleurCheveux: [['#1f1a17','Noirs'],['#4a3324','Bruns'],['#8a5a34','Châtains'],['#c9a05a','Blonds'],['#a8452a','Roux'],['#b8b2a8','Gris']],
    yeux: [['grands','Grands'],['points','Petits'],['amande','En amande'],['rieurs','Rieurs'],['clin','Clin d\'œil'],['doux','Fermés']],
    sourcils: [['fins','Fins'],['arques','Arqués'],['epais','Épais'],['aucun','Discrets']],
    nez: [['point','Petit'],['bouton','Bouton'],['arrondi','Arrondi'],['long','Long']],
    bouche: [['sourire','Sourire'],['grand','Grand sourire'],['petite','Petite'],['etonne','Étonnée']],
    tenue: [['berger','Berger'],['village','Villageois'],['musicien','Musicien'],['mage','Roi mage'],['ange','Ange']],
    couleur: [['#7a5c3e','Brun'],['#5d6b3a','Olive'],['#3d4f7a','Bleu'],['#6e3a3f','Bordeaux'],['#8a7a5a','Sable'],['#efe6d2','Ivoire']],
    tete: [['rien','Rien'],['foulard','Foulard'],['bonnet','Bonnet'],['paille','Chapeau'],['couronne','Couronne'],['aureole','Auréole']],
    mains: [['rien','Rien'],['lanterne','Lanterne'],['etoile','Étoile'],['agneau','Agneau'],['cadeau','Cadeau'],['flute','Flûte'],['panier','Panier']],
    chaussures: [['sandales','Sandales'],['bottes','Bottes'],['babouches','Babouches'],['pieds','Pieds nus']]
  };
  var DEFAUT = {genre:'fille',teint:'#e8c19c',cheveux:'long',couleurCheveux:'#4a3324',yeux:'grands',sourcils:'arques',nez:'point',bouche:'sourire',tenue:'berger',couleur:'#7a5c3e',tete:'rien',mains:'rien',chaussures:'sandales'};
  function propre(c){
    var o={}; c=c||{};
    Object.keys(DEFAUT).forEach(function(k){
      var ok=OPTIONS[k].some(function(x){return x[0]===c[k]});
      o[k]=ok?c[k]:DEFAUT[k];
    });
    return o;
  }

  /* ---------- dessin d'un personnage (SVG) ---------- */
  function rond(x,y,r){return 'M'+(x-r)+' '+y+' a'+r+' '+r+' 0 1 0 '+(2*r)+' 0 a'+r+' '+r+' 0 1 0 '+(-2*r)+' 0'}
  function chemin(d,style){return d?'<path d="'+d+'" style="'+style+'"/>':''}
  function personnage(cfg,w){
    var c=propre(cfg), fille=c.genre==='fille', cache=c.tete==='foulard', h=Math.round(w*200/140);
    var HB={long:'M24 50 Q24 22 50 22 Q76 22 76 50 L80 104 Q50 112 20 104 Z',nattes:'M19 64 a7 22 0 1 0 14 0 a7 22 0 1 0 -14 0 M67 64 a7 22 0 1 0 14 0 a7 22 0 1 0 -14 0',chignon:rond(50,23,11),milong:'M24 50 Q24 22 50 22 Q76 22 76 50 L78 80 Q50 86 22 80 Z'};
    var HF={court:'M26 48 Q26 24 50 24 Q74 24 74 48 Q66 36 50 36 Q34 36 26 48 Z',frange:'M26 50 Q26 24 50 24 Q74 24 74 50 L72 43 L28 43 Z',boucle:'M27 47 a8 8 0 1 1 6 -14 a9 9 0 0 1 17 -7 a9 9 0 0 1 17 7 a8 8 0 1 1 6 14 Q50 34 27 47 Z',raie:'M26 50 Q24 22 52 24 Q76 26 74 50 Q70 34 56 32 Q40 34 26 50 Z',ras:'M26.5 45 Q26 25 50 25 Q74 25 73.5 45 Q71 36 63 34 Q50 31.5 37 34 Q29 36 26.5 45 Z',long:'M26 52 Q26 24 50 24 Q74 24 74 52 Q70 34 50 32 Q30 34 26 52 Z'};
    var avant={long:'long',nattes:'long',chignon:'long',milong:'long'}[c.cheveux]||c.cheveux;
    var EY={points:{f:rond(41,52,2.6)+' '+rond(59,52,2.6)},grands:{b:rond(41,52,4.6)+' '+rond(59,52,4.6),f:rond(42,53,2.4)+' '+rond(60,53,2.4),r:rond(43,51.5,.9)+' '+rond(61,51.5,.9)},
      amande:{b:'M36.5 52 Q41 47 45.5 52 Q41 55.5 36.5 52 Z M54.5 52 Q59 47 63.5 52 Q59 55.5 54.5 52 Z',f:rond(41,51.8,2)+' '+rond(59,51.8,2),r:rond(41.8,51.2,.6)+' '+rond(59.8,51.2,.6)},
      clin:{b:rond(41,52,4.6),f:rond(42,53,2.4),r:rond(43,51.5,.9),s:'M55 53 Q59 49 63 53'},rieurs:{s:'M37 53 Q41 48 45 53 M55 53 Q59 48 63 53'},doux:{s:'M37 51 Q41 55 45 51 M55 51 Q59 55 63 51'}}[c.yeux];
    var BR={fins:['M37 45 L45 44 M55 44 L63 45',1.4],arques:['M36 46 Q41 41 46 45 M54 45 Q59 41 64 46',1.8],epais:['M36 45 L46 43.5 M54 43.5 L64 45',3.4],aucun:['',1]}[c.sourcils];
    var NO={point:[rond(50,59,1.3),''],bouton:[rond(50,59,2),''],arrondi:['','M46.5 59 Q50 63 53.5 59'],long:['','M50 53 L47.5 60 L51 60']}[c.nez];
    var MO={sourire:['','M43 65 Q50 71 57 65'],grand:['M42 64 Q50 76 58 64 Z',''],petite:['','M47 67 Q50 68.5 53 67'],etonne:[rond(50,67,2.6),'']}[c.bouche];
    var T=c.tenue, longue=fille||T==='ange'||T==='mage', large=!fille, col=c.couleur;
    var s='<svg class="perso" width="'+w+'" height="'+h+'" viewBox="-20 0 140 200" aria-hidden="true" focusable="false">';
    if(T==='ange') s+=chemin('M40 90 Q0 60 4 120 Q16 130 40 110 Z M60 90 Q100 60 96 120 Q84 130 60 110 Z','fill:#f6f1e6;fill-opacity:.9;stroke:#c9a54c;stroke-width:1.5');
    if(!cache) s+=chemin(HB[c.cheveux]||'','fill:'+c.couleurCheveux);
    // roi / reine mage : grande cape derrière
    if(T==='mage'){ var cape=large?'M27 72 Q50 66 73 72 L92 194 L8 194 Z':'M36 72 L64 72 L92 194 L8 194 Z'; s+=chemin(cape,'fill:'+col)+chemin(cape,'fill:#000;fill-opacity:.35'); }
    if(!longue) s+=chemin('M35 160 h12 v32 h-12 Z M53 160 h12 v32 h-12 Z','fill:#3b2d20');
    var pied='M35 194 a7 4.5 0 1 0 14 0 a7 4.5 0 1 0 -14 0 M51 194 a7 4.5 0 1 0 14 0 a7 4.5 0 1 0 -14 0';
    if(c.chaussures==='sandales') s+=chemin(pied,'fill:'+c.teint)+chemin('M34 197.5 h16 v2.5 h-16 Z M50 197.5 h16 v2.5 h-16 Z','fill:#7a5c3e')+chemin('M36.5 192 L47.5 192 M42 189.5 L42 197 M52.5 192 L63.5 192 M58 189.5 L58 197','fill:none;stroke:#7a5c3e;stroke-width:1.8');
    if(c.chaussures==='bottes') s+=chemin('M34 172 h14 v20 l3 7 h-20 q0 -5 3 -7 Z M52 172 h14 v20 q3 2 3 7 h-20 l3 -7 Z','fill:#2a2a2a')+chemin('M33.5 171 h15 v4.5 h-15 Z M51.5 171 h15 v4.5 h-15 Z','fill:#5a524a');
    if(c.chaussures==='babouches') s+=chemin('M45 191 Q38 189 32 193 Q28 195 26 191.5 Q27 199 36 199.5 L49 199.5 Q51 193 45 191 Z M55 191 Q62 189 68 193 Q72 195 74 191.5 Q73 199 64 199.5 L51 199.5 Q49 193 55 191 Z','fill:#8a3b2e')+chemin('M33 195 Q40 193 47 195 M67 195 Q60 193 53 195','fill:none;stroke:#c9a54c;stroke-width:1.2');
    if(c.chaussures==='pieds') s+=chemin(pied,'fill:'+c.teint);
    // corps : robe longue (fille, ange, mage) ou tunique (garçon)
    var corps=longue?(large?'M29 74 Q50 68 71 74 L82 192 L18 192 Z':'M38 74 L62 74 L82 192 L18 192 Z'):'M28 74 Q50 68 72 74 L74 166 L26 166 Z';
    s+=chemin(corps,'fill:'+col);
    var manches=T==='ange'
      ?(large?'M30 76 L8 126 L30 129 L37 94 Z M70 76 L92 126 L70 129 L63 94 Z':'M39 76 L14 124 L34 129 L45 92 Z M61 76 L86 124 L66 129 L55 92 Z')
      :(large?'M30 76 L15 122 L24 126 L37 94 Z M70 76 L85 122 L76 126 L63 94 Z':'M39 76 L22 122 L31 126 L45 92 Z M61 76 L78 122 L69 126 L55 92 Z');
    s+=chemin(manches,'fill:'+col)+chemin(manches,'fill:#000;fill-opacity:.12');
    var bas=longue?192:166;
    if(T==='berger'){
      // gilet en peau de mouton, ouvert devant, et ceinture de corde
      var g=large?[29,71,114]:[35,65,112], fe='M'+g[0]+' 74 Q50 69 '+g[1]+' 74 L'+(g[1]-1)+' '+g[2]+' L'+(g[0]+1)+' '+g[2]+' Z';
      for(var x=g[0]+4;x<=g[1]-4;x+=6.5) fe+=' '+rond(x,g[2],3.6);
      s+=chemin(fe,'fill:#efe6d2;stroke:#cdbb94;stroke-width:.8')+chemin('M50 74 L50 '+(g[2]+3),'fill:none;stroke:'+col+';stroke-width:4');
      s+=chemin(large?'M27 121 h46 v4 h-46 Z':'M33 119 h34 v4 h-34 Z','fill:#a0804e');
    }
    if(T==='village'){
      // foulard noué au cou, ceinture et tablier
      s+=chemin(large?'M26.5 108 h47 v6 h-47 Z':'M33 106 h34 v6 h-34 Z','fill:#3b2d20');
      s+=chemin(large?'M36 114 L64 114 L66 160 L34 160 Z':'M39 112 L61 112 L69 184 L31 184 Z','fill:#efe6d2');
      s+=chemin('M41 75 L59 75 L50 91 Z','fill:#8a3b2e');
    }
    if(T==='musicien'){
      // col brodé, écharpe dorée, bandes au bas, tambourin à la hanche
      s+=chemin('M37 75 Q50 88 63 75','fill:none;stroke:#c9a54c;stroke-width:3');
      s+=chemin('M38 78 L66 130','fill:none;stroke:#c9a54c;stroke-width:3.5');
      s+=chemin(longue?'M22 176 L78 176 M20.5 183 L79.5 183':'M26.5 154 L73.5 154 M26.7 160 L73.3 160','fill:none;stroke:#c9a54c;stroke-width:2.5');
      s+=chemin(rond(14,146,10),'fill:#a0804e;stroke:#c9a54c;stroke-width:2')+chemin(rond(14,146,6.5),'fill:#efe6d2');
    }
    if(T==='mage'){
      // galon doré, bande au bas, col d'hermine
      s+=chemin('M50 80 L50 '+bas,'fill:none;stroke:#c9a54c;stroke-width:3')+chemin('M19 185 L81 185','fill:none;stroke:#c9a54c;stroke-width:5');
      s+=chemin('M34 72 Q50 84 66 72 L66 80 Q50 93 34 80 Z','fill:#f6f1e6')+chemin(rond(40,81,1.1)+' '+rond(50,86,1.1)+' '+rond(60,81,1.1),'fill:#2a2a2a');
    }
    if(T==='ange') s+=chemin(large?'M31 102 h38 v4 h-38 Z':'M38 100 h24 v4 h-24 Z','fill:#c9a54c');
    var mainsP=large?rond(19.5,125,5.5)+' '+rond(80.5,125,5.5):rond(26,125,5)+' '+rond(74,125,5);
    if(T==='ange') mainsP=large?rond(19,127,5.5)+' '+rond(81,127,5.5):rond(24,126,5)+' '+rond(76,126,5);
    s+=chemin(mainsP+' M50 70 L43 80 L57 80 Z','fill:'+c.teint);
    s+='<circle cx="50" cy="50" r="24" style="fill:'+c.teint+'"/>';
    if(cache) s+=chemin('M21 58 Q21 18 50 18 Q79 18 79 58 L76 100 L67 72 Q68 32 50 32 Q32 32 33 72 L24 100 Z','fill:#cdbb94');
    else s+=chemin(HF[avant]||'','fill:'+c.couleurCheveux);
    s+=chemin('M33 61 a4 3 0 1 0 8 0 a4 3 0 1 0 -8 0 M59 61 a4 3 0 1 0 8 0 a4 3 0 1 0 -8 0','fill:#d9786e;fill-opacity:.3');
    s+=chemin(EY.b||'','fill:#fff;stroke:#2a2a2a;stroke-width:.8')+chemin(EY.f||'','fill:#2a2a2a')+chemin(EY.r||'','fill:#fff')+chemin(EY.s||'','fill:none;stroke:#2a2a2a;stroke-width:2;stroke-linecap:round');
    s+=chemin(BR[0],'fill:none;stroke:'+c.couleurCheveux+';stroke-width:'+BR[1]+';stroke-linecap:round');
    s+=chemin(NO[0],'fill:#000;fill-opacity:.25')+chemin(NO[1],'fill:none;stroke:#000;stroke-opacity:.35;stroke-width:1.5;stroke-linecap:round');
    s+=chemin(MO[0],'fill:#6e2e2a')+chemin(MO[1],'fill:none;stroke:#6e2e2a;stroke-width:2;stroke-linecap:round');
    var CH={couronne:['M34 30 L34 14 L42 23 L50 8 L58 23 L66 14 L66 30 Z','#c9a54c'],bonnet:['M25 42 Q25 15 50 15 Q75 15 75 42 Z','#8a3b2e'],paille:['M26 37 Q26 14 50 14 Q74 14 74 37 Z M8 39 Q50 27 92 39 Q50 48 8 39 Z','#d8b86a']}[c.tete];
    if(CH) s+=chemin(CH[0],'fill:'+CH[1]);
    if(c.tete==='paille') s+=chemin('M26.5 31 Q50 27 73.5 31 L73.8 36 Q50 32 26.2 36 Z','fill:#8a3b2e');
    if(c.tete==='aureole') s+=chemin('M28 16 a22 6 0 1 0 44 0 a22 6 0 1 0 -44 0','fill:none;stroke:#e3cf96;stroke-width:3');
    if(c.mains==='lanterne') s+=chemin(rond(80,134,15),'fill:#e3cf96;fill-opacity:.35');
    if(c.mains==='etoile') s+=chemin(rond(84,108,14),'fill:#e3cf96;fill-opacity:.35');
    var AC={lanterne:['M74 126 h12 v16 h-12 Z','#e3cf96','M76 126 Q80 118 84 126'],cadeau:['M66 116 h18 v16 h-18 Z','#c9a54c','M75 116 V132 M66 124 H84'],etoile:['M84 94 L87 105 L98 108 L87 111 L84 122 L81 111 L70 108 L81 105 Z','#f6f1e6',''],panier:['M66 124 h22 l-3 12 h-16 Z','#a0804e','M68 124 Q77 110 86 124']}[c.mains];
    if(AC) s+=chemin(AC[0],'fill:'+AC[1])+chemin(AC[2],'fill:none;stroke:#3b2d20;stroke-width:2');
    if(c.mains==='agneau'){
      // petit agneau debout aux pieds, tourné vers l'extérieur
      s+=chemin('M-9 180 h2.6 v16 h-2.6 Z M-3 181 h2.6 v15 h-2.6 Z M6 181 h2.6 v15 h-2.6 Z M11 180 h2.6 v16 h-2.6 Z','fill:#3b2d20');
      s+=chemin(rond(-6,173,7)+' '+rond(2,169,8)+' '+rond(10,173,7)+' '+rond(2,178,7)+' '+rond(-4,180,5.5)+' '+rond(9,180,5.5)+' '+rond(15,170,3.2),'fill:#f6f1e6;stroke:#d6cdb8;stroke-width:.8');
      s+=chemin('M-12 160 a5.5 7 0 1 0 0.1 0 Z','fill:#3b2d20')+chemin('M-15 160 L-22 157 L-17 164 Z','fill:#3b2d20');
      s+=chemin(rond(-14,165,1.1),'fill:#f6f1e6')+chemin(rond(-9,159,4)+' '+rond(-5,162,3.2),'fill:#f6f1e6');
    }
    if(c.mains==='flute'){
      // flûte de la bouche à la main, et quelques notes
      var mx=large?80:74;
      s+=chemin('M56 66 L'+mx+' 120','fill:none;stroke:#c9a54c;stroke-width:4;stroke-linecap:round');
      s+=chemin(rond(56+(mx-56)*.45,66+54*.45,.9)+' '+rond(56+(mx-56)*.58,66+54*.58,.9)+' '+rond(56+(mx-56)*.71,66+54*.71,.9),'fill:#3b2d20');
      s+=chemin('M84 72 m-4.4 0 a4.4 3.2 -20 1 0 8.8 0 a4.4 3.2 -20 1 0 -8.8 0 M98 58 m-4.4 0 a4.4 3.2 -20 1 0 8.8 0 a4.4 3.2 -20 1 0 -8.8 0','fill:#e3cf96;fill-opacity:.9')+chemin('M88 71 L88 54 Q93 55 94 60 M102 57 L102 40','fill:none;stroke:#e3cf96;stroke-opacity:.9;stroke-width:1.8');
    }
    return s+'</svg>';
  }

  /* ---------- accès aux données ---------- */
  function api(chemin,opt){
    opt=opt||{};
    var h={'apikey':CFG.cle,'Content-Type':'application/json','Accept-Profile':'creches','Content-Profile':'creches'};
    if(opt.prefer) h.Prefer=opt.prefer;
    return fetch(CFG.url+'/rest/v1/'+chemin,{method:opt.method||'GET',headers:h,body:opt.body?JSON.stringify(opt.body):undefined,cache:'no-store'})
      .then(function(r){ if(!r.ok) return r.text().then(function(t){var e=new Error(t||r.status);e.status=r.status;throw e}); return r.text().then(function(t){return t?JSON.parse(t):null}); });
  }
  var donnees={perso:null,etoiles:null}, chargement=false;
  function charger(){
    if(!ACTIF) return Promise.resolve();
    return Promise.all([
      api('personnages?select=id,nom,config&order=cree_le.asc&limit=3000'),
      api('etoiles?select=id,texte,signature&order=allumee_le.asc&limit=3000')
    ]).then(function(d){donnees.perso=d[0]||[];donnees.etoiles=d[1]||[]});
  }

  /* ---------- la fresque ---------- */
  var H=640;                                   // hauteur de la scène en px
  function hash(t){var h=2166136261;for(var i=0;i<t.length;i++){h^=t.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
  function largeurDispo(){ var p=document.querySelector('.page'); var w=p?p.clientWidth-38:innerWidth-38; return Math.max(1100,Math.floor(w)); }
  function places(n){
    /* emplacements au sol, du plus proche de l'étable au plus éloigné ; la scène s'élargit avec le nombre de personnages */
    // peu de monde : grands personnages ; beaucoup de monde : ils rapetissent pour tous tenir
    var f=n<=12?1.7:(n<=30?1.45:(n<=60?1.2:1));
    var rangs=[[0.81,48*f,74*f],[0.89,54*f,70*f],[0.97,60*f,66*f]];   // y (fraction), largeur du personnage, pas entre deux
    var W=largeurDispo(), liste;
    for(;;){
      liste=[]; var cx=W/2;
      rangs.forEach(function(r,i){
        for(var x=30+(i%2?r[2]/2:0);x<W-30;x+=r[2]){
          if(i===0&&x>cx-520&&x<cx+215) continue;   // devant les mages et l'étable : on laisse voir la scène
          if(i===1&&x>cx-60*f&&x<cx+60*f) continue;     // l'axe de la mangeoire reste dégagé
          liste.push({x:x,y:r[0],w:Math.round(r[1]),d:Math.abs(x-cx)+i*28*f});
        }
      });
      if(liste.length>=n||W>40000) break;
      W+=600;
    }
    liste.sort(function(a,b){return a.d-b.d});
    return {W:W,liste:liste};
  }
  function jourDeNoel(){
    if(/[?&]noel\b/.test(location.search)) return true;
    var d=new Date(), m=d.getMonth();
    return (m===11&&d.getDate()>=25)||m===0||m===1;
  }
  /* compte à rebours de Noël, sous l'étoile de Bethléem */
  function compteNoel(){
    var d=new Date(), m=d.getMonth(), j=d.getDate(), t;
    if(m===11&&j===25) t='Joyeux Noël&nbsp;!';
    else if((m===11&&j>25)||m<=1) t='';
    else {
      var noel=new Date(d.getFullYear(),11,25), n=Math.ceil((noel-new Date(d.getFullYear(),m,j))/86400000);
      t=n===1?'Noël, c\'est demain':'Noël dans <b>'+n+'</b> jours';
    }
    return t?'<div class="tous-noel">'+t+'</div>':'';
  }
  var choixEtoile=-1;
  function fresque(moi){
    var titreH='<div class="hero"><h1>La crèche de tous</h1><div class="lieu">Crèche participative</div></div>';
    var intro='<p class="intro">Prends place autour de l\'Enfant de Bethléem avec ton propre personnage. Tu peux aussi allumer une étoile et y confier une intention.</p>';
    var boutons='<p class="tous-actions"><a class="bouton plein-or" href="#creer">Crée ton personnage</a> <a class="bouton" href="#etoile">Allume une étoile</a></p>';
    if(!ACTIF) return titreH+intro+'<article class="carte"><div class="contenu texte"><p>La crèche de tous ouvre très bientôt. Revenez dans quelques jours&nbsp;!</p></div></article>';
    if(!donnees.perso) return titreH+intro+boutons+'<p class="aide" id="tousEtat">Chargement de la crèche…</p>';
    var P=donnees.perso, E=donnees.etoiles, pl=places(P.length), W=pl.W;
    var h=titreH+intro+boutons;
    h+='<div class="tous-cadre">';
    h+='<div class="tous-fresque" id="fresque" tabindex="0" aria-label="Fresque de la crèche : faites glisser pour la parcourir, pincez ou utilisez la molette pour zoomer"><div class="tous-taille" id="tousTaille" style="width:'+W+'px;height:'+H+'px"><div class="tous-scene" id="tousScene" style="width:'+W+'px;height:'+H+'px">';
    // ciel : une case par étoile, réparties au hasard (mais toujours au même endroit pour une même étoile)
    var cols=Math.floor(W/64), lignes=5, cases=[];
    for(var r=0;r<lignes;r++) for(var q=0;q<cols;q++) cases.push([q,r]);
    cases.sort(function(a,b){return hash('c'+a[0]+'-'+a[1])-hash('c'+b[0]+'-'+b[1])});
    E.forEach(function(e,i){
      var k=cases[i%cases.length], tour=Math.floor(i/cases.length), hh=hash(e.id);
      var x=k[0]*64+12+(hh%40)+(tour*17)%30, y=34+k[1]*46+((hh>>8)%26)+(tour*11)%20;
      if(Math.abs(x-W/2)<115&&y<165) y+=120;   // l'étoile de Bethléem et le compte à rebours gardent leur place
      var t=(hh>>4)%3===0?14:10;
      h+='<button type="button" class="tous-etoile'+(i===choixEtoile?' choisie':'')+'" data-e="'+i+'" style="left:'+x+'px;top:'+y+'px;--t:'+t+'px;--d:'+(2+(hh%28)/10)+'s" aria-label="Étoile de '+esc(e.signature||'Anonyme')+'"><span></span></button>';
    });
    h+='<div class="tous-bethleem" aria-hidden="true"><i></i><b></b></div>'+compteNoel()+'<div class="tous-sol" aria-hidden="true"></div>';
    var D=window.TOUS_DECOR||{};
    h+=(D.mages||'')+(D.etable||'').replace('%JESUS%',jourDeNoel()?(D.jesus||''):'');
    P.forEach(function(p,i){
      var s=pl.liste[i]; if(!s) return;
      var nom=p.nom||'Un visiteur', hh=Math.round(s.w*200/140);
      h+='<button type="button" class="tous-perso'+(p.id===moi?' moi':'')+'" style="left:'+s.x+'px;top:'+(s.y*H)+'px;width:'+s.w+'px;height:'+hh+'px;z-index:'+Math.round(s.y*100)+'" aria-label="'+esc(nom)+'">'+personnage(p.config,s.w)+'<span class="tip">'+esc(nom)+'</span></button>';
    });
    h+='</div></div></div><button type="button" class="tous-voir-tout" id="tousVoirTout" hidden>Voir toute la crèche</button></div>';
    if(P.length) h+='<form class="tous-cherche" id="tousCherche" role="search"><label for="tousNomCherche">Retrouve un personnage</label><div><input id="tousNomCherche" type="search" placeholder="Son nom" autocomplete="off"><button type="submit" class="bouton">Chercher</button></div><p id="tousTrouve" aria-live="polite"></p></form>';
    var e=E[choixEtoile];
    h+='<div class="tous-intention" role="status" id="intention">'+(e?'<small>Étoile allumée par '+esc(e.signature||'Anonyme')+'</small><p>«&nbsp;'+esc(e.texte)+'&nbsp;»</p>':'<small>Touchez une étoile</small><p>Chaque étoile porte l\'intention d\'un visiteur.</p>')+'</div>';
    return h;
  }
  var largeurRendue=0, minuteur=null;
  addEventListener('resize',function(){
    clearTimeout(minuteur);
    minuteur=setTimeout(function(){
      if(/^#creche-de-tous/.test(location.hash)&&document.getElementById('fresque')&&Math.abs(largeurDispo()-largeurRendue)>40) window.TOUS_rendre();
    },250);
  });
  /* glisser à la souris : un seul jeu d'écouteurs pour toute la page */
  var glisse=null;
  addEventListener('pointermove',function(e){ if(!glisse) return; var dx=e.clientX-glisse.x, dy=e.clientY-glisse.y; if(Math.abs(dx)+Math.abs(dy)>5) glisse.b=true; if(glisse.b){glisse.f.scrollLeft=glisse.sl-dx; glisse.f.scrollTop=glisse.st-dy;} });
  addEventListener('pointerup',function(){ var g=glisse; setTimeout(function(){ if(glisse===g) glisse=null },0); });
  function sansAccent(t){return String(t||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().trim()}
  function brancherFresque(moi){
    largeurRendue=largeurDispo();
    var f=document.getElementById('fresque');
    if(!f) return;
    var taille=document.getElementById('tousTaille'), scene=document.getElementById('tousScene'), voir=document.getElementById('tousVoirTout');
    var W=parseFloat(scene.style.width), z=1, MAX=3.2, zmin=Math.min(1,f.clientHeight/H);
    function zoomer(n,cx,cy,anime){
      n=Math.max(zmin,Math.min(MAX,n));
      var px=(f.scrollLeft+cx)/z, py=(f.scrollTop+cy)/z;
      z=n;
      taille.style.width=(W*z)+'px'; taille.style.height=(H*z)+'px';
      scene.style.transform='scale('+z+')';
      f.scrollLeft=px*z-cx; f.scrollTop=py*z-cy;
      f.classList.toggle('zoome',z>zmin+.01); voir.hidden=z<=zmin+.01;
    }
    function viser(el,n){
      var x=parseFloat(el.style.left), y=parseFloat(el.style.top)-parseFloat(el.style.height)/2;
      zoomer(n,f.clientWidth/2,f.clientHeight/2);
      f.scrollLeft=x*z-f.clientWidth/2; f.scrollTop=y*z-f.clientHeight/2;
    }
    // départ : centré sur l'étable, ou zoomé sur « mon » personnage
    var cible=f.querySelector('.tous-perso.moi');
    if(zmin<1) zoomer(zmin,0,0);
    f.scrollLeft=(f.scrollWidth-f.clientWidth)/2;
    if(cible){ viser(cible,2.2); cible.focus({preventScroll:true}); }
    voir.addEventListener('click',function(){ zoomer(zmin,f.clientWidth/2,f.clientHeight/2); f.scrollLeft=(f.scrollWidth-f.clientWidth)/2; });
    // molette : vers le haut = zoom avant ; vers le bas = zoom arrière, puis la page défile normalement
    f.addEventListener('wheel',function(e){
      var dy=e.deltaMode===1?e.deltaY*16:e.deltaY;
      if(Math.abs(e.deltaX)>Math.abs(dy)&&!e.ctrlKey) return;     // défilement horizontal du pavé tactile
      if(!e.ctrlKey&&dy>0&&z<=zmin+.01) return;
      e.preventDefault(); var r=f.getBoundingClientRect();
      zoomer(z*Math.exp(-Math.max(-120,Math.min(120,dy))*(e.ctrlKey?0.01:0.0025)),e.clientX-r.left,e.clientY-r.top);
    },{passive:false});
    // pincer à deux doigts
    var pince=null;
    f.addEventListener('touchstart',function(e){ if(e.touches.length===2){ var a=e.touches[0],b=e.touches[1], r=f.getBoundingClientRect(); pince={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),z:z,cx:(a.clientX+b.clientX)/2-r.left,cy:(a.clientY+b.clientY)/2-r.top}; } },{passive:true});
    f.addEventListener('touchmove',function(e){ if(pince&&e.touches.length===2){ e.preventDefault(); var a=e.touches[0],b=e.touches[1]; zoomer(pince.z*Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)/pince.d,pince.cx,pince.cy); } },{passive:false});
    f.addEventListener('touchend',function(e){ if(e.touches.length<2) pince=null; });
    // double-clic / double-toucher sur le décor : zoom avant, ou retour à la vue d'ensemble
    f.addEventListener('dblclick',function(e){ if(e.target.closest('.tous-perso,.tous-etoile')) return; var r=f.getBoundingClientRect(); zoomer(z>zmin*1.5?zmin:2.2,e.clientX-r.left,e.clientY-r.top); });
    // glisser à la souris
    f.addEventListener('pointerdown',function(e){ if(e.pointerType!=='mouse'||e.button!==0) return; glisse={f:f,x:e.clientX,y:e.clientY,sl:f.scrollLeft,st:f.scrollTop,b:false}; });
    f.addEventListener('click',function(e){ if(glisse&&glisse.b){e.preventDefault();e.stopPropagation()} },true);
    f.querySelectorAll('.tous-etoile').forEach(function(b){
      b.addEventListener('click',function(){
        choixEtoile=+b.dataset.e; var e=donnees.etoiles[choixEtoile];
        f.querySelectorAll('.tous-etoile.choisie').forEach(function(x){x.classList.remove('choisie')}); b.classList.add('choisie');
        document.getElementById('intention').innerHTML='<small>Étoile allumée par '+esc(e.signature||'Anonyme')+'</small><p>«&nbsp;'+esc(e.texte)+'&nbsp;»</p>';
      });
    });
    // retrouver un personnage par son nom
    var form=document.getElementById('tousCherche');
    if(form){
      var trouves=[], rang=-1, dernier='';
      form.addEventListener('submit',function(e){
        e.preventDefault();
        var q=sansAccent(document.getElementById('tousNomCherche').value), sortie=document.getElementById('tousTrouve');
        f.querySelectorAll('.tous-perso.trouve').forEach(function(x){x.classList.remove('trouve')});
        if(!q){sortie.textContent='';return}
        if(q!==dernier){
          dernier=q; rang=-1;
          trouves=[].slice.call(f.querySelectorAll('.tous-perso')).filter(function(b){return sansAccent(b.getAttribute('aria-label')).indexOf(q)>=0});
        }
        if(!trouves.length){sortie.textContent='Aucun personnage à ce nom pour l\'instant.';return}
        rang=(rang+1)%trouves.length; var el=trouves[rang];
        el.classList.add('trouve'); viser(el,2.4); el.focus({preventScroll:true});
        sortie.textContent=trouves.length>1?('Personnage '+(rang+1)+' sur '+trouves.length+' · appuie encore sur « Chercher » pour voir le suivant.'):'Le voici !';
      });
    }
  }

  /* ---------- création d'un personnage ---------- */
  var C={etape:0,partie:'teint',nom:'',c:Object.assign({},DEFAUT),envoi:false,erreur:'',id:null};
  var NOMS_TENUE={berger:['Bergère','Berger'],village:['Villageoise','Villageois'],musicien:['Musicienne','Musicien'],mage:['Reine mage','Roi mage'],ange:['Ange','Ange']};
  function puces(cle,titre){
    var nuancier=cle==='teint'||cle==='couleurCheveux'||cle==='couleur';
    var h='<fieldset class="tous-choix"><legend'+(titre?'':' class="visuellement-cache"')+'>'+esc(titre||cle)+'</legend><div>';
    OPTIONS[cle].forEach(function(o){
      var on=C.c[cle]===o[0], lib=o[1];
      if(cle==='tenue') lib=NOMS_TENUE[o[0]][C.c.genre==='fille'?0:1];
      h+=nuancier
        ?'<button type="button" class="nuance'+(on?' on':'')+'" data-k="'+cle+'" data-v="'+o[0]+'" aria-pressed="'+on+'" aria-label="'+esc(lib)+'" style="background:'+o[0]+'"></button>'
        :'<button type="button" class="puce'+(on?' on':'')+'" data-k="'+cle+'" data-v="'+o[0]+'" aria-pressed="'+on+'">'+esc(lib)+'</button>';
    });
    return h+'</div></fieldset>';
  }
  /* zoom de l'aperçu : sur le visage quand on règle le visage, en pied pour les vêtements */
  function zoom(){
    var z=1, y=107;
    if(C.etape===1){
      if(/^(yeux|sourcils|nez|bouche)$/.test(C.partie)){z=3.1;y=58}
      else if(C.partie==='teint'){z=2.2;y=62}
      else {z=1.8;y=72}
    }
    if(C.etape===3&&C.zoomCible==='tete'){z=2;y=50}
    if(C.etape===3&&C.zoomCible==='pieds'){z=2.2;y=186}
    var dy=z===1?0:Math.round(125-(30+y));
    return {y:y,t:'translateY('+dy+'px) scale('+z+')'};
  }
  var zoomAvant='';
  function creer(){
    if(!ACTIF) return fresque();
    var titres=['Tu es…','Ton visage','Tes vêtements','Tes accessoires','Son nom','Te voilà dans la crèche&nbsp;!'];
    var e=C.etape, h='<div class="tous-creer">';
    h+='<a class="retour" href="#creche-de-tous"><span aria-hidden="true">←</span> La crèche de tous</a>';
    h+='<div class="tous-etapes" aria-hidden="true">'+[0,1,2,3,4].map(function(k){return '<i class="'+(k<e?'fait':'')+(k===e?' cour':'')+'"></i>'}).join('')+'</div>';
    h+='<div class="tous-etape-num">'+(e<5?'Étape '+(e+1)+' sur 5':'C\'est fait')+'</div><h1>'+titres[e]+'</h1>';
    if(e===0){
      h+='<div class="tous-genres">';
      OPTIONS.genre.forEach(function(o){
        var on=C.c.genre===o[0], cfg=Object.assign({},C.c,{genre:o[0],cheveux:o[0]==='fille'?'long':'court'});
        h+='<button type="button" class="tous-genre'+(on?' on':'')+'" data-k="genre" data-v="'+o[0]+'" aria-pressed="'+on+'">'+personnage(cfg,110)+'<b>'+o[1]+'</b></button>';
      });
      h+='</div><p class="tous-aide">Tu pourras tout changer ensuite&nbsp;: visage, vêtements, accessoires.</p>';
    } else {
      h+='<div class="tous-apercu"><div class="tous-zoom" style="transform-origin:75px '+zoom().y+'px;transform:'+zoom().t+'">'+personnage(C.c,150)+'</div></div>';
    }
    if(e===1){
      h+='<div class="tous-onglets-titre">Partie du visage</div><div class="tous-parties" role="tablist" aria-label="Partie du visage">';
      [['teint','Peau'],['cheveux','Cheveux'],['couleurCheveux','Couleur'],['yeux','Yeux'],['sourcils','Sourcils'],['nez','Nez'],['bouche','Bouche']].forEach(function(p){
        h+='<button type="button" role="tab" class="onglet'+(C.partie===p[0]?' on':'')+'" data-partie="'+p[0]+'" aria-selected="'+(C.partie===p[0])+'">'+p[1]+'</button>';
      });
      var noms={teint:'Choisis ta peau',cheveux:'Choisis ta coiffure',couleurCheveux:'Choisis la couleur de tes cheveux',yeux:'Choisis tes yeux',sourcils:'Choisis tes sourcils',nez:'Choisis ton nez',bouche:'Choisis ta bouche'};
      h+='</div><div class="tous-panneau" role="tabpanel">'+puces(C.partie,noms[C.partie])+'</div>';
    }
    if(e===2) h+=puces('tenue','Tenue')+puces('couleur','Couleur');
    if(e===3) h+=puces('tete','Sur la tête')+puces('mains','Dans les mains')+puces('chaussures','Aux pieds');
    if(e===4){
      h+='<label class="tous-champ">Nom de ton personnage<input type="text" id="tousNom" maxlength="20" autocomplete="off" value="'+esc(C.nom)+'" placeholder="ex. Léa, Petit berger, Mamie Jo…"></label>';
      h+='<p class="tous-aide">Le nom apparaît quand on passe sur ton personnage. Un prénom ou un surnom, pas de nom de famille.</p>';
    }
    if(e===5){
      h+='<p class="tous-aide centre">'+esc(C.nom||'Ton personnage')+' a rejoint la crèche. Il y est déjà&nbsp;!</p>';
      h+='<p class="tous-actions"><a class="bouton plein-or" href="#creche-de-tous/'+esc(C.id||'')+'">Le voir dans la crèche</a> <a class="bouton" href="#etoile">Allumer aussi une étoile</a></p>';
      h+='<p class="tous-actions"><button type="button" class="lien" id="tousEncore">Créer un autre personnage</button></p>';
    }
    if(C.erreur) h+='<p class="tous-erreur" role="alert">'+esc(C.erreur)+'</p>';
    if(e<5){
      h+='<div class="tous-nav">'+(e>0?'<button type="button" class="bouton" id="tousPrec">Retour</button>':'')+'<button type="button" class="bouton plein-or" id="tousSuiv"'+(C.envoi?' disabled':'')+'>'+(e===4?(C.envoi?'Un instant…':'Placer dans la crèche'):'Suivant')+'</button></div>';
    }
    return h+'</div>';
  }
  function brancherCreer(){
    var box=document.querySelector('.tous-creer'); if(!box) return;
    var zb=box.querySelector('.tous-zoom');
    if(zb){
      var cible=zb.style.transform, origine=zb.style.transformOrigin;
      if(zoomAvant&&zoomAvant.t!==cible){
        zb.style.transition='none'; zb.style.transformOrigin=zoomAvant.o; zb.style.transform=zoomAvant.t; zb.getBoundingClientRect();
        zb.style.transition=''; zb.style.transformOrigin=origine; zb.style.transform=cible;
      }
      zoomAvant={t:cible,o:origine};
    } else zoomAvant='';
    function refaire(focus){
      var b=document.querySelector('.tous-creer'); if(!b) return;
      b.outerHTML=creer(); brancherCreer();
      var f=focus&&document.querySelector(focus); if(f) f.focus({preventScroll:true});
    }
    box.querySelectorAll('[data-k]').forEach(function(b){
      b.addEventListener('click',function(){
        var k=b.dataset.k, v=b.dataset.v, c=C.c; c[k]=v;
        if(k==='genre') c.cheveux=v==='fille'?'long':'court';
        if(k==='tenue'){
          c.couleur={berger:'#7a5c3e',village:'#5d6b3a',musicien:'#3d4f7a',mage:'#6e3a3f',ange:'#efe6d2'}[v];
          if(c.tete==='aureole'||c.tete==='couronne') c.tete='rien';
          if(v==='ange') c.tete='aureole';
          if(v==='mage'){c.tete='couronne';c.mains='cadeau'}
        }
        if(C.etape===3) C.zoomCible=(k==='tete'&&v!=='rien')?'tete':(k==='chaussures'?'pieds':null);
        refaire('[data-k="'+k+'"][data-v="'+v+'"]');
      });
    });
    box.querySelectorAll('[data-partie]').forEach(function(b){
      b.addEventListener('click',function(){C.partie=b.dataset.partie;refaire('[data-partie="'+C.partie+'"]')});
    });
    var nom=document.getElementById('tousNom');
    if(nom){ nom.addEventListener('input',function(){C.nom=nom.value}); nom.addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('tousSuiv').click()}); }
    var p=document.getElementById('tousPrec'); if(p) p.addEventListener('click',function(){C.etape--;C.erreur='';refaire('.tous-creer h1')});
    var s=document.getElementById('tousSuiv');
    if(s) s.addEventListener('click',function(){
      if(C.etape<4){C.etape++;C.erreur='';refaire('.tous-creer h1');return}
      if(C.envoi) return;
      C.envoi=true; C.erreur=''; refaire();
      api('personnages?select=id',{method:'POST',prefer:'return=representation',body:{nom:C.nom.trim().slice(0,20)||null,config:propre(C.c)}})
        .then(function(r){C.id=r&&r[0]&&r[0].id; C.etape=5; C.envoi=false; donnees.perso=null; refaire('.tous-creer h1')})
        .catch(function(err){C.envoi=false; C.erreur=err.status===429||/trop/i.test(err.message)?'Beaucoup de monde en ce moment : réessaie dans une minute.':'L\'envoi n\'a pas marché. Vérifie ta connexion et réessaie.'; refaire()});
    });
    var enc=document.getElementById('tousEncore');
    if(enc) enc.addEventListener('click',function(){C={etape:0,partie:'teint',nom:'',c:Object.assign({},DEFAUT),envoi:false,erreur:'',id:null};refaire('.tous-creer h1')});
  }

  /* ---------- allumer une étoile ---------- */
  var S={envoye:false,envoi:false,erreur:'',texte:'',signe:''};
  function etoile(){
    if(!ACTIF) return fresque();
    var h='<div class="tous-creer tous-etoile-page">';
    h+='<a class="retour" href="#creche-de-tous"><span aria-hidden="true">←</span> La crèche de tous</a>';
    if(S.envoye){
      h+='<div class="tous-grande-etoile" aria-hidden="true"></div><h1>Merci&nbsp;!</h1>';
      h+='<p class="tous-aide centre">Ton étoile s\'allumera au-dessus de la crèche dès qu\'un bénévole l\'aura relue, en général le jour même.</p>';
      h+='<p class="tous-actions"><a class="bouton plein-or" href="#creche-de-tous">Voir la crèche</a> <button type="button" class="bouton" id="tousAutre">Allumer une autre étoile</button></p>';
      return h+'</div>';
    }
    h+='<div class="tous-grande-etoile" aria-hidden="true"></div><h1>Allume une étoile</h1>';
    h+='<p class="tous-aide centre">Confie une intention, un merci, une prière. Elle brillera au-dessus de la crèche.</p>';
    h+='<label class="tous-champ">Mon intention<textarea id="tousTexte" rows="4" maxlength="140" placeholder="Pour ma grand-mère, qu\'elle guérisse vite.">'+esc(S.texte)+'</textarea><span class="compte" id="tousCompte">'+S.texte.length+' / 140</span></label>';
    h+='<label class="tous-champ">Signé<input type="text" id="tousSigne" maxlength="30" autocomplete="off" value="'+esc(S.signe)+'" placeholder="Prénom, ou vide pour « Anonyme »"></label>';
    h+='<p class="tous-aide">Pas de nom de famille, d\'adresse ni de numéro de téléphone. Chaque étoile est relue par un bénévole avant de s\'allumer.</p>';
    if(S.erreur) h+='<p class="tous-erreur" role="alert">'+esc(S.erreur)+'</p>';
    h+='<div class="tous-nav"><button type="button" class="bouton plein-or" id="tousEnvoyer"'+(S.envoi?' disabled':'')+'>'+(S.envoi?'Un instant…':'Allumer mon étoile')+'</button></div>';
    return h+'</div>';
  }
  function brancherEtoile(){
    var box=document.querySelector('.tous-etoile-page'); if(!box) return;
    function refaire(){var b=document.querySelector('.tous-etoile-page'); if(!b) return; b.outerHTML=etoile();brancherEtoile()}
    var t=document.getElementById('tousTexte'), sg=document.getElementById('tousSigne'), n=document.getElementById('tousCompte');
    if(t) t.addEventListener('input',function(){S.texte=t.value;n.textContent=t.value.length+' / 140'});
    if(sg) sg.addEventListener('input',function(){S.signe=sg.value});
    var a=document.getElementById('tousAutre'); if(a) a.addEventListener('click',function(){S={envoye:false,envoi:false,erreur:'',texte:'',signe:''};refaire()});
    var b=document.getElementById('tousEnvoyer');
    if(b) b.addEventListener('click',function(){
      var texte=S.texte.trim();
      if(texte.length<3){S.erreur='Écris ton intention (quelques mots suffisent).';refaire();document.getElementById('tousTexte').focus();return}
      S.envoi=true;S.erreur='';refaire();
      api('etoiles',{method:'POST',prefer:'return=minimal',body:{texte:texte.slice(0,140),signature:S.signe.trim().slice(0,30)||null}})
        .then(function(){S.envoye=true;S.envoi=false;S.texte='';S.signe='';refaire();var h=document.querySelector('.tous-etoile-page h1');if(h)h.focus()})
        .catch(function(err){S.envoi=false;S.erreur=err.status===429||/trop/i.test(err.message)?'Beaucoup de monde en ce moment : réessaie dans une minute.':'L\'envoi n\'a pas marché. Vérifie ta connexion et réessaie.';refaire()});
    });
  }

  /* ---------- branchement dans le site (appelé par app.js) ---------- */
  window.TOUS={
    page:function(id){
      var p=id.split('/');
      if(p[0]==='creer') return creer();
      if(p[0]==='etoile') return etoile();
      if(p[0]==='creche-de-tous'){
        if(donnees.perso===null&&ACTIF&&!chargement){
          chargement=true;
          charger().then(function(){chargement=false;if(/^#creche-de-tous/.test(location.hash)) window.TOUS_rendre()})
            .catch(function(){chargement=false;var e=document.getElementById('tousEtat'); if(e) e.textContent='La crèche n\'a pas pu être chargée. Vérifiez votre connexion puis rechargez la page.'});
        }
        return fresque(p[1]);
      }
      return null;
    },
    brancher:function(id){
      var p=id.split('/');
      if(p[0]==='creche-de-tous') brancherFresque(p[1]);
      if(p[0]==='creer') brancherCreer();
      if(p[0]==='etoile') brancherEtoile();
    },
    personnage:personnage, propre:propre, OPTIONS:OPTIONS
  };
})();
