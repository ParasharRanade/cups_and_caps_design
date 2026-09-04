/* ==========================================================================
   Cups & Caps Design - Flagship Application Controller
   ========================================================================== */

import { MockupRenderer } from './mockup.js';
import { DesignEditor } from './editor.js';
import { calculateQuote, PRODUCT_CATALOG, formatINR } from './calculator.js';
import { TEMPLATES } from './templates.js';

class CupsAndCapsApp {
  constructor() {
    this.cart = [];
    this.currentProduct = 'ceramic-mug';
    this.currentColor = '#FFFFFF';
    this.currentFinish = 'ceramic-glaze';
    this.currentAngle = 'front';
    this.couponApplied = false;
    this.discountPercent = 0;

    this.editor = null;
    this.bufferCanvas = null;
    this.studioMockupCanvas = null;
    this.heroCanvas = null;

    this.initDOM();
    this.initStudio();
    this.initHero();
    this.initCatalog();
    this.initCalculator();
    this.initTemplates();
    this.bindEvents();
  }

  initDOM() {
    this.heroCanvas = document.getElementById('heroCanvas');
    this.studioMockupCanvas = document.getElementById('studioMockupCanvas');
    this.bufferCanvas = document.getElementById('studioDesignBuffer');
  }

  /* ------------------------------------------------------------------------
     1. HERO SHOWCASE CONTROLS
     ------------------------------------------------------------------------ */
  initHero() {
    if (!this.heroCanvas) return;

    // Default hero showcase template
    const heroProduct = 'dad-hat';
    this.renderHeroPreview(heroProduct, '#E05A36');

    document.querySelectorAll('.showcase-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.showcase-tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const prod = e.currentTarget.dataset.product;
        const color = e.currentTarget.dataset.color || '#E05A36';
        this.renderHeroPreview(prod, color);
      });
    });
  }

  renderHeroPreview(productId, color) {
    if (!this.heroCanvas) return;
    const template = TEMPLATES.find(t => t.targetProduct === productId) || TEMPLATES[1];

    // Create offscreen design canvas
    const offCanvas = document.createElement('canvas');
    offCanvas.width = 360;
    offCanvas.height = 240;
    const offEditor = new DesignEditor(offCanvas);
    offEditor.showPrintGuide = false;

    // Load template elements
    template.elements.forEach(el => {
      if (el.type === 'badge') {
        const b = offEditor.addBadge(el.badgeType);
        b.x = el.x; b.y = el.y; b.size = el.size; b.color = el.color;
      } else if (el.type === 'text') {
        const t = offEditor.addText(el.text, el);
        t.x = el.x; t.y = el.y;
      }
    });
    offEditor.render();

    MockupRenderer.render(productId, this.heroCanvas, offCanvas, {
      color: color,
      angle: 'front',
      finish: '3d-puff'
    });
  }

  /* ------------------------------------------------------------------------
     2. CATALOG THUMBNAILS GENERATION
     ------------------------------------------------------------------------ */
  initCatalog() {
    // Generate mini mockups on catalog cards
    document.querySelectorAll('.card-preview-canvas').forEach(canvas => {
      const prodId = canvas.dataset.product;
      const color = canvas.dataset.color || '#FFFFFF';

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 240;
      tempCanvas.height = 160;
      const tempEditor = new DesignEditor(tempCanvas);
      tempEditor.showPrintGuide = false;

      // Add simple elegant default emblem
      const badge = tempEditor.addBadge(prodId.includes('mug') ? 'coffee' : 'mountain');
      badge.size = 70;
      badge.color = prodId.includes('mug') ? '#E05A36' : '#FFFFFF';
      tempEditor.render();

      MockupRenderer.render(prodId, canvas, tempCanvas, {
        color: color,
        angle: 'front'
      });
    });

    // Catalog Filter Pills
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const filter = e.currentTarget.dataset.filter;

        document.querySelectorAll('.product-card').forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     3. STUDIO LIVE CUSTOMIZER CONTROLLER
     ------------------------------------------------------------------------ */
  initStudio() {
    if (!this.bufferCanvas) return;

    this.editor = new DesignEditor(this.bufferCanvas);
    this.editor.onChangeCallback = () => this.updateStudioMockup();
    this.editor.onSelectCallback = (el) => this.syncSelectedElementControls(el);

    // Load Initial Design
    this.loadTemplate(TEMPLATES[0]);
    this.updateStudioMockup();
  }

  updateStudioMockup() {
    if (!this.studioMockupCanvas || !this.bufferCanvas) return;

    MockupRenderer.render(this.currentProduct, this.studioMockupCanvas, this.bufferCanvas, {
      color: this.currentColor,
      finish: this.currentFinish,
      angle: this.currentAngle
    });
  }

  syncSelectedElementControls(el) {
    const textInput = document.getElementById('studioTextInput');
    const curveCheck = document.getElementById('curveTextCheck');
    const fontSelect = document.getElementById('fontFamilySelect');

    if (el && el.type === 'text') {
      if (textInput) textInput.value = el.text;
      if (curveCheck) curveCheck.checked = !!el.isCurved;
      if (fontSelect) fontSelect.value = el.fontFamily;
    }
  }

  openStudio(productId = 'ceramic-mug', templateId = null) {
    this.currentProduct = productId;
    const prodConfig = PRODUCT_CATALOG[productId] || PRODUCT_CATALOG['ceramic-mug'];
    this.currentColor = prodConfig.defaultColor || '#FFFFFF';
    this.currentFinish = prodConfig.methods[0] || 'ceramic-glaze';

    // Update Product Select in Studio
    const prodSelect = document.getElementById('studioProductSelect');
    if (prodSelect) prodSelect.value = productId;

    // Update Finishes List
    this.renderStudioFinishesList(prodConfig);

    // Update Colors Swatches
    this.renderStudioColorSwatches(prodConfig);

    if (templateId) {
      const tmpl = TEMPLATES.find(t => t.id === templateId);
      if (tmpl) this.loadTemplate(tmpl);
    }

    const modal = document.getElementById('studioModal');
    if (modal) modal.classList.add('active');
    this.updateStudioMockup();
  }

  renderStudioFinishesList(prodConfig) {
    const finishContainer = document.getElementById('finishListContainer');
    if (!finishContainer) return;

    const finishNames = {
      'ceramic-glaze': 'Kiln-Fired Ceramic Glaze',
      'full-sublimation': '360° Full Wrap Digital',
      'laser-etch': 'Precision Laser Engraving',
      '3d-puff': '3D Raised Puff Embroidery',
      'flat-embroidery': 'Flat Thread Stitched',
      'leather-patch': 'Laser-Cut Leather Patch'
    };

    finishContainer.innerHTML = prodConfig.methods.map((method, idx) => `
      <div class="finish-card ${method === this.currentFinish ? 'active' : ''}" data-finish="${method}">
        <span>${finishNames[method] || method}</span>
        <span>${method === '3d-puff' ? '+₹49' : method === 'leather-patch' ? '+₹69' : 'Included'}</span>
      </div>
    `).join('');

    finishContainer.querySelectorAll('.finish-card').forEach(card => {
      card.addEventListener('click', (e) => {
        finishContainer.querySelectorAll('.finish-card').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentFinish = e.currentTarget.dataset.finish;
        this.updateStudioMockup();
      });
    });
  }

  renderStudioColorSwatches(prodConfig) {
    const swatchesContainer = document.getElementById('studioColorSwatches');
    if (!swatchesContainer) return;

    swatchesContainer.innerHTML = prodConfig.colors.map(color => `
      <div class="color-swatch ${color === this.currentColor ? 'active' : ''}" style="background: ${color};" data-color="${color}"></div>
    `).join('');

    swatchesContainer.querySelectorAll('.color-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        swatchesContainer.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentColor = e.currentTarget.dataset.color;
        this.updateStudioMockup();
      });
    });
  }

  loadTemplate(template) {
    if (!this.editor) return;
    this.editor.clearAll();
    this.currentProduct = template.targetProduct;
    this.currentColor = template.productColor || '#FFFFFF';

    template.elements.forEach(el => {
      if (el.type === 'badge') {
        const b = this.editor.addBadge(el.badgeType);
        b.x = el.x; b.y = el.y; b.size = el.size; b.color = el.color;
      } else if (el.type === 'text') {
        const t = this.editor.addText(el.text, el);
        t.x = el.x; t.y = el.y;
      }
    });

    const prodConfig = PRODUCT_CATALOG[this.currentProduct];
    if (prodConfig) {
      this.renderStudioFinishesList(prodConfig);
      this.renderStudioColorSwatches(prodConfig);
    }
    this.updateStudioMockup();
  }

  /* ------------------------------------------------------------------------
     4. INSTANT BULK QUOTE CALCULATOR
     ------------------------------------------------------------------------ */
  initCalculator() {
    const productSelect = document.getElementById('calcProductSelect');
    const qtySlider = document.getElementById('calcQtySlider');
    const qtyNumber = document.getElementById('calcQtyDisplay');
    const packagingCheck = document.getElementById('calcPackagingCheck');
    const labelCheck = document.getElementById('calcLabelCheck');
    const rushCheck = document.getElementById('calcRushCheck');

    const updateCalc = () => {
      const prodId = productSelect ? productSelect.value : 'ceramic-mug';
      const qty = qtySlider ? parseInt(qtySlider.value, 10) : 24;
      if (qtyNumber) qtyNumber.textContent = qty + ' units';

      const selectedMethodRadio = document.querySelector('input[name="calcMethod"]:checked');
      const method = selectedMethodRadio ? selectedMethodRadio.value : 'ceramic-glaze';

      const result = calculateQuote({
        productId: prodId,
        quantity: qty,
        method: method,
        packaging: packagingCheck ? packagingCheck.checked : false,
        customLabel: labelCheck ? labelCheck.checked : false,
        rush: rushCheck ? rushCheck.checked : false
      });

      // Update Summary DOM
      const unitPriceEl = document.getElementById('calcUnitPrice');
      const subtotalEl = document.getElementById('calcSubtotal');
      const setupFeeEl = document.getElementById('calcSetupFee');
      const savingsBadgeEl = document.getElementById('calcSavingsBadge');
      const tierBadgeEl = document.getElementById('calcTierBadge');

      if (unitPriceEl) unitPriceEl.textContent = formatINR(result.unitPrice);
      if (subtotalEl) subtotalEl.textContent = formatINR(result.subtotal);
      if (setupFeeEl) setupFeeEl.textContent = result.isSetupWaived ? 'FREE (₹0.00)' : formatINR(result.setupFee);
      if (savingsBadgeEl) {
        if (result.totalSavings > 0) {
          savingsBadgeEl.style.display = 'inline-block';
          savingsBadgeEl.textContent = `Save ${formatINR(result.totalSavings)} (${result.discountTierPercent}% OFF)`;
        } else {
          savingsBadgeEl.style.display = 'none';
        }
      }
      if (tierBadgeEl) tierBadgeEl.textContent = result.tierName;
    };

    if (qtySlider) qtySlider.addEventListener('input', updateCalc);
    if (productSelect) productSelect.addEventListener('change', updateCalc);
    document.querySelectorAll('input[name="calcMethod"]').forEach(r => r.addEventListener('change', updateCalc));
    if (packagingCheck) packagingCheck.addEventListener('change', updateCalc);
    if (labelCheck) labelCheck.addEventListener('change', updateCalc);
    if (rushCheck) rushCheck.addEventListener('change', updateCalc);

    updateCalc();
  }

  /* ------------------------------------------------------------------------
     5. TEMPLATES SECTION
     ------------------------------------------------------------------------ */
  initTemplates() {
    const grid = document.getElementById('templatesGrid');
    if (!grid) return;

    grid.innerHTML = TEMPLATES.map(t => `
      <div class="template-card">
        <div class="template-preview">
          <canvas class="template-thumb-canvas" width="160" height="160" data-template="${t.id}"></canvas>
          <span class="template-badge">${t.category}</span>
        </div>
        <div class="template-body">
          <div class="template-title">${t.name}</div>
          <div class="template-desc">Pre-configured typography & badge tailored for ${t.targetProduct.replace('-', ' ')}.</div>
          <button class="btn btn-sm btn-outline load-template-btn" data-template="${t.id}" style="width: 100%;">
            ✨ Customize in Studio
          </button>
        </div>
      </div>
    `).join('');

    // Render Canvas Previews for each template
    grid.querySelectorAll('.template-thumb-canvas').forEach(canvas => {
      const tmplId = canvas.dataset.template;
      const tmpl = TEMPLATES.find(t => t.id === tmplId);
      if (!tmpl) return;

      const tc = document.createElement('canvas');
      tc.width = 360;
      tc.height = 240;
      const te = new DesignEditor(tc);
      te.showPrintGuide = false;

      tmpl.elements.forEach(el => {
        if (el.type === 'badge') {
          const b = te.addBadge(el.badgeType);
          b.x = el.x; b.y = el.y; b.size = el.size; b.color = el.color;
        } else if (el.type === 'text') {
          const t = te.addText(el.text, el);
          t.x = el.x; t.y = el.y;
        }
      });
      te.render();

      MockupRenderer.render(tmpl.targetProduct, canvas, tc, {
        color: tmpl.productColor || '#FFFFFF',
        angle: 'front'
      });
    });

    // Template Button click
    grid.querySelectorAll('.load-template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tmplId = e.currentTarget.dataset.template;
        const tmpl = TEMPLATES.find(t => t.id === tmplId);
        if (tmpl) {
          this.openStudio(tmpl.targetProduct, tmplId);
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     6. CART & EVENT BINDINGS
     ------------------------------------------------------------------------ */
  bindEvents() {
    // Open Studio buttons across site
    document.querySelectorAll('.open-studio-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const prod = e.currentTarget.dataset.product || 'ceramic-mug';
        this.openStudio(prod);
      });
    });

    // Close Studio Modal
    const closeModalBtn = document.getElementById('closeStudioBtn');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', () => {
        document.getElementById('studioModal').classList.remove('active');
      });
    }

    // Studio Product Select Switcher
    const studioProdSelect = document.getElementById('studioProductSelect');
    if (studioProdSelect) {
      studioProdSelect.addEventListener('change', (e) => {
        this.currentProduct = e.target.value;
        const prodConfig = PRODUCT_CATALOG[this.currentProduct];
        this.currentColor = prodConfig.defaultColor || '#FFFFFF';
        this.currentFinish = prodConfig.methods[0] || 'ceramic-glaze';
        this.renderStudioFinishesList(prodConfig);
        this.renderStudioColorSwatches(prodConfig);
        this.updateStudioMockup();
      });
    }

    // Studio Angle Controls
    document.querySelectorAll('.angle-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.angle-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentAngle = e.currentTarget.dataset.angle;
        this.updateStudioMockup();
      });
    });

    // Studio Tool Tab Switching (Text, Emblem, Upload)
    document.querySelectorAll('.tool-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tool-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tool-panel').forEach(p => p.style.display = 'none');
        e.currentTarget.classList.add('active');
        const target = document.getElementById(e.currentTarget.dataset.panel);
        if (target) target.style.display = 'flex';
      });
    });

    // Add Text Button
    const addTextBtn = document.getElementById('addTextBtn');
    if (addTextBtn) {
      addTextBtn.addEventListener('click', () => {
        const txtInput = document.getElementById('studioTextInput');
        const fontSelect = document.getElementById('fontFamilySelect');
        const curveCheck = document.getElementById('curveTextCheck');
        const txt = txtInput && txtInput.value ? txtInput.value : 'CUSTOM TEXT';
        this.editor.addText(txt, {
          fontFamily: fontSelect ? fontSelect.value : 'Outfit',
          isCurved: curveCheck ? curveCheck.checked : false,
          color: '#111827'
        });
      });
    }

    // Live Text Input Change
    const textInput = document.getElementById('studioTextInput');
    if (textInput) {
      textInput.addEventListener('input', (e) => {
        if (this.editor.selectedElement && this.editor.selectedElement.type === 'text') {
          this.editor.selectedElement.text = e.target.value;
          this.editor.render();
          this.updateStudioMockup();
        }
      });
    }

    // Curved Text Checkbox
    const curveCheck = document.getElementById('curveTextCheck');
    if (curveCheck) {
      curveCheck.addEventListener('change', (e) => {
        if (this.editor.selectedElement && this.editor.selectedElement.type === 'text') {
          this.editor.selectedElement.isCurved = e.target.checked;
          this.editor.render();
          this.updateStudioMockup();
        }
      });
    }

    // Font Family Select
    const fontSelect = document.getElementById('fontFamilySelect');
    if (fontSelect) {
      fontSelect.addEventListener('change', (e) => {
        if (this.editor.selectedElement && this.editor.selectedElement.type === 'text') {
          this.editor.selectedElement.fontFamily = e.target.value;
          this.editor.render();
          this.updateStudioMockup();
        }
      });
    }

    // Color Swatches for Thread/Print Text
    document.querySelectorAll('.print-color-swatch').forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        const color = e.currentTarget.dataset.color;
        if (this.editor.selectedElement) {
          this.editor.selectedElement.color = color;
          this.editor.render();
          this.updateStudioMockup();
        }
      });
    });

    // Add Stock Badges
    document.querySelectorAll('.add-badge-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const badgeType = e.currentTarget.dataset.badge;
        this.editor.addBadge(badgeType);
      });
    });

    // Logo Upload
    const logoUploadInput = document.getElementById('logoUploadInput');
    if (logoUploadInput) {
      logoUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            this.editor.addImage(img, file.name);
            this.showToast('Logo uploaded successfully!');
          };
          img.src = event.target.result;
        };
        reader.readAsDataURL(file);
      });
    }

    // Delete Selected Element
    const deleteBtn = document.getElementById('deleteSelectedBtn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.editor.deleteSelected();
      });
    }

    // Export Proof PNG
    const exportBtn = document.getElementById('exportProofBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const dataUrl = this.studioMockupCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `CupsAndCaps_Proof_${this.currentProduct}.png`;
        link.href = dataUrl;
        link.click();
        this.showToast('High-Res Proof downloaded!');
      });
    }

    // Add to Cart from Studio
    const addToCartBtn = document.getElementById('studioAddToCartBtn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => {
        const prod = PRODUCT_CATALOG[this.currentProduct];
        const mockupUrl = this.studioMockupCanvas.toDataURL('image/png');

        this.cart.push({
          id: 'cart_' + Date.now(),
          productId: this.currentProduct,
          productName: prod.name,
          color: this.currentColor,
          finish: this.currentFinish,
          quantity: 24,
          unitPrice: prod.basePrice,
          mockupUrl: mockupUrl
        });

        this.updateCartUI();
        document.getElementById('studioModal').classList.remove('active');
        this.toggleCartDrawer(true);
        this.showToast(`Added 24x ${prod.name} to Cart!`);
      });
    }

    // Cart Drawer Toggle
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const closeCartBtn = document.getElementById('closeCartBtn');
    const cartOverlay = document.getElementById('cartOverlay');

    if (cartToggleBtn) cartToggleBtn.addEventListener('click', () => this.toggleCartDrawer(true));
    if (closeCartBtn) closeCartBtn.addEventListener('click', () => this.toggleCartDrawer(false));
    if (cartOverlay) {
      cartOverlay.addEventListener('click', (e) => {
        if (e.target === cartOverlay) this.toggleCartDrawer(false);
      });
    }

    // Apply Coupon Code
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    if (applyCouponBtn) {
      applyCouponBtn.addEventListener('click', () => {
        const input = document.getElementById('cartCouponInput');
        const code = input ? input.value.trim().toUpperCase() : '';
        if (code === 'LIGHT15' || code === 'CUPSCAPS10') {
          this.couponApplied = true;
          this.discountPercent = code === 'LIGHT15' ? 0.15 : 0.10;
          this.updateCartUI();
          this.showToast(`Coupon ${code} applied! Saved ${(this.discountPercent * 100)}%`);
        } else {
          this.showToast('Invalid promo code. Try LIGHT15', 'error');
        }
      });
    }

    // Checkout Modal Demo
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (this.cart.length === 0) {
          this.showToast('Your cart is empty!');
          return;
        }
        alert('🎉 Order Received! Thank you for ordering with Cups & Caps Design. Your digital vector proof has been sent to production queue.');
        this.cart = [];
        this.updateCartUI();
        this.toggleCartDrawer(false);
      });
    }

    // Sample Kit Request Modal
    const sampleKitBtn = document.getElementById('sampleKitBtn');
    if (sampleKitBtn) {
      sampleKitBtn.addEventListener('click', () => {
        alert('📦 Free Sample Box Requested! You will receive: 1x Ceramic Mug with Kiln Glaze, 1x Vintage Dad Hat with 3D Puff Embroidery, and Swatch Booklet. Dispatched via Express Courier across India.');
      });
    }
  }

  toggleCartDrawer(open) {
    const overlay = document.getElementById('cartOverlay');
    if (overlay) {
      if (open) overlay.classList.add('active');
      else overlay.classList.remove('active');
    }
  }

  updateCartUI() {
    const badge = document.getElementById('cartBadge');
    const itemsList = document.getElementById('cartItemsList');
    const subtotalEl = document.getElementById('cartSubtotalAmount');
    const totalEl = document.getElementById('cartTotalAmount');
    const discountRow = document.getElementById('cartDiscountRow');
    const discountAmountEl = document.getElementById('cartDiscountAmount');

    const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (badge) badge.textContent = totalCount;

    if (itemsList) {
      if (this.cart.length === 0) {
        itemsList.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <div style="font-size: 2.5rem; margin-bottom: 12px;">☕🧢</div>
            <p>Your custom drinkware & headwear bag is empty.</p>
          </div>
        `;
      } else {
        itemsList.innerHTML = this.cart.map((item, index) => `
          <div class="cart-item-card">
            <div class="cart-item-img">
              <img src="${item.mockupUrl}" alt="Mockup">
            </div>
            <div class="cart-item-details">
              <h4>${item.productName}</h4>
              <div class="item-meta">
                <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${item.color}; border:1px solid #ccc; vertical-align:middle; margin-right:4px;"></span>
                ${item.finish.replace('-', ' ')}
              </div>
              <div class="cart-item-controls">
                <div class="qty-stepper">
                  <button class="cart-qty-dec" data-index="${index}">-</button>
                  <span>${item.quantity}</span>
                  <button class="cart-qty-inc" data-index="${index}">+</button>
                </div>
                <div style="font-weight: 800; color: var(--text-heading);">
                  ${formatINR(item.unitPrice * item.quantity)}
                </div>
              </div>
            </div>
          </div>
        `).join('');

        // Wire Stepper Buttons
        itemsList.querySelectorAll('.cart-qty-dec').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index, 10);
            if (this.cart[idx].quantity > 12) {
              this.cart[idx].quantity -= 12;
            } else {
              this.cart.splice(idx, 1);
            }
            this.updateCartUI();
          });
        });

        itemsList.querySelectorAll('.cart-qty-inc').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(e.currentTarget.dataset.index, 10);
            this.cart[idx].quantity += 12;
            this.updateCartUI();
          });
        });
      }
    }

    // Compute Totals
    let rawSubtotal = this.cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    let discount = this.couponApplied ? rawSubtotal * this.discountPercent : 0;
    let finalTotal = Math.max(0, rawSubtotal - discount);

    if (subtotalEl) subtotalEl.textContent = formatINR(rawSubtotal);
    if (totalEl) totalEl.textContent = formatINR(finalTotal);

    if (discountRow) {
      if (this.couponApplied && discount > 0) {
        discountRow.style.display = 'flex';
        if (discountAmountEl) discountAmountEl.textContent = `-${formatINR(discount)}`;
      } else {
        discountRow.style.display = 'none';
      }
    }
  }

  showToast(msg, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${type === 'error' ? '⚠️' : '✨'}</span> <span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.app = new CupsAndCapsApp();
});
