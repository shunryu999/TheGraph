/* Photograph-based fossil studies. Source files stay unchanged; the browser
   traces image edges, not inferred anatomy or a reconstructed 3D surface. */
(() => {
  const canvas = () => document.createElement('canvas');

  function prepare(image, crop = [0, 0, 1, 1]) {
    const [x, y, w, h] = crop;
    const scale = Math.min(1, 800 / Math.max(image.naturalWidth * w, image.naturalHeight * h));
    const photo = canvas();
    photo.width = Math.max(3, Math.round(image.naturalWidth * w * scale));
    photo.height = Math.max(3, Math.round(image.naturalHeight * h * scale));
    const ctx = photo.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, x * image.naturalWidth, y * image.naturalHeight,
      w * image.naturalWidth, h * image.naturalHeight, 0, 0, photo.width, photo.height);
    const W = photo.width, H = photo.height, pixels = ctx.getImageData(0, 0, W, H).data;
    const grey = new Float32Array(W * H), temp = new Float32Array(W * H), blur = new Float32Array(W * H);
    for (let i = 0; i < grey.length; i++) grey[i] = .2126 * pixels[i * 4] + .7152 * pixels[i * 4 + 1] + .0722 * pixels[i * 4 + 2];
    // A small separable Gaussian removes photographic grain before tracing.
    const kernel = [1, 4, 6, 4, 1];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let value = 0;
      for (let k = -2; k <= 2; k++) value += grey[y * W + Math.max(0, Math.min(W - 1, x + k))] * kernel[k + 2];
      temp[y * W + x] = value / 16;
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      let value = 0;
      for (let k = -2; k <= 2; k++) value += temp[Math.max(0, Math.min(H - 1, y + k)) * W + x] * kernel[k + 2];
      blur[y * W + x] = value / 16;
    }
    const magnitude = new Float32Array(W * H), direction = new Uint8Array(W * H);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = y * W + x;
      const gx = -blur[i - W - 1] + blur[i - W + 1] - 2 * blur[i - 1] + 2 * blur[i + 1] - blur[i + W - 1] + blur[i + W + 1];
      const gy = -blur[i - W - 1] - 2 * blur[i - W] - blur[i - W + 1] + blur[i + W - 1] + 2 * blur[i + W] + blur[i + W + 1];
      magnitude[i] = Math.hypot(gx, gy);
      direction[i] = (Math.round(Math.atan2(gy, gx) / (Math.PI / 4)) + 4) % 4;
    }
    // Non-maximum suppression keeps contours one image pixel wide.
    const thin = new Float32Array(W * H), offsets = [1, W + 1, W, W - 1];
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) {
      const i = y * W + x, d = offsets[direction[i]], m = magnitude[i];
      if (m > magnitude[i - d] && m >= magnitude[i + d]) thin[i] = m;
    }
    return { photo, thin, W, H };
  }

  function trace(prepared, detail) {
    const { thin, W, H } = prepared, high = 90 - detail, low = high * .4;
    const seen = new Uint8Array(W * H), kept = new Uint8Array(W * H), stack = [];
    // Retain weak detail only where it joins a strong edge. Isolated specks drop out.
    for (let i = 0; i < thin.length; i++) {
      if (seen[i] || thin[i] < high) continue;
      const component = []; stack.push(i); seen[i] = 1;
      while (stack.length) {
        const p = stack.pop(); component.push(p);
        for (const d of [-W - 1, -W, -W + 1, -1, 1, W - 1, W, W + 1]) {
          const q = p + d;
          if (q >= 0 && q < thin.length && !seen[q] && thin[q] >= low) { seen[q] = 1; stack.push(q); }
        }
      }
      if (component.length >= 7) for (const p of component) kept[p] = 1;
    }
    const path = new Path2D();
    let left = W, right = 0, top = H, bottom = 0;
    for (let i = 0; i < kept.length; i++) if (kept[i]) {
      const x = i % W, y = Math.floor(i / W);
      left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [-1, 1]]) {
        if (x + dx >= 0 && x + dx < W && kept[i + dx + dy * W]) { path.moveTo(x, y); path.lineTo(x + dx, y + dy); }
      }
    }
    // Fit the traced subject, removing only empty margins from the line view.
    const pad = 16;
    const bounds = left <= right ? [Math.max(0, left - pad), Math.max(0, top - pad), Math.min(W, right + pad + 1), Math.min(H, bottom + pad + 1)] : [0, 0, W, H];
    return { path, bounds };
  }

  window.FossilViewer = class {
    constructor(root) {
      this.root = root;
      this.$ = id => root.querySelector('#' + id);
      this.canvas = this.$('fossilCanvas');
      this.mode = 'line'; this.zoom = 1; this.pan = [0, 0]; this.serial = 0;
      this.cache = new Map(); this.manifests = new Map();
      this.$('fossilLine').onclick = () => this.setMode('line');
      this.$('fossilPhoto').onclick = () => this.setMode('photo');
      this.$('fossilDetail').oninput = () => { if (this.prepared) { this.traced = trace(this.prepared, +this.$('fossilDetail').value); this.draw(); } };
      this.$('fossilZoomIn').onclick = () => this.setZoom(this.zoom + .5);
      this.$('fossilZoomOut').onclick = () => this.setZoom(this.zoom - .5);
      this.$('fossilReset').onclick = () => { this.pan = [0, 0]; this.setZoom(1); };
      this.canvas.onpointerdown = e => {
        if (!this.prepared || this.zoom <= 1) return;
        this.drag = [e.clientX, e.clientY, ...this.pan]; this.canvas.setPointerCapture(e.pointerId);
      };
      this.canvas.onpointermove = e => {
        if (!this.drag) return;
        this.pan = [this.drag[2] + e.clientX - this.drag[0], this.drag[3] + e.clientY - this.drag[1]]; this.draw();
      };
      this.canvas.onpointerup = this.canvas.onpointercancel = this.canvas.onlostpointercapture = () => { this.drag = null; };
      this.canvas.onkeydown = e => {
        e.stopPropagation(); // Fossil navigation must not also scrub the globe.
        if (e.key === '+' || e.key === '=') this.setZoom(this.zoom + .5);
        else if (e.key === '-') this.setZoom(this.zoom - .5);
        else if (e.key === '0') { this.pan = [0, 0]; this.setZoom(1); }
        else if (this.zoom > 1 && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          this.pan[0] += e.key === 'ArrowLeft' ? 20 : e.key === 'ArrowRight' ? -20 : 0;
          this.pan[1] += e.key === 'ArrowUp' ? 20 : e.key === 'ArrowDown' ? -20 : 0; this.draw();
        } else return;
        e.preventDefault(); e.stopPropagation();
      };
      new ResizeObserver(() => this.draw()).observe(this.canvas);
      new MutationObserver(() => this.draw()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => this.draw());
    }

    async show(dataset, node, base) {
      const serial = ++this.serial;
      this.root.hidden = dataset !== 'hominins';
      this.prepared = this.traced = this.image = null; this.pan = [0, 0]; this.zoom = 1; this.drag = null;
      this.canvas.hidden = true; this.$('fossilControls').hidden = true; this.$('fossilDetailRow').hidden = true;
      this.$('fossilCredit').textContent = ''; this.$('fossilSource').hidden = true; this.$('fossilRights').hidden = true;
      this.$('fossilCaption').textContent = ''; this.root.dataset.state = 'empty';
      if (this.root.hidden) return;
      this.$('fossilName').textContent = node ? node.label : 'Select a fossil';
      this.message(node ? 'Loading fossil image…' : 'Choose a fossil on the globe or in the list.');
      if (!node) return;
      const source = node.sources?.find(s => typeof s === 'string' && s.startsWith('https://humanorigins.si.edu/'));
      if (source) { this.$('fossilSource').href = source; this.$('fossilSource').hidden = false; }
      try {
        const url = new URL(base + 'hominin-fossils/media.json', location.href).href;
        if (!this.manifests.has(url)) this.manifests.set(url, fetch(url).then(r => { if (!r.ok) throw new Error('Manifest unavailable'); return r.json(); }).catch(e => { this.manifests.delete(url); throw e; }));
        const manifest = await this.manifests.get(url);
        if (serial !== this.serial) return;
        const media = manifest.specimens[node.id];
        if (!media || media.status !== 'available') {
          this.root.dataset.state = 'unavailable';
          this.message('The Smithsonian page currently has no photograph for this fossil.'); return;
        }
        this.$('fossilCredit').textContent = media.credit;
        this.$('fossilLicense').textContent = media.licenseLabel || 'Image terms';
        this.$('fossilLicense').href = media.licenseURL || manifest.terms;
        this.$('fossilRights').hidden = false;
        const imageURL = new URL(media.image, url).href;
        if (!this.cache.has(imageURL)) {
          const image = new Image(); image.src = imageURL; await image.decode();
          if (serial !== this.serial) return;
          this.cache.set(imageURL, { image, prepared: prepare(image, media.crop) });
          if (this.cache.size > 4) this.cache.delete(this.cache.keys().next().value);
        }
        if (serial !== this.serial) return;
        const cached = this.cache.get(imageURL);
        this.image = cached.image; this.prepared = cached.prepared; this.media = media; this.node = node;
        this.traced = trace(this.prepared, +this.$('fossilDetail').value);
        this.canvas.hidden = false; this.$('fossilControls').hidden = false;
        this.message(''); this.root.dataset.state = 'ready'; this.setMode(this.mode);
      } catch (e) {
        if (serial !== this.serial) return;
        this.root.dataset.state = 'error';
        this.message('This fossil image could not be loaded. The Smithsonian record is still available below.');
      }
    }

    message(text) { this.$('fossilStatus').textContent = text; this.$('fossilStatus').hidden = !text; }
    setMode(mode) {
      this.mode = mode; this.pan = [0, 0]; this.zoom = 1;
      this.$('fossilLine').setAttribute('aria-pressed', mode === 'line');
      this.$('fossilPhoto').setAttribute('aria-pressed', mode === 'photo');
      this.$('fossilDetailRow').hidden = mode !== 'line';
      this.canvas.setAttribute('aria-label', `${mode === 'line' ? 'Line drawing from a photograph of' : 'Photograph of'} ${this.node.label}. ${this.media.alt}`);
      this.$('fossilCaption').textContent = (mode === 'line' ? 'Line study from a photograph. ' : 'Source photograph. ') + (this.media.note || '');
      this.draw();
    }
    setZoom(zoom) { this.zoom = Math.max(1, Math.min(4, zoom)); if (this.zoom === 1) this.pan = [0, 0]; this.draw(); }
    draw() {
      if (!this.prepared || this.root.hidden) return;
      const rect = this.canvas.getBoundingClientRect(); if (!rect.width || !rect.height) return;
      const dpr = Math.min(2, devicePixelRatio || 1);
      this.canvas.width = Math.round(rect.width * dpr); this.canvas.height = Math.round(rect.height * dpr);
      const ctx = this.canvas.getContext('2d'); ctx.scale(dpr, dpr);
      const line = this.mode === 'line';
      const [x1, y1, x2, y2] = line ? this.traced.bounds : [0, 0, this.image.naturalWidth, this.image.naturalHeight];
      const w = x2 - x1, h = y2 - y1, fit = Math.min((rect.width - 28) / w, (rect.height - 28) / h) * this.zoom;
      const maxX = Math.max(0, (w * fit - rect.width + 28) / 2), maxY = Math.max(0, (h * fit - rect.height + 28) / 2);
      this.pan = [Math.max(-maxX, Math.min(maxX, this.pan[0])), Math.max(-maxY, Math.min(maxY, this.pan[1]))];
      const x = (rect.width - w * fit) / 2 + this.pan[0], y = (rect.height - h * fit) / 2 + this.pan[1];
      if (line) {
        ctx.translate(x - x1 * fit, y - y1 * fit); ctx.scale(fit, fit);
        ctx.strokeStyle = getComputedStyle(this.root).getPropertyValue('--ink').trim();
        ctx.lineWidth = .6 / fit; ctx.lineCap = ctx.lineJoin = 'round'; ctx.stroke(this.traced.path);
      } else ctx.drawImage(this.image, x1, y1, w, h, x, y, w * fit, h * fit);
      this.canvas.style.touchAction = this.zoom > 1 ? 'none' : 'auto';
      this.canvas.style.cursor = this.zoom > 1 ? 'grab' : 'default';
      this.$('fossilZoomOut').disabled = this.zoom <= 1; this.$('fossilZoomIn').disabled = this.zoom >= 4;
      this.$('fossilReset').textContent = this.zoom === 1 ? 'Fit' : this.zoom.toFixed(1) + '× · Fit';
    }
  };
})();
