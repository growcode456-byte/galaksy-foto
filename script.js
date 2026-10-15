// UBAH tanggal ini sesuai tanggal jadian kalian: TAHUN, BULAN (0=Januari), TANGGAL
const anniversaryDate = new Date(2026, 3, 28);

const canvas = document.getElementById('space');
const ctx = canvas.getContext('2d');
let width = 0, height = 0, stars = [], rafId;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  width = window.innerWidth; height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(150, Math.floor(width * height / 6500));
  stars = Array.from({length: count}, () => ({
    x: Math.random() * width, y: Math.random() * height,
    r: Math.random() * 1.5 + .25, a: Math.random() * .7 + .2,
    speed: Math.random() * .012 + .003, phase: Math.random() * Math.PI * 2
  }));
}
function drawStars(time = 0) {
  ctx.clearRect(0, 0, width, height);
  for (const s of stars) {
    const pulse = reducedMotion ? 1 : .65 + Math.sin(time * s.speed + s.phase) * .35;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(240,225,255,${s.a * pulse})`;
    ctx.fill();
  }
  if (!document.hidden && !reducedMotion) rafId = requestAnimationFrame(drawStars);
}
resizeCanvas();
drawStars();
window.addEventListener('resize', () => { resizeCanvas(); if (!reducedMotion) { cancelAnimationFrame(rafId); rafId = requestAnimationFrame(drawStars); } });

// Parallax lembut pada galaksi, juga merespons sentuhan.
const stage = document.getElementById('galaxyStage');
function moveGalaxy(x, y) {
  if (reducedMotion) return;
  const rx = (y / window.innerHeight - .5) * -8;
  const ry = (x / window.innerWidth - .5) * 10;
  stage.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
}
window.addEventListener('pointermove', e => moveGalaxy(e.clientX, e.clientY), {passive:true});
window.addEventListener('pointerleave', () => { stage.style.transform = ''; });

// Tombol eksplorasi: zoom ke galaksi lalu kembali halus.
document.getElementById('exploreBtn').addEventListener('click', () => {
  stage.scrollIntoView({behavior: reducedMotion ? 'auto' : 'smooth', block:'center'});
  if (!reducedMotion) {
    stage.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],
      {duration:1100,easing:'ease-in-out'});
  }
  for (let i=0;i<12;i++) makeHeart();
});

function makeHeart() {
  const heart = document.createElement('span');
  heart.textContent = Math.random() > .5 ? '♥' : '✦';
  Object.assign(heart.style, {
    position:'fixed', left:(Math.random()*90+5)+'vw', bottom:'-25px',
    color:Math.random()>.5?'#ff9bd7':'#c5a7ff', fontSize:(12+Math.random()*18)+'px',
    zIndex:9, pointerEvents:'none', textShadow:'0 0 12px currentColor'
  });
  document.body.appendChild(heart);
  const anim = heart.animate([{transform:'translateY(0) rotate(0)',opacity:0},
    {opacity:1,offset:.15},{transform:`translateY(-${window.innerHeight+100}px) rotate(${Math.random()*100-50}deg)`,opacity:0}],
    {duration:2600+Math.random()*1600,easing:'ease-out'});
  anim.onfinish = () => heart.remove();
}

// Surat yang bisa dibuka dan ditutup.
const letterBtn = document.getElementById('letterBtn');
const letterContent = document.getElementById('letterContent');
letterBtn.addEventListener('click', () => {
  const opening = letterContent.hidden;
  letterContent.hidden = !opening;
  letterBtn.setAttribute('aria-expanded', String(opening));
  document.getElementById('letterButtonText').textContent = opening ? 'Tutup surat kecil ini' : 'Buka surat kecil ini';
  if (opening) for (let i=0;i<8;i++) makeHeart();
});

// Galeri foto: klik kartu untuk memperbesar.
const lightbox = document.getElementById('lightbox');
const lightboxImage = document.getElementById('lightboxImage');
document.querySelectorAll('.photo-card').forEach(card => {
  card.addEventListener('click', () => {
    const img = card.querySelector('img');
    if (!img || img.style.display === 'none' || !img.complete || img.naturalWidth === 0) return;
    lightboxImage.src = img.src;
    lightbox.hidden = false;
  });
});
function closeLightbox(){lightbox.hidden = true;lightboxImage.src='';}
document.getElementById('closeLightbox').addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => {if(e.target === lightbox) closeLightbox();});
document.addEventListener('keydown', e => {if(e.key === 'Escape') closeLightbox();});

// Penghitung hari jadian.
const now = new Date();
const days = Math.max(0, Math.floor((new Date(now.getFullYear(),now.getMonth(),now.getDate()) - new Date(anniversaryDate.getFullYear(),anniversaryDate.getMonth(),anniversaryDate.getDate())) / 86400000));
document.getElementById('daysTogether').textContent = days.toLocaleString('id-ID');

// Musik hanya diputar setelah pengguna menekan tombol.
const music = document.getElementById('backgroundMusic');
const musicToggle = document.getElementById('musicToggle');
let musicPlaying = false;
musicToggle.addEventListener('click', async () => {
  if (!musicPlaying) {
    try {
      await music.play();
      musicPlaying = true;
      musicToggle.textContent = '♫ Musik: ON';
    } catch (err) {
      musicToggle.textContent = 'Tambahkan assets/music.mp3';
    }
  } else {
    music.pause();
    musicPlaying = false;
    musicToggle.textContent = '♫ Musik';
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && rafId) cancelAnimationFrame(rafId);
  else if (!document.hidden && !reducedMotion) {cancelAnimationFrame(rafId);rafId=requestAnimationFrame(drawStars);}
});
