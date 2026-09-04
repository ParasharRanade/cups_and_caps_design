/* ==========================================================================
   Cups & Caps Design - Photorealistic Mockup Synthesis Engine
   Specialized Canvas 2D/3D Shader & Warp Renderer for Drinkware and Headwear
   ========================================================================== */

export class MockupRenderer {
  /**
   * Universal Dispatcher for Products
   */
  static render(productType, targetCanvas, designCanvas, options = {}) {
    switch (productType) {
      case 'ceramic-mug':
        this.renderCeramicMug(targetCanvas, designCanvas, options);
        break;
      case 'steel-tumbler':
        this.renderSteelTumbler(targetCanvas, designCanvas, options);
        break;
      case 'enamel-mug':
        this.renderEnamelMug(targetCanvas, designCanvas, options);
        break;
      case 'dad-hat':
        this.renderDadHat(targetCanvas, designCanvas, options);
        break;
      case 'trucker-cap':
        this.renderTruckerCap(targetCanvas, designCanvas, options);
        break;
      case 'knit-beanie':
        this.renderKnitBeanie(targetCanvas, designCanvas, options);
        break;
      default:
        this.renderCeramicMug(targetCanvas, designCanvas, options);
    }
  }

  /* ------------------------------------------------------------------------
     1. CERAMIC COFFEE MUG MOCKUP
     ------------------------------------------------------------------------ */
  static renderCeramicMug(targetCanvas, designCanvas, options = {}) {
    const ctx = targetCanvas.getContext('2d');
    const w = targetCanvas.width;
    const h = targetCanvas.height;
    const color = options.color || '#FFFFFF';
    const angle = options.angle || 'front'; // 'front', 'left', 'right', 'back'

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Subtle drop shadow under mug
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(w * 0.52, h * 0.88, w * 0.32, h * 0.06, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(17, 24, 39, 0.12)';
    ctx.filter = 'blur(10px)';
    ctx.fill();
    ctx.restore();

    // Mug Dimensions
    const mugX = w * 0.28;
    const mugY = h * 0.22;
    const mugW = w * 0.50;
    const mugH = h * 0.62;
    const rimH = h * 0.08;

    // Draw Ceramic Handle
    if (angle !== 'back') {
      const handleRight = angle === 'front' || angle === 'left';
      ctx.save();
      ctx.beginPath();
      const hx = handleRight ? mugX + mugW - 10 : mugX + 10;
      const hy = mugY + mugH * 0.22;
      const hw = w * 0.18;
      const hh = mugH * 0.55;

      if (handleRight) {
        ctx.moveTo(hx, hy);
        ctx.bezierCurveTo(hx + hw, hy, hx + hw, hy + hh, hx, hy + hh);
      } else {
        ctx.moveTo(hx, hy);
        ctx.bezierCurveTo(hx - hw, hy, hx - hw, hy + hh, hx, hy + hh);
      }

      ctx.strokeStyle = color === '#FFFFFF' ? '#EDEAE4' : color;
      ctx.lineWidth = 26;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Handle highlight & depth
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 8;
      ctx.stroke();
      ctx.restore();
    }

    // Main Mug Cylinder Body
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(mugX, mugY + rimH * 0.5);
    ctx.lineTo(mugX, mugY + mugH - rimH * 0.5);
    ctx.quadraticCurveTo(mugX + mugW * 0.5, mugY + mugH + rimH * 0.6, mugX + mugW, mugY + mugH - rimH * 0.5);
    ctx.lineTo(mugX + mugW, mugY + rimH * 0.5);
    ctx.quadraticCurveTo(mugX + mugW * 0.5, mugY - rimH * 0.3, mugX, mugY + rimH * 0.5);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    // Clip to printable mug surface
    ctx.save();
    ctx.clip();

    // Render User Design with Cylindrical Curve Wrap
    if (designCanvas && designCanvas.width > 0) {
      const printW = mugW * 0.76;
      const printH = mugH * 0.65;
      const printX = mugX + (mugW - printW) * 0.5;
      const printY = mugY + (mugH - printH) * 0.5;

      // Draw sliced vertical strips to simulate 3D cylinder wrap
      const strips = 30;
      const stripW = printW / strips;
      const srcStripW = designCanvas.width / strips;

      for (let i = 0; i < strips; i++) {
        // Perspective curve factor
        const norm = (i / strips) * 2 - 1; // -1 to 1
        const cosAngle = Math.cos(norm * 1.05);
        const yOffset = Math.sin(norm * 1.05) * 4;

        ctx.drawImage(
          designCanvas,
          i * srcStripW, 0, srcStripW, designCanvas.height,
          printX + i * stripW, printY + yOffset, stripW, printH * (0.95 + 0.05 * cosAngle)
        );
      }
    }

    // Ceramic Gloss & 3D Shading Gradients
    const shadeGrad = ctx.createLinearGradient(mugX, 0, mugX + mugW, 0);
    shadeGrad.addColorStop(0, 'rgba(15, 23, 42, 0.40)');
    shadeGrad.addColorStop(0.12, 'rgba(255, 255, 255, 0.35)');
    shadeGrad.addColorStop(0.28, 'rgba(255, 255, 255, 0.0)');
    shadeGrad.addColorStop(0.70, 'rgba(15, 23, 42, 0.05)');
    shadeGrad.addColorStop(0.92, 'rgba(15, 23, 42, 0.25)');
    shadeGrad.addColorStop(1, 'rgba(15, 23, 42, 0.45)');
    ctx.fillStyle = shadeGrad;
    ctx.fill();

    ctx.restore(); // end clip

    // Ceramic Top Rim & Coffee Opening
    ctx.beginPath();
    ctx.ellipse(mugX + mugW * 0.5, mugY + rimH * 0.5, mugW * 0.5, rimH * 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#EDEAE3';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Coffee / Steam Inside Depth
    ctx.beginPath();
    ctx.ellipse(mugX + mugW * 0.5, mugY + rimH * 0.5 + 3, mugW * 0.46, rimH * 0.44, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#3F2012'; // Rich Espresso Crema
    ctx.fill();

    ctx.restore();
  }

  /* ------------------------------------------------------------------------
     2. STAINLESS STEEL TRAVEL TUMBLER MOCKUP
     ------------------------------------------------------------------------ */
  static renderSteelTumbler(targetCanvas, designCanvas, options = {}) {
    const ctx = targetCanvas.getContext('2d');
    const w = targetCanvas.width;
    const h = targetCanvas.height;
    const color = options.color || '#2C3E50';

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Tumbler Ground Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.90, w * 0.22, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(17, 24, 39, 0.14)';
    ctx.filter = 'blur(8px)';
    ctx.fill();
    ctx.restore();

    const topW = w * 0.42;
    const botW = w * 0.32;
    const tumY = h * 0.20;
    const tumH = h * 0.68;
    const cx = w * 0.5;

    // Body Taper Path
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - topW * 0.5, tumY);
    ctx.lineTo(cx + topW * 0.5, tumY);
    ctx.lineTo(cx + botW * 0.5, tumY + tumH);
    ctx.quadraticCurveTo(cx, tumY + tumH + 8, cx - botW * 0.5, tumY + tumH);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    // Clip for Laser Etch / Print Design
    ctx.save();
    ctx.clip();

    if (designCanvas && designCanvas.width > 0) {
      const dw = topW * 0.65;
      const dh = tumH * 0.45;
      ctx.drawImage(designCanvas, cx - dw * 0.5, tumY + tumH * 0.25, dw, dh);
    }

    // Brushed Metallic Cylindrical Gradient
    const metalGrad = ctx.createLinearGradient(cx - topW * 0.5, 0, cx + topW * 0.5, 0);
    metalGrad.addColorStop(0, 'rgba(0, 0, 0, 0.45)');
    metalGrad.addColorStop(0.18, 'rgba(255, 255, 255, 0.45)');
    metalGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.1)');
    metalGrad.addColorStop(0.70, 'rgba(0, 0, 0, 0.05)');
    metalGrad.addColorStop(0.88, 'rgba(255, 255, 255, 0.2)');
    metalGrad.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
    ctx.fillStyle = metalGrad;
    ctx.fill();

    ctx.restore(); // end clip

    // Clear Acrylic Top Lid
    ctx.beginPath();
    ctx.roundRect(cx - topW * 0.5 - 2, tumY - 14, topW + 4, 16, 4);
    ctx.fillStyle = 'rgba(240, 245, 250, 0.9)';
    ctx.fill();
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Sip slider notch
    ctx.beginPath();
    ctx.roundRect(cx - 14, tumY - 18, 28, 6, 2);
    ctx.fillStyle = '#1E293B';
    ctx.fill();

    ctx.restore();
  }

  /* ------------------------------------------------------------------------
     3. CAMPFIRE ENAMEL MUG MOCKUP
     ------------------------------------------------------------------------ */
  static renderEnamelMug(targetCanvas, designCanvas, options = {}) {
    const ctx = targetCanvas.getContext('2d');
    const w = targetCanvas.width;
    const h = targetCanvas.height;
    const color = options.color || '#FAF8F5'; // Off-white enamel

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(w * 0.50, h * 0.88, w * 0.32, h * 0.05, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.10)';
    ctx.filter = 'blur(9px)';
    ctx.fill();
    ctx.restore();

    // Enamel dimensions
    const mx = w * 0.26;
    const my = h * 0.28;
    const mw = w * 0.52;
    const mh = h * 0.55;

    // Vintage Metal Rim Handle
    ctx.save();
    ctx.beginPath();
    ctx.arc(mx + mw + 2, my + mh * 0.5, mw * 0.22, -Math.PI * 0.45, Math.PI * 0.45, false);
    ctx.strokeStyle = color === '#FAF8F5' ? '#D6D3CD' : color;
    ctx.lineWidth = 18;
    ctx.stroke();
    ctx.strokeStyle = '#1E293B'; // Black enamel rim accent
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Enamel Pot Body
    ctx.beginPath();
    ctx.roundRect(mx, my, mw, mh, [0, 0, 16, 16]);
    ctx.fillStyle = color;
    ctx.fill();

    // Clip & Draw Design
    ctx.save();
    ctx.clip();

    if (designCanvas && designCanvas.width > 0) {
      const dw = mw * 0.65;
      const dh = mh * 0.55;
      ctx.drawImage(designCanvas, mx + (mw - dw) * 0.5, my + (mh - dh) * 0.5, dw, dh);
    }

    // Vintage Speckles Texture
    ctx.fillStyle = 'rgba(30, 41, 59, 0.18)';
    for (let i = 0; i < 60; i++) {
      const sx = mx + (Math.sin(i * 99) * 0.5 + 0.5) * mw;
      const sy = my + (Math.cos(i * 33) * 0.5 + 0.5) * mh;
      ctx.fillRect(sx, sy, 2, 2);
    }

    // Lighting shading
    const shade = ctx.createLinearGradient(mx, 0, mx + mw, 0);
    shade.addColorStop(0, 'rgba(0,0,0,0.3)');
    shade.addColorStop(0.2, 'rgba(255,255,255,0.25)');
    shade.addColorStop(0.5, 'rgba(255,255,255,0)');
    shade.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = shade;
    ctx.fill();

    ctx.restore(); // end clip

    // Iconic Contrast Rolled Steel Enamel Rim
    ctx.beginPath();
    ctx.roundRect(mx - 4, my - 6, mw + 8, 12, 6);
    ctx.fillStyle = '#1E293B'; // Classic black/navy enamel rim
    ctx.fill();

    ctx.restore();
  }

  /* ------------------------------------------------------------------------
     4. VINTAGE WASHED DAD HAT MOCKUP (6-PANEL)
     ------------------------------------------------------------------------ */
  static renderDadHat(targetCanvas, designCanvas, options = {}) {
    const ctx = targetCanvas.getContext('2d');
    const w = targetCanvas.width;
    const h = targetCanvas.height;
    const color = options.color || '#E05A36'; // Terracotta dad hat default
    const finish = options.finish || '3d-puff'; // '3d-puff', 'flat', 'leather'

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Brim Ground Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.88, w * 0.36, h * 0.05, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(17, 24, 39, 0.14)';
    ctx.filter = 'blur(10px)';
    ctx.fill();
    ctx.restore();

    const cx = w * 0.5;
    const crownTopY = h * 0.20;
    const crownBaseY = h * 0.62;
    const crownW = w * 0.56;

    // 1. Curved Visor / Brim (Front View)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - crownW * 0.62, crownBaseY);
    ctx.quadraticCurveTo(cx, crownBaseY - 18, cx + crownW * 0.62, crownBaseY);
    ctx.quadraticCurveTo(cx + crownW * 0.68, crownBaseY + 55, cx, crownBaseY + 68);
    ctx.quadraticCurveTo(cx - crownW * 0.68, crownBaseY + 55, cx - crownW * 0.62, crownBaseY);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    // Brim stitch lines (Authentic curved baseball rows)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 1.8;
    for (let r = 14; r <= 46; r += 10) {
      ctx.beginPath();
      ctx.quadraticCurveTo(cx, crownBaseY + r - 10, cx + crownW * 0.52, crownBaseY + r);
      ctx.stroke();
    }

    // Brim shadow overlay
    const brimShade = ctx.createLinearGradient(0, crownBaseY, 0, crownBaseY + 65);
    brimShade.addColorStop(0, 'rgba(0,0,0,0.3)');
    brimShade.addColorStop(1, 'rgba(0,0,0,0.05)');
    ctx.fillStyle = brimShade;
    ctx.fill();
    ctx.restore();

    // 2. Unstructured 6-Panel Crown Body
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - crownW * 0.5, crownBaseY);
    ctx.quadraticCurveTo(cx - crownW * 0.48, crownTopY + 20, cx, crownTopY);
    ctx.quadraticCurveTo(cx + crownW * 0.48, crownTopY + 20, cx + crownW * 0.5, crownBaseY);
    ctx.quadraticCurveTo(cx, crownBaseY - 14, cx - crownW * 0.5, crownBaseY);
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    // Panel Seam Stitches
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.lineWidth = 2;
    // Center seam
    ctx.beginPath();
    ctx.moveTo(cx, crownTopY);
    ctx.lineTo(cx, crownBaseY - 14);
    ctx.stroke();

    // Left angle seam
    ctx.beginPath();
    ctx.moveTo(cx, crownTopY);
    ctx.quadraticCurveTo(cx - crownW * 0.26, crownTopY + 60, cx - crownW * 0.35, crownBaseY);
    ctx.stroke();

    // Right angle seam
    ctx.beginPath();
    ctx.moveTo(cx, crownTopY);
    ctx.quadraticCurveTo(cx + crownW * 0.26, crownTopY + 60, cx + crownW * 0.35, crownBaseY);
    ctx.stroke();

    // Embroidered Eyelets
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.arc(cx - crownW * 0.24, crownTopY + 65, 4, 0, Math.PI * 2);
    ctx.arc(cx + crownW * 0.24, crownTopY + 65, 4, 0, Math.PI * 2);
    ctx.fill();

    // 3. Front Crown Embroidery / Patch Area
    if (designCanvas && designCanvas.width > 0) {
      const pw = crownW * 0.48;
      const ph = (crownBaseY - crownTopY) * 0.50;
      const px = cx - pw * 0.5;
      const py = crownTopY + (crownBaseY - crownTopY) * 0.32;

      ctx.save();
      if (finish === 'leather') {
        // Laser Cut Leather Patch Base
        ctx.beginPath();
        ctx.roundRect(px - 6, py - 4, pw + 12, ph + 8, 8);
        ctx.fillStyle = '#C27835'; // Caramel saddle leather
        ctx.fill();
        ctx.strokeStyle = '#633B10';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]); // Stitched edge
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.filter = 'contrast(1.2) drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
      } else if (finish === '3d-puff') {
        // 3D Raised Puff Embroidery Simulation
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetY = 3;
      }

      // Draw User Design
      ctx.drawImage(designCanvas, px, py, pw, ph);

      // Thread Sheen Overlay
      if (finish === '3d-puff') {
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        for (let i = py; i < py + ph; i += 3) {
          ctx.fillRect(px, i, pw, 1);
        }
      }
      ctx.restore();
    }

    // Twill Fabric Shading / Curvature
    const twillGrad = ctx.createRadialGradient(cx, crownTopY + 60, crownW * 0.1, cx, crownTopY + 60, crownW * 0.55);
    twillGrad.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
    twillGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.08)');
    twillGrad.addColorStop(1, 'rgba(0, 0, 0, 0.32)');
    ctx.fillStyle = twillGrad;
    ctx.fill();

    // Top Button (Squatchee)
    ctx.beginPath();
    ctx.arc(cx, crownTopY + 2, 7, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }

  /* ------------------------------------------------------------------------
     5. RETRO TRUCKER SNAPBACK MOCKUP
     ------------------------------------------------------------------------ */
  static renderTruckerCap(targetCanvas, designCanvas, options = {}) {
    const ctx = targetCanvas.getContext('2d');
    const w = targetCanvas.width;
    const h = targetCanvas.height;
    const crownColor = options.color || '#FAF8F5'; // Foam front
    const meshColor = options.meshColor || '#1E293B'; // Rear mesh

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Drop Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.88, w * 0.38, h * 0.05, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(17, 24, 39, 0.12)';
    ctx.filter = 'blur(10px)';
    ctx.fill();
    ctx.restore();

    const cx = w * 0.5;
    const crownTopY = h * 0.18;
    const crownBaseY = h * 0.60;
    const crownW = w * 0.58;

    // 1. Rear Breathable Mesh Panels (Showing on sides)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - crownW * 0.58, crownBaseY);
    ctx.quadraticCurveTo(cx - crownW * 0.52, crownTopY + 10, cx, crownTopY - 4);
    ctx.quadraticCurveTo(cx + crownW * 0.52, crownTopY + 10, cx + crownW * 0.58, crownBaseY);
    ctx.closePath();
    ctx.fillStyle = meshColor;
    ctx.fill();

    // Honeycomb Mesh Texture Pattern
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    for (let x = cx - crownW * 0.58; x < cx + crownW * 0.58; x += 6) {
      ctx.beginPath();
      ctx.moveTo(x, crownTopY);
      ctx.lineTo(x + 10, crownBaseY);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Stiffened Foam Front Panel
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - crownW * 0.44, crownBaseY);
    ctx.quadraticCurveTo(cx - crownW * 0.40, crownTopY + 15, cx, crownTopY);
    ctx.quadraticCurveTo(cx + crownW * 0.40, crownTopY + 15, cx + crownW * 0.44, crownBaseY);
    ctx.quadraticCurveTo(cx, crownBaseY - 10, cx - crownW * 0.44, crownBaseY);
    ctx.closePath();
    ctx.fillStyle = crownColor;
    ctx.fill();

    // Trucker Braid Cord along visor seam
    ctx.strokeStyle = '#D97706';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.quadraticCurveTo(cx, crownBaseY - 10, cx + crownW * 0.44, crownBaseY);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. User Patch / Print on Foam Front
    if (designCanvas && designCanvas.width > 0) {
      const pw = crownW * 0.46;
      const ph = (crownBaseY - crownTopY) * 0.52;
      const px = cx - pw * 0.5;
      const py = crownTopY + (crownBaseY - crownTopY) * 0.26;

      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      ctx.drawImage(designCanvas, px, py, pw, ph);
      ctx.restore();
    }
    ctx.restore();

    // 4. Flat / Slightly Curved Visor
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - crownW * 0.60, crownBaseY);
    ctx.quadraticCurveTo(cx, crownBaseY - 14, cx + crownW * 0.60, crownBaseY);
    ctx.quadraticCurveTo(cx + crownW * 0.65, crownBaseY + 52, cx, crownBaseY + 62);
    ctx.quadraticCurveTo(cx - crownW * 0.65, crownBaseY + 52, cx - crownW * 0.60, crownBaseY);
    ctx.closePath();
    ctx.fillStyle = meshColor;
    ctx.fill();
    ctx.restore();

    // Top Button
    ctx.beginPath();
    ctx.arc(cx, crownTopY, 6, 0, Math.PI * 2);
    ctx.fillStyle = meshColor;
    ctx.fill();

    ctx.restore();
  }

  /* ------------------------------------------------------------------------
     6. FISHERMAN RIBBED KNIT BEANIE MOCKUP
     ------------------------------------------------------------------------ */
  static renderKnitBeanie(targetCanvas, designCanvas, options = {}) {
    const ctx = targetCanvas.getContext('2d');
    const w = targetCanvas.width;
    const h = targetCanvas.height;
    const color = options.color || '#334155'; // Heather Slate

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    // Shadow
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.88, w * 0.28, h * 0.04, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(17, 24, 39, 0.12)';
    ctx.filter = 'blur(8px)';
    ctx.fill();
    ctx.restore();

    const cx = w * 0.5;
    const topY = h * 0.18;
    const cuffY = h * 0.62;
    const botY = h * 0.84;
    const bw = w * 0.50;

    // Beanie Dome Top
    ctx.beginPath();
    ctx.moveTo(cx - bw * 0.46, cuffY);
    ctx.quadraticCurveTo(cx - bw * 0.44, topY + 10, cx, topY);
    ctx.quadraticCurveTo(cx + bw * 0.44, topY + 10, cx + bw * 0.46, cuffY);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Ribbed Texture Lines on Dome
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.18)';
    ctx.lineWidth = 2;
    for (let x = cx - bw * 0.42; x < cx + bw * 0.42; x += 10) {
      ctx.beginPath();
      ctx.moveTo(x, cuffY);
      ctx.quadraticCurveTo(cx + (x - cx) * 0.4, topY + 40, cx, topY);
      ctx.stroke();
    }

    // Folded Cuff Hem
    ctx.beginPath();
    ctx.roundRect(cx - bw * 0.52, cuffY - 4, bw * 1.04, botY - cuffY + 4, 12);
    ctx.fillStyle = color;
    ctx.fill();

    // Cuff Rib Texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    for (let rx = cx - bw * 0.50; rx < cx + bw * 0.50; rx += 8) {
      ctx.beginPath();
      ctx.moveTo(rx, cuffY);
      ctx.lineTo(rx, botY);
      ctx.stroke();
    }

    // Embroidered Patch on Folded Cuff
    if (designCanvas && designCanvas.width > 0) {
      const pw = bw * 0.48;
      const ph = (botY - cuffY) * 0.72;
      const px = cx - pw * 0.5;
      const py = cuffY + ((botY - cuffY) - ph) * 0.5;

      ctx.save();
      // Woven Twill Patch Backdrop
      ctx.beginPath();
      ctx.roundRect(px - 4, py - 4, pw + 8, ph + 8, 6);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.drawImage(designCanvas, px, py, pw, ph);
      ctx.restore();
    }

    ctx.restore();
  }
}
