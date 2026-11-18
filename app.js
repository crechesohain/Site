(function(){
  /* ---------- ciel étoilé et étoile qui monte ---------- */
  var ciel=document.getElementById('ciel');
  for(var k=0;k<70;k++){
    var e=document.createElement('i'), t=Math.random()<.15?2.4:(Math.random()<.5?1.6:1.1);
    e.style.cssText='left:'+(Math.random()*100)+'%;top:'+(Math.random()*100)+'%;width:'+t+'px;height:'+t+'px;--d:'+(2.5+Math.random()*4).toFixed(1)+'s;--r:-'+(Math.random()*6).toFixed(1)+'s';
    if(Math.random()<.3)e.style.background='#f3e6c0';
    ciel.appendChild(e);
  }
  var astre=document.getElementById('astre'), ticking=false;
  function maj(){
    var y=window.scrollY||0, max=Math.max(1,document.documentElement.scrollHeight-innerHeight), f=Math.min(1,y/max);
    astre.style.transform='translateY('+(-y*0.35)+'px) scale('+(1-f*0.45)+') rotate('+(f*20)+'deg)';
    ciel.style.transform='translateY('+(-y*0.06)+'px)';
    ticking=false;
  }
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(maj)}},{passive:true});

  /* ---------- menu ---------- */
  var burger=document.getElementById('burger'), menu=document.getElementById('menu');
  burger.addEventListener('click',function(){var o=menu.classList.toggle('ouvert');burger.setAttribute('aria-expanded',o)});
  menu.addEventListener('click',function(){menu.classList.remove('ouvert');burger.setAttribute('aria-expanded',false)});

  /* ---------- outils ---------- */
  var SEP='<div class="sep"><svg viewBox="0 0 10 10"><path fill="currentColor" d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4Z"/></svg></div>';
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var creches=[], sections=[], site={};
  function trouve(id){return creches.filter(function(x){return x.id===id})[0]}
  function sectionDe(id){return sections.filter(function(s){return s.points.some(function(p){return p.id===id})})[0]}
  function continent(c){
    var t=String(c.pays).toLowerCase();
    if(t.indexOf('afrique')>=0) return 'Afrique';
    if(t.indexOf('amérique')>=0||t.indexOf('amerique')>=0) return 'Amériques';
    if(t.indexOf('asie')>=0) return 'Asie';
    if(t.indexOf('europe')>=0) return 'Europe';
    if(t.indexOf('océanie')>=0) return 'Océanie';
    return 'Origine à préciser';
  }
  function vignette(c,num){
    return '<a class="vignette" href="#'+c.id+'"><img src="/'+c.photo+'" alt="" loading="lazy">'+(num?'<i style="background:var(--or-doux)">'+num+'</i>':'')+'<div><b>'+esc(c.titre)+'</b><span>'+esc(c.pays)+'</span></div></a>';
  }
  function carte(h){return '<article class="carte"><div class="contenu texte">'+h+'</div></article>'}
  function titre(t,sous){
    document.title=t+' · Crèches du monde';
    document.getElementById('numero').textContent=sous||'';
  }

  /* ---------- pages ---------- */
  function accueil(){
    document.title="Crèches du monde · Église Saint-Étienne d'Ohain";
    document.getElementById('numero').textContent='';
    document.getElementById('expo').style.visibility='hidden';
    var h='<div class="hero"><h1>Crèches du monde</h1><div class="lieu">Église Saint-Étienne d\'Ohain</div>';
    if(site.dates) h+='<div class="dates">'+esc(site.dates)+(site.horaires?' · '+esc(site.horaires):'')+'</div>';
    h+='</div>';
    h+='<p class="intro">Plus de trois cents crèches venues des quatre coins du monde racontent la naissance de Jésus avec les couleurs, les matières et les visages de chaque peuple. Scannez le QR code de chaque section, puis touchez une crèche pour découvrir son histoire.</p>';
    h+='<div class="tuiles">';
    h+='<a class="tuile" href="#creches"><b>Les crèches</b><span>Toutes les fiches, par pays et par continent</span></a>';
    h+='<a class="tuile'+(sections.length?'':' bientot')+'" href="#carte"><b>La carte</b><span>Les sections de l\'église</span></a>';
    h+='<a class="tuile" href="#don"><b>Faire un don</b><span>Soutenir l\'église Saint-Étienne</span></a>';
    h+='<a class="tuile" href="#contact"><b>Nous écrire</b><span>Une question, une crèche à proposer</span></a>';
    h+='</div>';
    if(sections.length){
      h+='<div class="titre-bloc">Les sections</div><div class="liste">';
      sections.forEach(function(s){
        h+='<a class="vignette" href="#'+s.id+'"><img src="/'+s.photo+'" alt="" loading="lazy"><div><b>'+esc(s.titre)+'</b><span>'+s.points.length+' crèches</span></div></a>';
      });
      h+='</div>';
    }
    return h;
  }

  var filtre='';
  function liste(){
    titre('Les crèches');
    var conts=[];
    creches.forEach(function(c){var k=continent(c);if(k&&conts.indexOf(k)<0)conts.push(k)});
    conts.sort();
    var h='<h1 class="titre-section">Les crèches</h1><div class="sous-titre">'+creches.length+' fiches</div>';
    h+='<div class="filtres"><button type="button" data-f=""'+(filtre?'':' class="actif"')+'>Toutes</button>';
    conts.forEach(function(k){h+='<button type="button" data-f="'+esc(k)+'"'+(filtre===k?' class="actif"':'')+'>'+esc(k)+'</button>'});
    h+='</div><div class="liste grille">';
    creches.forEach(function(c){ if(!filtre||continent(c)===filtre) h+=vignette(c) });
    return h+'</div>';
  }

  function carteEglise(){
    titre('Carte de l\'église');
    var h='<h1 class="titre-section">La carte de l\'église</h1><div class="sous-titre">Les sections</div>';
    if(!sections.length) return h+carte('<p>Le plan de l\'église et de ses sections sera publié dès l\'installation de l\'exposition.</p>');
    h+='<div class="liste grille">';
    sections.forEach(function(s){
      h+='<a class="vignette" href="#'+s.id+'"><img src="/'+s.photo+'" alt="" loading="lazy"><div><b>'+esc(s.titre)+'</b><span>'+s.points.length+' crèches</span></div></a>';
    });
    return h+'</div><p class="aide" style="margin-top:16px">Le plan détaillé de l\'église arrive bientôt.</p>';
  }

  function section(s){
    titre(s.titre);
    var h='<h1 class="titre-section">'+esc(s.titre)+'</h1><div class="sous-titre">'+esc(s.sousTitre||'Section')+'</div>';
    h+='<div class="visionneuse" id="visio"><div class="plan" id="plan"><img src="/'+s.photo+'" alt="Vue d\'ensemble de la section '+esc(s.titre)+'">';
    var l='';
    s.points.forEach(function(p,i){
      var c=trouve(p.id), n=(c&&c.numero)?c.numero:(i+1);
      if(c){
        h+='<a class="rond" href="#'+c.id+'" style="left:'+p.x+'%;top:'+p.y+'%" aria-label="'+esc(c.titre)+'">'+n+'<span class="bulle">'+esc(c.titre)+'<small>'+esc(String(c.pays).split(' · ')[0])+'</small></span></a>';
        l+=vignette(c,n);
      } else {
        h+='<span class="rond attente" style="left:'+p.x+'%;top:'+p.y+'%" title="Fiche en préparation">'+n+'</span>';
      }
    });
    h+='</div></div><div class="zoom"><button type="button" data-z="-1" aria-label="Dézoomer">−</button><button type="button" data-z="1" aria-label="Zoomer">+</button></div>';
    h+='<p class="aide">Touchez un rond pour ouvrir la fiche de la crèche.</p>';
    return h+'<div class="liste grille">'+l+'</div>';
  }

  function fiche(c){
    titre(c.titre, c.numero?('Crèche n° '+c.numero):'');
    var h='<article class="carte"><img class="photo" src="/'+c.photo+'" alt="'+esc(c.alt)+'"><div class="contenu">';
    h+='<h1>'+esc(c.titre)+'</h1><div class="pays">'+esc(c.pays)+'</div>'+SEP+'<dl class="infos">';
    c.infos.forEach(function(i){h+='<div><dt>'+esc(i[0])+'</dt><dd>'+esc(i[1])+'</dd></div>'});
    h+='</dl>'+SEP;
    c.sections.forEach(function(s,n){
      h+='<section'+(n?' style="margin-top:20px"':'')+'><h2>'+esc(s.titre)+'</h2>';
      s.texte.forEach(function(p){h+='<p>'+esc(p)+'</p>'});
      h+='</section>';
    });
    h+='<div class="encart"><h2>✦ Le saviez-vous&nbsp;?</h2><p>'+esc(c.saviez)+'</p></div>';
    h+='<blockquote>«&nbsp;'+esc(c.verset.texte)+'&nbsp;»<cite>'+esc(c.verset.ref)+'</cite></blockquote>';
    var s=sectionDe(c.id);
    if(s) h+='<a class="lien-section" href="#'+s.id+'">Voir dans sa section · '+esc(s.titre)+'</a>';
    h+='<p class="lien-info">Vous en savez plus sur cette crèche&nbsp;? <a href="#contact">Écrivez-nous</a></p>';
    return h+'</div></article>';
  }

  function don(){
    titre('Faire un don');
    var d=site.don||{};
    var h='<h1>Soutenir l\'église Saint-Étienne</h1>';
    h+='<p>L\'exposition est libre d\'accès. Si elle vous a touché, vous pouvez soutenir l\'église Saint-Étienne d\'Ohain par un don, petit ou grand. Merci&nbsp;!</p>';
    if(d.iban){
      h+='<dl class="encadre-don">';
      if(d.titulaire) h+='<dt>Bénéficiaire</dt><dd>'+esc(d.titulaire)+'</dd>';
      h+='<dt>IBAN</dt><dd id="iban">'+esc(d.iban)+'</dd>';
      if(d.bic) h+='<dt>BIC</dt><dd>'+esc(d.bic)+'</dd>';
      if(d.communication) h+='<dt>Communication</dt><dd>'+esc(d.communication)+'</dd>';
      h+='</dl><button type="button" class="bouton" id="copier">Copier l\'IBAN</button>';
      h+='<p class="note">Sur place, un QR code de virement est affiché à l\'entrée de l\'église : scannez-le avec l\'application de votre banque.</p>';
    } else {
      h+='<p class="note">Les coordonnées bancaires seront publiées très prochainement.</p>';
    }
    return carte(h);
  }

  function contact(){
    titre('Contact');
    var h='<h1>Nous écrire</h1>';
    h+='<p>Une question sur l\'exposition, une crèche que vous aimeriez prêter ou donner, une erreur à signaler sur une fiche&nbsp;? L\'équipe bénévole vous répondra avec plaisir.</p>';
    if(site.formulaire) h+='<p><a class="bouton" href="'+esc(site.formulaire)+'" target="_blank" rel="noopener">Ouvrir le formulaire</a></p>';
    if(site.email) h+='<p>Par e-mail&nbsp;: <a href="mailto:'+esc(site.email)+'">'+esc(site.email)+'</a></p>';
    h+='<p class="note">Vos coordonnées servent uniquement à vous répondre. Voir les <a href="#mentions-legales">mentions légales</a>.</p>';
    return carte(h);
  }

  function aPropos(){
    titre('À propos');
    var h='<h1>À propos de l\'exposition</h1>';
    h+='<p>Chaque année à Noël, l\'église Saint-Étienne d\'Ohain accueille une collection de plus de trois cents crèches venues du monde entier. Sculptées, modelées, tissées ou peintes, elles montrent comment chaque peuple a accueilli la naissance du Christ dans son propre paysage.</p>';
    h+='<h2>Les fiches</h2><p>Chaque fiche présente l\'origine probable de la crèche, sa technique et une anecdote. Les textes ont été rédigés par l\'équipe avec l\'aide d\'un outil d\'intelligence artificielle, puis relus. L\'origine de certaines crèches reste une estimation : si vous en savez plus, <a href="#contact">écrivez-nous</a>.</p>';
    h+='<h2>Qui sommes-nous&nbsp;?</h2><p>Ce site est réalisé et géré bénévolement par un collectif de paroissiens. Ce n\'est pas une publication officielle de la fabrique d\'église.</p>';
    return carte(h);
  }

  function mentions(){
    titre('Mentions légales');
    var h='<h1>Mentions légales</h1>';
    h+='<h2>Éditeur</h2><p>Site réalisé et géré bénévolement par un collectif de paroissiens de l\'église Saint-Étienne d\'Ohain'+(site.responsable?'. Responsable de la publication&nbsp;: '+esc(site.responsable):'')+'.<br>Contact&nbsp;: <a href="mailto:'+esc(site.email)+'">'+esc(site.email)+'</a></p>';
    h+='<h2>Hébergement</h2><p>GitHub Pages, GitHub Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis.<br>Nom de domaine enregistré auprès d\'OVH SAS, 2 rue Kellermann, 59100 Roubaix, France.</p>';
    h+='<h2>Contenus</h2><p>Les textes ont été rédigés par l\'équipe avec l\'aide d\'un outil d\'intelligence artificielle et relus. L\'identification des crèches est donnée à titre indicatif ; toute correction est la bienvenue. Les photos ont été prises par l\'équipe, tous droits réservés. Les citations bibliques sont de courts extraits.</p>';
    h+='<h2>Vie privée</h2><p>Ce site ne dépose aucun cookie, n\'utilise aucun outil de statistiques ou de suivi, et ses polices de caractères sont hébergées sur le site lui-même. L\'hébergeur conserve des journaux techniques (dont l\'adresse IP des visiteurs) pour assurer la sécurité du service.</p>';
    h+='<p>Si vous nous écrivez, vos nom, adresse e-mail et message servent uniquement à vous répondre. Ils sont lus par les bénévoles de l\'équipe, conservés dans un compte Google de l\'exposition, et supprimés sur simple demande ou au plus tard un an après l\'exposition. Vous pouvez demander l\'accès à vos données, leur correction ou leur suppression à l\'adresse ci-dessus.</p>';
    return carte(h);
  }

  /* ---------- zoom de la visionneuse ---------- */
  var zoom=1, base=0;
  function taille(){
    var plan=document.getElementById('plan'), v=document.getElementById('visio'); if(!plan) return;
    var img=plan.querySelector('img'); if(!img.naturalWidth) return;
    base=Math.min(v.clientWidth, window.innerHeight*0.78*img.naturalWidth/img.naturalHeight);
    plan.style.width=(base*zoom)+'px';
  }
  addEventListener('resize',taille);
  function brancher(){
    var plan=document.getElementById('plan');
    if(plan){
      zoom=1; var img=plan.querySelector('img');
      if(img.complete) taille(); else img.addEventListener('load',taille);
      document.querySelectorAll('.zoom button').forEach(function(b){
        b.addEventListener('click',function(){
          var v=document.getElementById('visio'), cx=(v.scrollLeft+v.clientWidth/2)/plan.offsetWidth, cy=(v.scrollTop+v.clientHeight/2)/plan.offsetHeight;
          zoom=Math.max(1,Math.min(3,zoom+Number(b.dataset.z)*0.75));
          plan.style.width=(base*zoom)+'px';
          setTimeout(function(){v.scrollLeft=cx*plan.offsetWidth-v.clientWidth/2; v.scrollTop=cy*plan.offsetHeight-v.clientHeight/2;},260);
        });
      });
    }
    document.querySelectorAll('.filtres button').forEach(function(b){
      b.addEventListener('click',function(){filtre=b.dataset.f;rendre(false)});
    });
    var cp=document.getElementById('copier');
    if(cp) cp.addEventListener('click',function(){
      var t=document.getElementById('iban').textContent;
      (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){cp.textContent='IBAN copié'},function(){cp.textContent='Sélectionnez l\'IBAN pour le copier'});
    });
  }

  /* ---------- routeur ---------- */
  var pages={'creches':liste,'carte':carteEglise,'don':don,'contact':contact,'a-propos':aPropos,'mentions-legales':mentions};
  function rendre(remonter){
    var id=location.hash.replace('#',''), c=trouve(id), s=sections.filter(function(x){return x.id===id})[0];
    document.getElementById('expo').style.visibility='';
    document.querySelector('.page').classList.toggle('large',!!s||id==='creches'||id==='carte');
    document.getElementById('vue').innerHTML=c?fiche(c):(s?section(s):(pages[id]?pages[id]():accueil()));
    document.querySelectorAll('#menu a').forEach(function(a){a.classList.toggle('actif',a.getAttribute('href')==='/#'+id||(id===''&&a.getAttribute('href')==='/#'))});
    brancher();
    if(remonter!==false) window.scrollTo(0,0);
    maj();
  }
  function json(u,def){return fetch(u,{cache:'no-cache'}).then(function(r){return r.ok?r.json():def}).catch(function(){return def})}
  Promise.all([json('/creches.json',[]),json('/sections.json',[]),json('/site.json',{})]).then(function(d){
    creches=d[0];sections=d[1];site=d[2];rendre();
  });
  addEventListener('hashchange',function(){rendre()});
})();
