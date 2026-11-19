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


var ETOILE = {
  taille: 120,              // côté de #astre en px (cf. CSS)
  course: 0.9,              // fraction d'écran de défilement pour finir l'arc (ordinateur)
  courseTel: 0.55,          // idem sur téléphone : elle libère vite le texte
  reduit: window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches
};
if (window.matchMedia) {
  var mqEtoile = matchMedia('(prefers-reduced-motion: reduce)');
  (mqEtoile.addEventListener ? mqEtoile.addEventListener('change', function (e) { ETOILE.reduit = e.matches; })
                             : mqEtoile.addListener(function (e) { ETOILE.reduit = e.matches; }));
}

function majEtoile(y, max) {
  var astre = document.getElementById('astre');
  if (!astre) return;
  var W = window.innerWidth, H = window.innerHeight;
  var tel = W < 720;

  /* Départ : centre, en haut (identique au rendu actuel : top 6vh) */
  var x0 = W / 2, y0 = H * 0.06 + ETOILE.taille / 2;

  /* Arrivée : marge droite, mesurée sur le conteneur .page */
  var x1, y1, s1;
  if (tel) {
    x1 = W - 18;                              // coin haut droit : à moitié dans
                                              // la gouttière de 18 px, à moitié
                                              // derrière les cartes
    y1 = 96;                                  // sous la barre du haut
    s1 = 0.34;                                // ≈ 40 px
  } else {
    var page = document.querySelector('.page');
    var r = page ? page.getBoundingClientRect() : { right: W * 0.7 };
    var contenu = Math.min(r.right, W);       // bord droit du contenu
    // .page a 18 px de padding : le texte s'arrête un peu avant r.right
    var marge = W - contenu;
    if (marge >= 100) {
      x1 = contenu + marge / 2;               // centre de la marge
      s1 = Math.max(0.42, Math.min(0.62, marge / 520));
    } else {
      x1 = W - 52;                            // marge étroite : contre le bord
      s1 = 0.4;
    }
    y1 = Math.max(150, H * 0.22);
  }

  /* Progression : 0 → 1 sur ~un écran de défilement, adoucie.
     Sur une page courte (accueil sur téléphone…), l'arc se termine
     avant la fin du défilement possible : l'étoile ne reste jamais
     « à mi-chemin » au-dessus du texte. */
  var course = Math.min(H * (tel ? ETOILE.courseTel : ETOILE.course), Math.max(H * 0.2, max * 0.6));
  var p = Math.min(1, Math.max(0, y / course));
  if (ETOILE.reduit) p = y > 24 ? 1 : 0;
  var e = p * p * (3 - 2 * p);                // smoothstep : départ et arrivée doux

  /* Arc : courbe de Bézier quadratique ; le point de contrôle est
     au-dessus de la ligne départ→arrivée, l'étoile monte puis se pose. */
  var cx = x0 + (x1 - x0) * 0.6;
  var cy = Math.min(y0, y1) - (tel ? 20 : 70);
  var u = 1 - e;
  var x = u * u * x0 + 2 * u * e * cx + e * e * x1;
  var yy = u * u * y0 + 2 * u * e * cy + e * e * y1;

  /* Fin de page : elle descend un peu vers les mages (derniers 15 %) */
  var f = Math.min(1, Math.max(0, y / Math.max(1, max)));
  var fin = ETOILE.reduit ? 0 : Math.max(0, (f - 0.85) / 0.15);
  if (!tel) yy += fin * H * 0.12;

  var s = 1 + (s1 - 1) * e;
  var rot = e * 14 + fin * 6;                  // légère inclinaison : elle « file »

  astre.style.transform =
    'translate3d(' + (x - ETOILE.taille / 2).toFixed(1) + 'px,' +
    (yy - ETOILE.taille / 2).toFixed(1) + 'px,0) scale(' + s.toFixed(3) +
    ') rotate(' + rot.toFixed(1) + 'deg)';
  /* sur téléphone, on l'atténue un peu une fois posée : décor, pas signal */
  astre.style.opacity = (0.9 - (tel ? 0.2 : 0.05) * e).toFixed(2);
  astre.classList.add('guidee');
}

  function maj(){
    var y=window.scrollY||0, max=Math.max(1,document.documentElement.scrollHeight-innerHeight), f=Math.min(1,y/max);
    majEtoile(y, max);
    ciel.style.transform='translateY('+(-y*0.06)+'px)';
    ticking=false;
  }
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(maj)}},{passive:true});
  addEventListener('resize',function(){requestAnimationFrame(maj)});

  /* ---------- menu (haut sur ordinateur, onglets en bas sur téléphone) ---------- */
  /* plus de bouton « burger » : le même menu est toujours visible */

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
    return '<a class="vignette" href="#'+c.id+'"><img src="/mini/'+c.photo+'" alt="" width="92" height="92" decoding="async">'+(num?'<i>'+num+'</i>':'')+'<div><b>'+esc(c.titre)+'</b><span>'+esc(c.pays)+'</span></div></a>';
  }
  function carte(h){return '<article class="carte"><div class="contenu texte">'+h+'</div></article>'}
  function titre(t,sous){
    document.title=t+' · Crèches du monde';
    document.getElementById('numero').textContent=sous||'';
  }

  /* témoignage de la créatrice / du créateur de l'exposition (site.json → "temoignage"), masqué tant qu'il est vide */
  function temoignage(){
    var t=site.temoignage||{}, video=/\.(mp4|webm|m4v|mov)(\?|$)/i.test(t.video||'')?t.video:'';
    var estVideo=(t.type==='video'||(!t.type&&video))&&video;
    if(!t.texte&&!estVideo) return '';
    var h='<figure class="temoignage carte">';
    if(estVideo) h+='<video class="temoignage-video" src="'+esc(video)+'"'+(t.photo?' poster="'+esc(t.photo)+'"':'')+' controls playsinline preload="none"></video>';
    else if(t.photo) h+='<img class="temoignage-photo" src="'+esc(t.photo)+'" alt="'+esc(t.auteur?'Portrait de '+t.auteur:'')+'" width="120" height="120">';
    h+='<div class="contenu">';
    if(t.texte) h+='<blockquote>«&nbsp;'+esc(t.texte)+'&nbsp;»</blockquote>';
    if(t.auteur) h+='<figcaption>'+esc(t.auteur)+'</figcaption>';
    return h+'</div></figure>';
  }
  /* bouton de retour : revient à la page précédente du site si c'est la bonne, sinon suit le lien */
  var precedent=null, courant=null;
  function retour(cible,libelle){
    return '<a class="retour" href="#'+cible+'" data-retour="'+esc(cible)+'"><span aria-hidden="true">←</span> '+esc(libelle)+'</a>';
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
    h+=temoignage();
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
    h+='</div>';
    if(!creches.length) h+=carte('<p>Les fiches des crèches n\'ont pas pu être chargées. Vérifiez votre connexion puis rechargez la page.</p>');
    return h;
  }

  function carteEglise(){
    titre('Carte de l\'église');
    var h='<h1 class="titre-section">La carte de l\'église</h1><div class="sous-titre">Touchez une section</div>';
    h+='<div class="carte-eglise" id="carteEglise" aria-busy="true"></div>';
    h+='<p class="carte-info" id="carteInfo" aria-live="polite">Choisissez une section dorée pour voir ses crèches.</p>';
    h+='<p class="carte-legende"><span class="pt ouverte"></span>section en ligne <span class="pt bientot"></span>bientôt en ligne</p>';
    var autres=sections.filter(function(s){return !/^s-\d+$/.test(s.id)});
    if(autres.length){
      h+='<div class="sous-titre" style="margin-top:22px">Autres ensembles</div><div class="liste grille">';
      autres.forEach(function(s){h+='<a class="vignette" href="#'+s.id+'"><img src="/mini/'+s.photo+'" alt="" width="92" height="92" decoding="async"><div><b>'+esc(s.titre)+'</b><span>'+s.points.length+' crèches</span></div></a>'});
      h+='</div>';
    }
    return h;
  }
  var svgCarte=null;
  function brancherCarte(){
    var box=document.getElementById('carteEglise'); if(!box) return;
    function poser(txt){
      if(!document.body.contains(box)) return;
      box.innerHTML=txt; box.removeAttribute('aria-busy');
      var info=document.getElementById('carteInfo');
      box.querySelectorAll('.zone').forEach(function(z){
        var id=z.getAttribute('data-s'), s=sections.filter(function(x){return x.id===id})[0], num=id.slice(2);
        z.classList.add(s?'ouverte':'bientot');
        var lib=s?('Section '+num+' – '+s.titre+' ('+s.points.length+' crèches)'):('Section '+num+' – bientôt en ligne');
        z.setAttribute('aria-label',lib); var t=z.querySelector('title'); if(t) t.textContent=lib;
        z.addEventListener('click',function(e){
          if(s) return;
          e.preventDefault();
          box.querySelectorAll('.zone.choisie').forEach(function(x){x.classList.remove('choisie')});
          z.classList.add('choisie');
          info.textContent='Section '+num+' : la photo et les fiches de cette section arrivent bientôt.';
        });
      });
    }
    if(svgCarte) poser(svgCarte);
    else fetch('/carte.svg',{cache:'no-cache'}).then(function(r){return r.text()}).then(function(t){svgCarte=t;poser(t)}).catch(function(){box.innerHTML='<p class="aide">Le plan n\'a pas pu être chargé.</p>'});
  }

  function section(s){
    titre(s.titre);
    var h=retour('carte','Carte de l\'église');
    h+='<h1 class="titre-section">'+esc(s.titre)+'</h1><div class="sous-titre">'+esc(s.sousTitre||'Section')+'</div>';
    h+='<div class="visionneuse" id="visio"><div class="plan" id="plan"><img src="/'+s.photo+'" alt="Vue d\'ensemble de la section '+esc(s.titre)+'">';
    var l='';
    s.points.forEach(function(p,i){
      var c=trouve(p.id), n=(c&&c.numero)?c.numero:(i+1);
      if(c){
        h+='<a class="rond" href="#'+c.id+'" style="left:'+p.x+'%;top:'+p.y+'%" aria-label="'+n+' – '+esc(c.titre)+'">'+n+'<span class="bulle" aria-hidden="true">'+esc(c.titre)+'<small>'+esc(String(c.pays).split(' · ')[0])+'</small></span></a>';
        l+=vignette(c,n);
      } else {
        h+='<span class="rond attente" style="left:'+p.x+'%;top:'+p.y+'%" title="Fiche en préparation" role="img" aria-label="'+n+' – fiche en préparation">'+n+'</span>';
      }
    });
    h+='</div></div><div class="zoom"><button type="button" class="voir-tout" data-z="reset">Voir toute la photo</button></div>';
    h+='<p class="aide">Touchez un rond pour ouvrir la fiche. Pincez la photo pour zoomer'+(matchMedia('(hover:hover)').matches?' (sur ordinateur : molette pour zoomer, puis faites glisser)':'')+'.</p>';
    return h+'<div class="liste grille">'+l+'</div>';
  }

  function fiche(c){
    titre(c.titre, c.numero?('Crèche n° '+c.numero):'');
    var sp=sectionDe(c.id), h;
    if(sp&&precedent===sp.id) h=retour(sp.id,'Retour à la section');
    else h=retour('creches','Toutes les crèches');
    h+='<article class="carte"><img class="photo" src="/'+c.photo+'" alt="'+esc(c.alt)+'" width="1200" height="1260"><div class="contenu">';
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
    if(d.payconiq){
      h+='<div class="payconiq"><h2>Avec Payconiq</h2>';
      h+='<a class="bouton" href="'+esc(d.payconiq)+'" rel="noopener">Ouvrir Payconiq</a>';
      h+='<p class="note sur-mobile">Le bouton ouvre l\'application Payconiq ou celle de votre banque&nbsp;: choisissez le montant, c\'est tout.</p>';
      h+='<img class="qr-payconiq" src="payconiq-qr.svg" width="200" height="200" alt="QR code Payconiq de l\'église Saint-Étienne d\'Ohain">';
      h+='<p class="note sur-ordi">Scannez ce code avec l\'application Payconiq ou celle de votre banque. Le même code est affiché dans l\'église.</p></div>';
    }
    if(d.iban){
      if(d.payconiq) h+='<h2>Par virement</h2>';
      h+='<dl class="encadre-don">';
      if(d.titulaire) h+='<dt>Bénéficiaire</dt><dd>'+esc(d.titulaire)+'</dd>';
      h+='<dt>IBAN</dt><dd id="iban">'+esc(d.iban)+'</dd>';
      if(d.bic) h+='<dt>BIC</dt><dd>'+esc(d.bic)+'</dd>';
      if(d.communication) h+='<dt>Communication</dt><dd>'+esc(d.communication)+'</dd>';
      h+='</dl><button type="button" class="bouton" id="copier">Copier l\'IBAN</button>';
      h+='<p class="note">Sur place, un QR code de virement est affiché à l\'entrée de l\'église : scannez-le avec l\'application de votre banque.</p>';
    } else if(!d.payconiq){
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

  function introuvable(id){
    if(/^s-/i.test(id)){
      titre('Section en préparation');
      return retour('carte','Carte de l\'église')+carte('<h1>Section en préparation</h1><p>Les crèches de cette section ('+esc(id.toUpperCase())+') seront bientôt en ligne. Revenez dans quelques jours&nbsp;!</p><p><a class="bouton" href="#carte">Voir la carte de l\'église</a></p>');
    }
    var estFiche=/^C-/i.test(id);
    titre(estFiche?'Fiche en préparation':'Page introuvable');
    var h=retour('creches','Toutes les crèches');
    return h+carte('<h1>'+(estFiche?'Fiche en préparation':'Page introuvable')+'</h1><p>'+(estFiche?'La fiche de cette crèche ('+esc(id)+') n\'est pas encore publiée. Revenez bientôt&nbsp;!':'Cette page n\'existe pas ou plus.')+'</p><p><a class="bouton" href="#creches">Voir toutes les crèches</a></p>');
  }

  /* ---------- visionneuse de section : zoom au pincement, glisser, double-clic ---------- */
  var V=null;
  function visionneuse(){
    var visio=document.getElementById('visio'), plan=document.getElementById('plan'); V=null;
    if(!visio) return;
    var img=plan.querySelector('img');
    var st={s:1,x:0,y:0,w:0,h:0}, MAX=4, pts={}, geste=null, bouge=false, dernierTap=0;
    function dims(){
      if(!img.naturalWidth) return;
      var dispo=visio.parentNode.clientWidth, ratio=img.naturalHeight/img.naturalWidth;
      var w=Math.min(dispo, (window.innerHeight*0.78)/ratio);
      st.w=Math.round(w); st.h=Math.round(w*ratio);
      visio.style.width=st.w+'px'; visio.style.height=st.h+'px';
      plan.style.width=st.w+'px'; plan.style.height=st.h+'px';
      appliquer(false);
    }
    function borner(){
      st.s=Math.max(1,Math.min(MAX,st.s));
      st.x=Math.min(0,Math.max(st.w-st.w*st.s,st.x));
      st.y=Math.min(0,Math.max(st.h-st.h*st.s,st.y));
    }
    function appliquer(anime){
      borner();
      plan.style.transition=anime?'transform .25s ease':'none';
      plan.style.transform='translate('+st.x+'px,'+st.y+'px) scale('+st.s+')';
      plan.style.setProperty('--inv',(1/st.s).toFixed(4));
      visio.classList.toggle('zoome',st.s>1.01);
      visio.style.touchAction=st.s>1.01?'none':'pan-y';
    }
    function zoomer(f,cx,cy,anime){ // cx,cy : point fixe, en px dans la visionneuse
      var n=Math.max(1,Math.min(MAX,st.s*f)), k=n/st.s;
      st.x=cx-(cx-st.x)*k; st.y=cy-(cy-st.y)*k; st.s=n; appliquer(anime);
    }
    function local(e){var r=visio.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top}}
    function liste(){return Object.keys(pts).map(function(k){return pts[k]})}
    visio.addEventListener('pointerdown',function(e){
      pts[e.pointerId]=local(e); bouge=false;
      var l=liste();
      if(l.length===2){
        var d=Math.hypot(l[0].x-l[1].x,l[0].y-l[1].y);
        geste={type:'pince',d:d,s:st.s,cx:(l[0].x+l[1].x)/2,cy:(l[0].y+l[1].y)/2,x:st.x,y:st.y};
      } else if(l.length===1){
        geste={type:'glisse',px:l[0].x,py:l[0].y,x:st.x,y:st.y};
      }
    });
    visio.addEventListener('pointermove',function(e){
      if(!pts[e.pointerId]||!geste) return;
      pts[e.pointerId]=local(e);
      var l=liste();
      if(geste.type==='pince'&&l.length===2){
        bouge=true;
        var d=Math.hypot(l[0].x-l[1].x,l[0].y-l[1].y), cx=(l[0].x+l[1].x)/2, cy=(l[0].y+l[1].y)/2;
        var n=Math.max(1,Math.min(MAX,geste.s*d/geste.d)), k=n/geste.s;
        st.s=n; st.x=cx-(geste.cx-geste.x)*k; st.y=cy-(geste.cy-geste.y)*k; appliquer(false);
      } else if(geste.type==='glisse'&&l.length===1&&st.s>1.01){
        var dx=l[0].x-geste.px, dy=l[0].y-geste.py;
        if(Math.abs(dx)+Math.abs(dy)>6){bouge=true; if(visio.setPointerCapture) try{visio.setPointerCapture(e.pointerId)}catch(_){}}
        if(bouge){st.x=geste.x+dx; st.y=geste.y+dy; appliquer(false)}
      }
    });
    function fin(e){
      delete pts[e.pointerId];
      var l=liste();
      if(l.length===1) geste={type:'glisse',px:l[0].x,py:l[0].y,x:st.x,y:st.y}; else if(!l.length) geste=null;
    }
    visio.addEventListener('pointerup',function(e){
      // double tap au doigt : zoom avant / retour
      if(e.pointerType==='touch'&&!bouge&&liste().length===1){
        var t=Date.now(), p=local(e);
        if(t-dernierTap<300&&!(e.target.closest&&e.target.closest('.rond'))){ if(st.s>1.01){st.s=1;st.x=0;st.y=0;appliquer(true)} else zoomer(2.5,p.x,p.y,true); dernierTap=0 }
        else dernierTap=t;
      }
      fin(e);
    });
    visio.addEventListener('pointercancel',fin);
    visio.addEventListener('pointerleave',function(e){if(e.pointerType==='mouse')fin(e)});
    // un glissement ne doit pas ouvrir la fiche sous le doigt
    visio.addEventListener('click',function(e){if(bouge){e.preventDefault();e.stopPropagation();bouge=false}},true);
    visio.addEventListener('dblclick',function(e){
      if(e.target.closest&&e.target.closest('.rond')) return;
      var p=local(e); if(st.s>1.01){st.s=1;st.x=0;st.y=0;appliquer(true)} else zoomer(2.5,p.x,p.y,true);
    });
    // molette : la page défile normalement ; seul le pincement du pavé tactile (ctrl + molette) zoome
    // molette (ordinateur) : vers le haut = zoom avant ; vers le bas = zoom arrière,
    // puis, une fois revenu à la vue d'ensemble, la page reprend son défilement normal
    visio.addEventListener('wheel',function(e){
      var dy=e.deltaMode===1?e.deltaY*16:e.deltaY;
      if(!e.ctrlKey&&dy>0&&st.s<=1.01) return;
      e.preventDefault(); var p=local(e);
      zoomer(Math.exp(-Math.max(-120,Math.min(120,dy))*(e.ctrlKey?0.01:0.0025)),p.x,p.y,false);
    },{passive:false});
    document.querySelectorAll('.zoom button').forEach(function(b){
      b.addEventListener('click',function(){
        if(b.dataset.z==='reset'){st.s=1;st.x=0;st.y=0;appliquer(true);return}
        zoomer(b.dataset.z==='in'?1.6:1/1.6,st.w/2,st.h/2,true);
      });
    });
    if(img.complete) dims(); else img.addEventListener('load',dims);
    V={dims:dims};
  }
  addEventListener('resize',function(){if(V)V.dims()});
  function brancher(){
    visionneuse();
    brancherCarte();
    document.querySelectorAll('[data-retour]').forEach(function(a){
      a.addEventListener('click',function(e){
        if(precedent===a.dataset.retour||(precedent===''&&a.dataset.retour==='')){e.preventDefault();history.back()}
      });
    });
    fondu();
    document.querySelectorAll('.filtres button').forEach(function(b){
      b.addEventListener('click',function(){filtre=b.dataset.f;rendre(false)});
    });
    var cp=document.getElementById('copier');
    if(cp) cp.addEventListener('click',function(){
      var t=document.getElementById('iban').textContent;
      (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){cp.textContent='IBAN copié'},function(){cp.textContent='Sélectionnez l\'IBAN pour le copier'});
    });
  }

  /* ---------- galerie : les vignettes apparaissent toutes ensemble ---------- */
  var prechargees=[];
  function precharger(){
    creches.forEach(function(c){var i=new Image();i.decoding='async';i.src='/mini/'+c.photo;prechargees.push(i)});
    sections.forEach(function(s){var i=new Image();i.src='/mini/'+s.photo;prechargees.push(i)});
  }
  function fondu(){
    document.querySelectorAll('.liste').forEach(function(l){
      var imgs=[].slice.call(l.querySelectorAll('img'));
      if(!imgs.length||imgs.every(function(i){return i.complete})) return;
      l.classList.add('attente');
      var fini=false;
      function montrer(){if(!fini){fini=true;l.classList.remove('attente')}}
      Promise.all(imgs.map(function(i){return i.complete?0:new Promise(function(ok){i.addEventListener('load',ok);i.addEventListener('error',ok)})})).then(montrer);
      setTimeout(montrer,2500); /* filet de sécurité si le réseau est lent */
    });
  }

  /* ---------- routeur ---------- */
  var pages={'creches':liste,'carte':carteEglise,'don':don,'contact':contact,'a-propos':aPropos,'mentions-legales':mentions};
  function rendre(remonter){
    var id=location.hash.replace('#',''), c=trouve(id), s=sections.filter(function(x){return x.id===id})[0];
    document.getElementById('expo').style.visibility='';
    document.querySelector('.page').classList.toggle('large',!!s||id==='creches'||id==='carte');
    var vue=document.getElementById('vue');
    if(remonter!==false){precedent=courant;courant=id}
    vue.innerHTML=c?fiche(c):(s?section(s):(pages[id]?pages[id]():(/^(C-|s-)/i.test(id)?introuvable(id):accueil())));
    /* onglet actif : la fiche appartient aux « crèches », une section à la « carte » */
    var rub=c?'creches':((s||/^s-/i.test(id))?'carte':id);
    document.querySelectorAll('#menu a').forEach(function(a){
      var on=a.getAttribute('href')==='/#'+rub||(rub===''&&a.getAttribute('href')==='/#');
      a.classList.toggle('actif',on);
      if(on) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
    });
    brancher();
    if(remonter!==false){
      var y=history.state&&typeof history.state.y==='number'?history.state.y:0;
      window.scrollTo(0,y);
      if(y) requestAnimationFrame(function(){window.scrollTo(0,y)});
      if(premier) premier=false; else vue.focus({preventScroll:true});
    }
    maj();
  }
  var premier=true;
  /* mémorise la position de défilement de chaque page pour la retrouver au retour */
  var memo;
  function memoriser(){try{history.replaceState({y:window.scrollY},'')}catch(e){}}
  addEventListener('scroll',function(){clearTimeout(memo);memo=setTimeout(memoriser,200)},{passive:true});
  document.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('a[href^="#"],a[href^="/#"]'))memoriser()},true);
  function json(u,def){return fetch(u,{cache:'no-cache'}).then(function(r){return r.ok?r.json():def}).catch(function(){return def})}
  Promise.all([json('/creches.json',[]),json('/sections.json',[]),json('/site.json',{})]).then(function(d){
    creches=d[0];sections=d[1];site=d[2];rendre();
    (window.requestIdleCallback||setTimeout)(precharger);
  });
  addEventListener('hashchange',function(){rendre()});
})();
