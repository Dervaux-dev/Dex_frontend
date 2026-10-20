// Lightweight, zero-dependency confetti celebration engine for kid-friendly quiz rewards

export const launchConfetti = (durationMs = 3000) => {
  const canvas = document.createElement('canvas');
  canvas.id = 'dex-confetti-canvas';
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '99999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const colors = [
    '#ff6b6b', '#ff922b', '#fcc419', '#51cf66', 
    '#339af0', '#845ef7', '#ec4899', '#f59e0b'
  ];

  const pieceCount = 120;
  const pieces = [];

  for (let i = 0; i < pieceCount; i++) {
    pieces.push({
      x: width * Math.random(),
      y: height * Math.random() - height,
      size: Math.random() * 10 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: Math.random() * 3 + 2,
      speedX: Math.random() * 4 - 2,
      rotation: Math.random() * 360,
      rotSpeed: Math.random() * 6 - 3,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
    });
  }

  let animationFrameId;
  const startTime = Date.now();

  const render = () => {
    ctx.clearRect(0, 0, width, height);

    const elapsed = Date.now() - startTime;
    const progress = elapsed / durationMs;

    pieces.forEach((p) => {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, 1 - progress);

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    if (elapsed < durationMs) {
      animationFrameId = requestAnimationFrame(render);
    } else {
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
    }
  };

  render();

  return () => {
    cancelAnimationFrame(animationFrameId);
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  };
};
