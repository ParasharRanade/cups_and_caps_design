/* ==========================================================================
   Cups & Caps Design - Interactive HTML5 Canvas Design Studio Engine
   Supports text, arched/curved typography, vector badges, and custom image uploads
   ========================================================================== */

export class DesignEditor {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.elements = [];
    this.selectedElement = null;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.showPrintGuide = true;

    this.initEvents();
  }

  initEvents() {
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    window.addEventListener('mouseup', () => this.handleMouseUp());

    // Touch support for mobile/tablet
    this.canvas.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    this.canvas.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    });

    window.addEventListener('touchend', () => this.handleMouseUp());
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }

  handleMouseDown(e) {
    const { x, y } = this.getCanvasCoords(e);
    let hit = null;

    // Check elements in reverse z-order (topmost first)
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const el = this.elements[i];
      if (this.isPointInside(el, x, y)) {
        hit = el;
        break;
      }
    }

    this.selectedElement = hit;
    if (hit) {
      this.isDragging = true;
      this.dragStartX = x - hit.x;
      this.dragStartY = y - hit.y;
      // Trigger selection callback if defined
      if (this.onSelectCallback) this.onSelectCallback(hit);
    } else {
      if (this.onSelectCallback) this.onSelectCallback(null);
    }
    this.render();
  }

  handleMouseMove(e) {
    if (!this.isDragging || !this.selectedElement) return;
    const { x, y } = this.getCanvasCoords(e);
    this.selectedElement.x = x - this.dragStartX;
    this.selectedElement.y = y - this.dragStartY;
    this.render();
    if (this.onChangeCallback) this.onChangeCallback();
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  isPointInside(el, px, py) {
    const hw = (el.width || 120) * 0.5;
    const hh = (el.height || 40) * 0.5;
    return px >= el.x - hw && px <= el.x + hw && py >= el.y - hh && py <= el.y + hh;
  }

  /* ------------------------------------------------------------------------
     Element Operations
     ------------------------------------------------------------------------ */
  addText(text = 'ARTISAN COFFEE', options = {}) {
    const el = {
      id: 'text_' + Date.now(),
      type: 'text',
      text: text,
      x: options.x || this.canvas.width * 0.5,
      y: options.y || this.canvas.height * 0.45,
      fontSize: options.fontSize || 32,
      fontFamily: options.fontFamily || 'Outfit',
      fontWeight: options.fontWeight || '700',
      color: options.color || '#111827',
      isCurved: options.isCurved || false,
      curveRadius: options.curveRadius || 120,
      width: 180,
      height: 48
    };
    this.elements.push(el);
    this.selectedElement = el;
    this.render();
    if (this.onChangeCallback) this.onChangeCallback();
    return el;
  }

  addBadge(badgeType = 'coffee') {
    const el = {
      id: 'badge_' + Date.now(),
      type: 'badge',
      badgeType: badgeType,
      x: this.canvas.width * 0.5,
      y: this.canvas.height * 0.5,
      size: 110,
      color: '#E05A36',
      width: 110,
      height: 110
    };
    this.elements.push(el);
    this.selectedElement = el;
    this.render();
    if (this.onChangeCallback) this.onChangeCallback();
    return el;
  }

  addImage(imgElement, fileName = 'Uploaded Logo') {
    const maxWidth = this.canvas.width * 0.55;
    const scale = Math.min(1, maxWidth / imgElement.width);
    const w = imgElement.width * scale;
    const h = imgElement.height * scale;

    const el = {
      id: 'img_' + Date.now(),
      type: 'image',
      name: fileName,
      img: imgElement,
      x: this.canvas.width * 0.5,
      y: this.canvas.height * 0.5,
      width: w,
      height: h
    };
    this.elements.push(el);
    this.selectedElement = el;
    this.render();
    if (this.onChangeCallback) this.onChangeCallback();
    return el;
  }

  deleteSelected() {
    if (!this.selectedElement) return;
    this.elements = this.elements.filter(el => el.id !== this.selectedElement.id);
    this.selectedElement = null;
    this.render();
    if (this.onChangeCallback) this.onChangeCallback();
  }

  clearAll() {
    this.elements = [];
    this.selectedElement = null;
    this.render();
    if (this.onChangeCallback) this.onChangeCallback();
  }

  /* ------------------------------------------------------------------------
     Rendering Engine
     ------------------------------------------------------------------------ */
  render() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Subtle Grid / Print Margin
    if (this.showPrintGuide) {
      ctx.strokeStyle = 'rgba(224, 90, 54, 0.2)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(20, 20, w - 40, h - 40);
      ctx.setLineDash([]);
    }

    // Render Each Element
    for (const el of this.elements) {
      ctx.save();

      if (el.type === 'text') {
        this.renderTextElement(ctx, el);
      } else if (el.type === 'badge') {
        this.renderBadgeElement(ctx, el);
      } else if (el.type === 'image') {
        this.renderImageElement(ctx, el);
      }

      // Draw selection bounding box
      if (this.selectedElement && this.selectedElement.id === el.id) {
        ctx.strokeStyle = '#E05A36';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        const hw = (el.width || 100) * 0.5 + 8;
        const hh = (el.height || 40) * 0.5 + 8;
        ctx.strokeRect(el.x - hw, el.y - hh, hw * 2, hh * 2);
        ctx.setLineDash([]);

        // Small corner drag handles
        ctx.fillStyle = '#E05A36';
        ctx.fillRect(el.x - hw - 3, el.y - hh - 3, 6, 6);
        ctx.fillRect(el.x + hw - 3, el.y - hh - 3, 6, 6);
        ctx.fillRect(el.x - hw - 3, el.y + hh - 3, 6, 6);
        ctx.fillRect(el.x + hw - 3, el.y + hh - 3, 6, 6);
      }

      ctx.restore();
    }
  }

  renderTextElement(ctx, el) {
    ctx.font = `${el.fontWeight} ${el.fontSize}px "${el.fontFamily}", sans-serif`;
    ctx.fillStyle = el.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const metrics = ctx.measureText(el.text);
    el.width = metrics.width;
    el.height = el.fontSize * 1.2;

    if (el.isCurved) {
      // Draw text around an arc (Crucial for caps & cup circular badges)
      const radius = el.curveRadius || 120;
      const angleStep = (el.fontSize * 0.6) / radius;
      const totalAngle = (el.text.length - 1) * angleStep;
      let startAngle = -Math.PI / 2 - totalAngle / 2;

      for (let i = 0; i < el.text.length; i++) {
        const char = el.text[i];
        const charAngle = startAngle + i * angleStep;
        ctx.save();
        ctx.translate(el.x + Math.cos(charAngle) * radius, el.y + Math.sin(charAngle) * radius + radius * 0.6);
        ctx.rotate(charAngle + Math.PI / 2);
        ctx.fillText(char, 0, 0);
        ctx.restore();
      }
    } else {
      ctx.fillText(el.text, el.x, el.y);
    }
  }

  renderBadgeElement(ctx, el) {
    ctx.save();
    ctx.translate(el.x, el.y);
    ctx.fillStyle = el.color;
    ctx.strokeStyle = el.color;

    const s = el.size * 0.5;

    switch (el.badgeType) {
      case 'coffee':
        // Modern Artisan Coffee Cup Emblem
        ctx.beginPath();
        ctx.roundRect(-s * 0.6, -s * 0.3, s * 1.2, s * 0.9, [0, 0, 16, 16]);
        ctx.fill();
        // Steam curves
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(-s * 0.25, -s * 0.55);
        ctx.quadraticCurveTo(-s * 0.15, -s * 0.75, -s * 0.25, -s * 0.9);
        ctx.moveTo(s * 0.25, -s * 0.55);
        ctx.quadraticCurveTo(s * 0.35, -s * 0.75, s * 0.25, -s * 0.9);
        ctx.stroke();
        // Handle
        ctx.beginPath();
        ctx.arc(s * 0.7, 0, s * 0.25, -Math.PI * 0.5, Math.PI * 0.5);
        ctx.lineWidth = 6;
        ctx.stroke();
        break;

      case 'mountain':
        // Outdoor Mountain Peak Badge
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.9);
        ctx.lineTo(s * 0.85, s * 0.7);
        ctx.lineTo(-s * 0.85, s * 0.7);
        ctx.closePath();
        ctx.lineWidth = 5;
        ctx.stroke();

        // Snowcap
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.9);
        ctx.lineTo(s * 0.3, -s * 0.3);
        ctx.lineTo(0, -s * 0.45);
        ctx.lineTo(-s * 0.3, -s * 0.3);
        ctx.closePath();
        ctx.fill();
        break;

      case 'athletic':
        // Vintage Athletic Shield
        ctx.beginPath();
        ctx.moveTo(0, -s * 0.8);
        ctx.lineTo(s * 0.75, -s * 0.8);
        ctx.lineTo(s * 0.75, 0);
        ctx.quadraticCurveTo(s * 0.75, s * 0.75, 0, s * 0.95);
        ctx.quadraticCurveTo(-s * 0.75, s * 0.75, -s * 0.75, 0);
        ctx.lineTo(-s * 0.75, -s * 0.8);
        ctx.closePath();
        ctx.lineWidth = 5;
        ctx.stroke();
        // Star inside
        this.drawStar(ctx, 0, 0, 5, s * 0.4, s * 0.18);
        break;

      case 'botanical':
        // Organic Coffee Leaf Wreath
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, s * 0.75, Math.PI * 0.2, Math.PI * 1.8);
        ctx.stroke();
        this.drawStar(ctx, 0, 0, 4, s * 0.3, s * 0.12);
        break;
    }

    ctx.restore();
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = (Math.PI / 2) * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  renderImageElement(ctx, el) {
    if (!el.img) return;
    const hw = el.width * 0.5;
    const hh = el.height * 0.5;
    ctx.drawImage(el.img, el.x - hw, el.y - hh, el.width, el.height);
  }
}
