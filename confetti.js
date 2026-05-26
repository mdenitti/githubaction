/* ==========================================
   CI/CD Simulator - Confetti Particle Effect
   ========================================== */

export function confetti(options = {}) {
  const particleCount = options.particleCount || 60;
  const spread = options.spread || 60;
  const origin = options.origin || { y: 0.5 };
  
  // Find or create canvas
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
  }
  
  const ctx = canvas.getContext('2d');
  resizeCanvas();
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas, { passive: true });
  
  const colors = ['#38bdf8', '#8b5cf6', '#2ea44f', '#e3b341', '#f85149', '#ec4899', '#10b981'];
  const particles = [];
  
  // Spawn particles
  const startX = canvas.width / 2;
  const startY = canvas.height * origin.y;
  
  for (let i = 0; i < particleCount; i++) {
    const angle = (Math.random() - 0.5) * (spread * Math.PI / 180) - Math.PI / 2;
    const velocity = 8 + Math.random() * 10;
    
    particles.push({
      x: startX,
      y: startY,
      size: 4 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }
  
  let animationFrameId;
  
  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let active = false;
    
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // gravity
      p.vx *= 0.98; // air resistance
      p.rotation += p.rotationSpeed;
      
      // Fade out as it falls
      if (p.vy > 2) {
        p.opacity -= 0.015;
      }
      
      if (p.opacity > 0 && p.y < canvas.height && p.x > 0 && p.x < canvas.width) {
        active = true;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        
        // Draw confetti shape (rectangle)
        ctx.fillRect(-p.size / 2, -p.size, p.size, p.size * 1.5);
        ctx.restore();
      }
    });
    
    if (active) {
      animationFrameId = requestAnimationFrame(update);
    } else {
      window.removeEventListener('resize', resizeCanvas);
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  }
  
  update();
}
