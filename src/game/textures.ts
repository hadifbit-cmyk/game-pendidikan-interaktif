import * as THREE from 'three';

export function createGrassTexture(anisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#23522b');
  grad.addColorStop(0.5, '#2b6635');
  grad.addColorStop(1, '#1f4926');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 64; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 18 + Math.random() * 44;
    const patch = ctx.createRadialGradient(x, y, 2, x, y, r);
    patch.addColorStop(0, i % 2 === 0 ? 'rgba(74, 155, 86, 0.22)' : 'rgba(14, 42, 20, 0.24)');
    patch.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = patch;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle =
      Math.random() > 0.65
        ? 'rgba(134, 214, 128, 0.18)'
        : Math.random() > 0.35
          ? 'rgba(58, 124, 51, 0.26)'
          : 'rgba(17, 50, 23, 0.28)';
    ctx.fillRect(x, y, 2, 4 + Math.random() * 5);
  }

  // Clover & wildflower specks
  for (let i = 0; i < 110; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(253, 224, 71, 0.45)' : 'rgba(167, 243, 208, 0.48)';
    ctx.fillRect(x, y, 2.5, 2.5);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(22, 22);
  tex.anisotropy = anisotropy;
  return tex;
}

export function createLaneStoneTexture(anisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#3b3733';
  ctx.fillRect(0, 0, 512, 512);

  const step = 64;
  for (let y = 0; y < 512; y += step) {
    const offset = (y / step) % 2 === 0 ? 0 : step / 2;
    for (let x = -step; x < 512 + step; x += step) {
      const shade = 84 + Math.floor(Math.random() * 28);
      ctx.fillStyle = `rgb(${shade + 8}, ${shade + 2}, ${shade - 8})`;
      ctx.beginPath();
      ctx.roundRect(x + offset + 3, y + 3, step - 6, step - 6, 8);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 245, 220, 0.14)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = Math.random() > 0.72 ? 'rgba(63, 98, 66, 0.2)' : 'rgba(15, 23, 42, 0.22)';
    ctx.fillRect(x, y, 2, 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 24);
  tex.anisotropy = anisotropy;
  return tex;
}

export function createStoneRuneTexture(anisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#263244';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.lineWidth = 4;
  const step = 64;
  for (let y = 0; y < 512; y += step) {
    const offset = (y / step) % 2 === 0 ? 0 : step / 2;
    for (let x = -step; x < 512 + step; x += step) {
      ctx.fillStyle =
        Math.random() > 0.5 ? 'rgba(71, 85, 105, 0.42)' : 'rgba(30, 41, 59, 0.42)';
      ctx.fillRect(x + offset + 2, y + 2, step - 4, step - 4);
      ctx.strokeRect(x + offset, y, step, step);
    }
  }

  // Ornate golden concentric runes
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.34)';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(256, 256, 185, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.26)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(256, 256, 130, 0, Math.PI * 2);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = anisotropy;
  return tex;
}

export function createWaterTexture(anisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#0369a1');
  grad.addColorStop(0.5, '#0ea5e9');
  grad.addColorStop(1, '#06b6d4');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 140; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const w = 28 + Math.random() * 64;
    ctx.strokeStyle = i % 3 === 0 ? 'rgba(224, 242, 254, 0.36)' : 'rgba(125, 211, 252, 0.22)';
    ctx.lineWidth = 2 + Math.random() * 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + w * 0.33, y - 6, x + w * 0.67, y + 6, x + w, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 18);
  tex.anisotropy = anisotropy;
  return tex;
}

export function createLordArmorTexture(anisotropy = 4): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#18181b';
  ctx.fillRect(0, 0, 256, 256);

  for (let y = 0; y < 256; y += 32) {
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.48)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(256, y);
    ctx.stroke();
  }
  for (let x = 0; x < 256; x += 64) {
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.42)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 32, 256);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = anisotropy;
  return tex;
}

export function createAdjectiveCardTexture(word: string, category: string, colorHex: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 360;
  const ctx = canvas.getContext('2d')!;

  const bgGrad = ctx.createLinearGradient(0, 0, 0, 360);
  bgGrad.addColorStop(0, '#0f172a');
  bgGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 256, 360);

  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, 236, 340);

  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 4;
  ctx.strokeRect(22, 22, 212, 316);

  ctx.fillStyle = colorHex;
  ctx.beginPath();
  ctx.arc(128, 76, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('★', 128, 78);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px sans-serif';
  ctx.fillText(word.toUpperCase(), 128, 178);

  ctx.fillStyle = colorHex;
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('KATA ADJEKTIF', 128, 240);
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 17px sans-serif';
  const shortCat = category.replace('Kata Adjektif ', '').toUpperCase();
  ctx.fillText(shortCat, 128, 268);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(64, 64, 6, 64, 64, 60);
  grad.addColorStop(0, 'rgba(0,0,0,0.65)');
  grad.addColorStop(0.6, 'rgba(0,0,0,0.3)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export function createHexShieldTexture(colorHex = '#7dd3fc'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 256, 256);
  ctx.strokeStyle = colorHex;
  ctx.lineWidth = 2.2;
  ctx.globalAlpha = 0.72;

  const r = 20;
  const dx = r * 1.5;
  const dy = r * Math.sqrt(3);

  for (let row = -1; row < 12; row++) {
    for (let col = -1; col < 12; col++) {
      const cx = col * dx;
      const cy = row * dy + (col % 2 === 0 ? 0 : dy * 0.5);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        const px = cx + r * Math.cos(ang);
        const py = cy + r * Math.sin(ang);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Subtle horizontal scan shimmer band
  const band = ctx.createLinearGradient(0, 96, 0, 160);
  band.addColorStop(0, 'rgba(255,255,255,0)');
  band.addColorStop(0.5, 'rgba(255,255,255,0.28)');
  band.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.globalAlpha = 1;
  ctx.fillStyle = band;
  ctx.fillRect(0, 96, 256, 64);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 2);
  return tex;
}
