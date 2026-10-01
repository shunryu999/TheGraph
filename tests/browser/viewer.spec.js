const { test: base, expect } = require('@playwright/test');
const { PNG } = require('pngjs');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');
const viewer = process.env.VIEWER_PATH || '/prototypes/stratasphere-viewer/';
const catalog = require('../../data/catalog.json').datasets;
const dataset = entry => JSON.parse(fs.readFileSync(path.join(root, 'data', entry.path), 'utf8'));

const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      // A checkout probes the published data path before trying ../../data/.
      if (message.type() === 'error' && !message.text().includes('404 (File not found)')) errors.push(message.text());
    });
    page.on('response', response => {
      const pathname = new URL(response.url()).pathname;
      if (response.status() >= 400 && !['/prototypes/data/catalog.json', '/favicon.ico'].includes(pathname)) {
        errors.push(`${response.status()} ${pathname}`);
      }
    });
    // Use the exact production versions without relying on third-party CDNs in CI.
    await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', route =>
      route.fulfill({ path: require.resolve('three/build/three.min.js'), contentType: 'application/javascript' }));
    await page.route('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js', route =>
      route.fulfill({ path: require.resolve('three/examples/js/controls/OrbitControls.js'), contentType: 'application/javascript' }));
    await page.route('https://fonts.googleapis.com/**', route => route.fulfill({ body: '', contentType: 'text/css' }));
    await use(page);
    expect(errors, 'No page, console or resource errors').toEqual([]);
  },
});

async function expectDrawing(page) {
  await expect(page.locator('#fallback')).toBeHidden();
  await expect.poll(() => page.locator('#labels .lab:visible').count(), { message: 'Visible diagram labels' }).toBeGreaterThan(0);
  const canvas = page.locator('#view canvas');
  await expect(canvas).toBeVisible();
  // Inspect only the canvas: HTML labels cannot make a blank WebGL render pass.
  await expect.poll(async () => {
    const png = PNG.sync.read(await canvas.screenshot());
    let ink = 0, paper = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i + 3] > 0 && Math.min(png.data[i], png.data[i + 1], png.data[i + 2]) < 200) ink++;
      if (png.data[i] > 240 && png.data[i + 1] > 230 && png.data[i + 2] > 220) paper++;
    }
    return ink > 500 && paper > png.width * png.height * 0.1;
  }, { message: 'Canvas contains both drawn marks and paper, not a blank field' }).toBe(true);
}

for (const entry of catalog) {
  test(`loads and draws ${entry.id}`, async ({ page }) => {
    const data = dataset(entry);
    await page.goto(`${viewer}?d=${entry.id}`);
    await expect(page.locator('#ds')).toHaveValue(entry.id);
    await expect(page.locator('#title')).toHaveText(data.meta.title);
    await expect(page.locator('#list .item')).toHaveCount(data.nodes.length);
    await expect(page.locator('#labels .lab')).toHaveCount(data.nodes.length);
    await expect(page.locator('#err')).toBeHidden();
    await expectDrawing(page);
    const picked = data.nodes.find(node => node.id === data.meta.defaultPick) || data.nodes[0];
    await page.locator(`#list [data-id="${picked.id}"]`).click();
    await expect(page.locator('#card h2')).toHaveText(picked.label);
    await expect(page).toHaveURL(new RegExp(`pick=${picked.id}(?:&|$)`));
  });

  test(`first time step moves one shell increment in ${entry.id}`, async ({ page }) => {
    // Inspect the real CPU scale and exercise the real vertex shader without a
    // production test API. This probe exists only in the response used by this test.
    await page.route(`**${viewer}?d=${entry.id}`, async route => {
      const response = await route.fetch();
      const html = (await response.text()).replace(
        '  theme(); size();',
        '  window.radialProbe = { radiusAt, uniforms, matP, renderer };\n  theme(); size();');
      await route.fulfill({ response, body: html });
    });
    await page.goto(`${viewer}?d=${entry.id}`);
    await expect(page.locator('#ds')).toHaveValue(entry.id);
    await expect(page.locator('#title')).toHaveText(dataset(entry).meta.title);
    const samples = await page.evaluate(() => {
      const { radiusAt, uniforms, matP, renderer } = window.radialProbe;
      const slider = document.getElementById('tnow'), gradient = document.getElementById('grad');
      const start = +slider.min, end = +slider.max, step = +slider.step;
      // Read the radius computed by the actual production vertex shader back from
      // the GPU. A separate fragment shader encodes that radius as a red value.
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute([1, 0, 0], 3));
      geometry.setAttribute('dir', new THREE.Float32BufferAttribute([1, 0, 0], 3));
      geometry.setAttribute('gen', new THREE.Float32BufferAttribute([start], 1));
      geometry.setAttribute('cls', new THREE.Float32BufferAttribute([1], 1));
      const material = new THREE.ShaderMaterial({
        uniforms, vertexShader: matP.vertexShader,
        fragmentShader: 'varying vec3 vPos; void main(){ gl_FragColor = vec4(length(vPos), 0.0, 0.0, 1.0); }',
      });
      const scene = new THREE.Scene();
      const point = new THREE.Points(geometry, material); point.frustumCulled = false; scene.add(point);
      const camera = new THREE.OrthographicCamera(-2, 2, 2, -2, 0.1, 10);
      camera.position.z = 4;
      const target = new THREE.WebGLRenderTarget(64, 64);
      const oldTarget = renderer.getRenderTarget(), oldColor = renderer.getClearColor(new THREE.Color()), oldAlpha = renderer.getClearAlpha();
      function at(time) {
        slider.value = time; slider.dispatchEvent(new Event('input', { bubbles: true }));
        renderer.setRenderTarget(target); renderer.setClearColor(0x000000, 0); renderer.render(scene, camera);
        const pixels = new Uint8Array(64 * 64 * 4); renderer.readRenderTargetPixels(target, 0, 0, 64, 64, pixels);
        let red = -1;
        for (let i = 0; i < pixels.length; i += 4) if (pixels[i + 3]) red = Math.max(red, pixels[i]);
        return { cpu: radiusAt(start), gpu: red / 255, present: radiusAt(uniforms.tNow.value) };
      }
      try {
        const scales = [0, 10, 50].map(value => {
          gradient.value = value; gradient.dispatchEvent(new Event('input', { bubbles: true }));
          return { gradient: value / 10, initial: at(start), first: at(start + step), second: at(start + 2 * step), final: at(end), reverse: at(start) };
        });
        return { steps: (end - start) / step, scales };
      } finally {
        renderer.setRenderTarget(oldTarget); renderer.setClearColor(oldColor, oldAlpha);
        geometry.dispose(); material.dispose(); target.dispose();
      }
    });
    for (const scale of samples.scales) {
      expect(scale.initial.cpu).toBeCloseTo(1, 6);
      expect(scale.first.cpu, `first step at gradient ${scale.gradient}`).toBeGreaterThan(0.5);
      expect(scale.first.cpu).toBeLessThan(1);
      expect(scale.second.cpu).toBeLessThan(scale.first.cpu);
      expect(scale.second.cpu).toBeGreaterThan(scale.final.cpu);
      expect(scale.final.cpu).toBeCloseTo(0.06, 6);
      expect(scale.reverse.cpu).toBeCloseTo(1, 6);
      for (const sample of [scale.initial, scale.first, scale.second, scale.final, scale.reverse]) {
        expect(sample.gpu, 'GPU geometry agrees with labels and hatch boundaries').toBeCloseTo(sample.cpu, 2);
        expect(sample.present).toBeCloseTo(1, 6);
      }
    }
    // With uniform spacing, the first step consumes exactly one of the dataset's
    // radial increments; the second consumes two, regardless of date units.
    expect(samples.scales[0].first.cpu).toBeCloseTo(1 - 0.94 / samples.steps, 6);
    expect(samples.scales[0].second.cpu).toBeCloseTo(1 - 2 * 0.94 / samples.steps, 6);
  });
}

test('restores a shared lineage and month', async ({ page }) => {
  await page.goto(`${viewer}?d=sars-cov-2&pick=20I&t=2021-06`);
  await expect(page.locator('#ds')).toHaveValue('sars-cov-2');
  await expect(page.locator('#oT')).toHaveText('Jun 2021');
  const alpha = dataset(catalog.find(entry => entry.id === 'sars-cov-2')).nodes.find(node => node.id === '20I');
  await expect(page.locator('#card h2')).toHaveText(alpha.label);
  await expect(page.locator('#tour')).toBeHidden();
  await page.reload();
  await expect(page.locator('#oT')).toHaveText('Jun 2021');
  await expect(page.locator('#card h2')).toHaveText(alpha.label);
  await expectDrawing(page);
});

test('first visit tours all four datasets, goes back, finishes and can replay', async ({ page }) => {
  await page.goto(viewer);
  await expect(page.locator('#tourProgress')).toHaveText('Guided tour · 1 of 4');
  await expect(page.locator('#tourBack')).toBeDisabled();
  await expect(page.locator('#spin')).not.toBeChecked();
  await page.screenshot({ path: 'test-results/tour-desktop.png', fullPage: true });
  for (const [index, id] of ['printing', 'unix', 'sars-cov-2'].entries()) {
    await page.getByRole('button', { name: 'Next stop', exact: true }).click();
    await expect(page.locator('#ds')).toHaveValue(id);
    await expect(page.locator('#tourProgress')).toHaveText(`Guided tour · ${index + 2} of 4`);
    await expect(page.locator('#tourTitle')).toBeFocused();
    await expectDrawing(page);
  }
  await page.getByRole('button', { name: 'Previous stop' }).click();
  await expect(page.locator('#ds')).toHaveValue('unix');
  await page.getByRole('button', { name: 'Next stop', exact: true }).click();
  await page.getByRole('button', { name: 'Finish tour' }).click();
  await expect(page.locator('#tour')).toBeHidden();
  await expect(page.locator('#bTour')).toBeFocused();
  await page.goto(viewer);
  await expect(page.locator('#bTour')).toBeVisible();
  await expect(page.locator('#tour')).toBeHidden();
  await page.locator('#bTour').click();
  await expect(page.locator('#tourProgress')).toHaveText('Guided tour · 1 of 4');
});

test('tour fits a phone and can be skipped with the keyboard', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(viewer);
  await expect(page.locator('#tourProgress')).toHaveText('Guided tour · 1 of 4');
  await page.screenshot({ path: 'test-results/tour-phone.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#tourNext').focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('#tourSkip')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#tour')).toBeHidden();
  await expect(page.locator('#bTour')).toBeFocused();
  await page.goto(viewer);
  await expect(page.locator('#bTour')).toBeVisible();
  await expect(page.locator('#tour')).toBeHidden();
});

test('tour works when preference storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', {
    get() { throw new DOMException('Storage disabled', 'SecurityError'); },
  }));
  await page.goto(viewer);
  await expect(page.locator('#tourProgress')).toHaveText('Guided tour · 1 of 4');
  await page.locator('#tourSkip').click();
  await expect(page.locator('#tour')).toBeHidden();
  await page.locator('#bTour').click();
  await expect(page.locator('#tourProgress')).toHaveText('Guided tour · 1 of 4');
});

test('a manual dataset choice wins over an in-flight tour stop', async ({ page }) => {
  await page.goto(viewer);
  await expect(page.locator('#tourProgress')).toHaveText('Guided tour · 1 of 4');
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const printing = catalog.find(entry => entry.id === 'printing');
  await page.route(`**/${printing.path}`, async route => {
    await gate;
    await route.fulfill({ json: dataset(printing) });
  });
  const request = page.waitForRequest(`**/${printing.path}`);
  await page.locator('#tourNext').click();
  await request;
  await page.locator('#ds').selectOption('unix');
  await expect(page.locator('#dsBlurb')).toHaveText(catalog.find(entry => entry.id === 'unix').blurb);
  const response = page.waitForResponse(`**/${printing.path}`);
  release();
  await response;
  await expectDrawing(page);
  await expect(page.locator('#title')).toHaveText(dataset(catalog.find(entry => entry.id === 'unix')).meta.title);
  await expect(page.locator('#tour')).toBeHidden();
});

test('a failed stop leaves the current view intact and can be retried', async ({ page }) => {
  await page.goto(viewer);
  await expect(page.locator('#tourProgress')).toHaveText('Guided tour · 1 of 4');
  const printing = catalog.find(entry => entry.id === 'printing');
  await page.route(`**/${printing.path}`, route => route.fulfill({ json: {} }), { times: 1 });
  await page.locator('#tourNext').click();
  await expect(page.locator('#tourError')).toBeVisible();
  await expect(page.locator('#title')).toHaveText(dataset(catalog[0]).meta.title);
  await page.getByRole('button', { name: 'Retry stop' }).click();
  await expect(page.locator('#tourProgress')).toHaveText('Guided tour · 2 of 4');
  await expect(page.locator('#tourError')).toBeHidden();
  await expectDrawing(page);
});

test('the worked spreadsheet example loads as a local file', async ({ page }) => {
  const { execFileSync } = require('node:child_process');
  const buffer = execFileSync('python3', [path.join(root, 'docs/examples/csv-to-lineage/convert.py')]);
  await page.goto(viewer);
  await expect(page.locator('#tourProgress')).toHaveText('Guided tour · 1 of 4');
  await page.locator('#file').setInputFiles({ name: 'workshop-lineage.json', mimeType: 'application/json', buffer });
  await expect(page.locator('#title')).toHaveText('Three fictional workshops (CSV example)');
  await expect(page.locator('#card h2')).toHaveText('Hill workshop');
  await expect(page.locator('#list .item')).toHaveCount(3);
  await expect(page.locator('#tour')).toBeHidden();
  await expectDrawing(page);
});

test('deep-time comparisons show age limits, sources and dataset defaults', async ({ page }) => {
  await page.goto(`${viewer}?d=hominins&pick=omo-i&t=233000`);
  await expect(page.locator('#oT')).toHaveText('233 ka');
  await expect(page.locator('#grad')).toHaveValue('30');
  await expect(page.locator('#oGrad')).toHaveText('3.0');
  await expect(page.locator('#card')).toContainText('Older than a 233 ± 22 ka dated horizon');
  await expect(page.locator('#card')).toContainText('lower-bound display anchor');
  await expect(page.locator('#card .lineage')).toContainText('No comparison link');
  await expect(page.locator('#card a[href="https://doi.org/10.1038/s41586-021-04275-8"]')).toBeVisible();
  await page.reload();
  await expect(page.locator('#oT')).toHaveText('233 ka');
  await page.locator('#list [data-id="knm-wt-15000"]').click();
  await expect(page.locator('#card')).toContainText('Compared with');
  await expect(page.locator('#card')).toContainText('do not establish ancestry');
  await expect(page.locator('#card')).not.toContainText('Led on to');
  await expect(page.locator('#card')).not.toContainText('Traced back');
  await page.locator('#bClear').click();
  await expect(page.locator('#card')).toContainText('not a complete human family tree');
  await expect(page.locator('#keyRec')).toBeHidden();
  await expect(page.locator('#keyInf')).toContainText('comparison links, not ancestry');
  await expect(page.locator('#keySel')).toContainText('comparison trace');
  await page.locator('#ds').selectOption('ias');
  await expect(page.locator('#grad')).toHaveValue('10');
  await expect(page.locator('#oGrad')).toHaveText('1.0');
  await expect(page.locator('#keyRec')).toBeVisible();
  await expect(page.locator('#keySel')).toHaveText('the lineage you picked');
  await expect(page.locator('#card')).toContainText('Traced back');
});

const fossilMedia = require('../../data/hominin-fossils/media.json');
const fossils = dataset(catalog.find(entry => entry.id === 'hominins')).nodes;

test('every fossil shows its own drawing or an explicit missing-photo state', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto(`${viewer}?d=hominins&pick=tm-266-01-060-1`);
  for (const fossil of fossils) {
    await page.locator(`#list [data-id="${fossil.id}"]`).click();
    await expect(page.locator('#fossilName')).toHaveText(fossil.label);
    await expect(page.locator('#fossilSource')).toHaveAttribute('href', fossil.sources[0]);
    const media = fossilMedia.specimens[fossil.id];
    if (media.status === 'unavailable') {
      await expect(page.locator('#fossilPanel')).toHaveAttribute('data-state', 'unavailable');
      await expect(page.locator('#fossilCanvas')).toBeHidden();
      await expect(page.locator('#fossilStatus')).toContainText('no photograph');
    } else {
      await expect(page.locator('#fossilPanel')).toHaveAttribute('data-state', 'ready');
      await expect(page.locator('#fossilCanvas')).toHaveAttribute('aria-label', `Line drawing from a photograph of ${fossil.label}. ${media.alt}`);
      await expect(page.locator('#fossilCredit')).toHaveText(media.credit);
      // Real pixels in each of the 29 drawings, not just a populated caption.
      const marks = await page.locator('#fossilCanvas').evaluate(c => {
        const data = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        let ink = 0, clear = 0;
        for (let i = 3; i < data.length; i += 4) { if (data[i] > 40) ink++; if (data[i] === 0) clear++; }
        return { ink, clear, area: c.width * c.height };
      });
      expect(marks.ink, fossil.id).toBeGreaterThan(100);
      expect(marks.clear, fossil.id).toBeGreaterThan(marks.area * .35);
    }
  }
});

test('fossil controls, selection clearing and dataset changes stay in sync', async ({ page }) => {
  await page.goto(`${viewer}?d=hominins&pick=tm-266-01-060-1`);
  const panel = page.locator('#fossilPanel'), canvas = page.locator('#fossilCanvas');
  await expect(panel).toHaveAttribute('data-state', 'ready');
  const position = await page.evaluate(() => ({fossil:document.getElementById('fossilPanel').getBoundingClientRect().bottom, dataset:document.querySelector('.pick-ds').getBoundingClientRect().top}));
  expect(position.fossil).toBeLessThan(position.dataset);
  const line = await canvas.evaluate(c => c.toDataURL());
  await page.locator('#fossilPhoto').click();
  await expect(page.locator('#fossilPhoto')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#fossilDetailRow')).toBeHidden();
  expect(await canvas.evaluate(c => c.toDataURL())).not.toEqual(line);
  await page.locator('#fossilLine').click();
  await page.locator('#fossilZoomIn').click();
  await expect(page.locator('#fossilReset')).toHaveText('1.5× · Fit');
  const time = await page.locator('#oT').textContent();
  await canvas.focus(); await page.keyboard.press('ArrowRight');
  await expect(page.locator('#oT')).toHaveText(time);
  await page.keyboard.press('0');
  await expect(page.locator('#fossilReset')).toHaveText('Fit');
  await page.locator('#fossilDetail').fill('10');
  expect(await canvas.evaluate(c => c.toDataURL())).not.toEqual(line);
  await page.locator('#bClear').click();
  await expect(panel).toBeVisible();
  await expect(page.locator('#fossilName')).toHaveText('Select a fossil');
  await expect(canvas).toBeHidden();
  await expect(page.locator('#fossilSource')).toBeHidden();
  await page.locator('#ds').selectOption('ias');
  await expect(panel).toBeHidden();
  await page.locator('#ds').selectOption('hominins');
  await expect(panel).toHaveAttribute('data-state', 'ready');
  await expect(page.locator('#fossilName')).toHaveText('KNM-WT 15000');
});

test('a slow old fossil image cannot replace the current selection', async ({ page }) => {
  let release;
  const held = new Promise(resolve => { release = resolve; });
  await page.route('**/images/tm-266-01-060-1.webp', async route => { await held; await route.continue(); });
  const requested = page.waitForRequest('**/images/tm-266-01-060-1.webp');
  await page.goto(`${viewer}?d=hominins&pick=tm-266-01-060-1`);
  await requested;
  await page.locator('#list [data-id="knm-wt-15000"]').click();
  await expect(page.locator('#fossilPanel')).toHaveAttribute('data-state', 'ready');
  const current = await page.locator('#fossilCanvas').evaluate(c => c.toDataURL());
  const responded = page.waitForResponse('**/images/tm-266-01-060-1.webp');
  release(); await responded;
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  await expect(page.locator('#fossilName')).toHaveText('KNM-WT 15000');
  expect(await page.locator('#fossilCanvas').evaluate(c => c.toDataURL())).toEqual(current);
});

test('an unreadable photo leaves a source link and recovers on the next selection', async ({ page }) => {
  await page.route('**/images/knm-wt-15000.webp', r => r.fulfill({status:200,contentType:'image/webp',body:'invalid image'}));
  await page.goto(`${viewer}?d=hominins`);
  await expect(page.locator('#fossilPanel')).toHaveAttribute('data-state', 'error');
  await expect(page.locator('#fossilCanvas')).toBeHidden();
  await expect(page.locator('#fossilStatus')).toContainText('could not be loaded');
  await expect(page.locator('#fossilSource')).toBeVisible();
  await page.unroute('**/images/knm-wt-15000.webp');
  await page.locator('#list [data-id="knm-wt-15000"]').click();
  await expect(page.locator('#fossilPanel')).toHaveAttribute('data-state', 'ready');
});

test('fossil view fits a narrow screen and draws in the dark theme', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto(`${viewer}?d=hominins&pick=tm-266-01-060-1`);
  await expect(page.locator('#fossilPanel')).toHaveAttribute('data-state', 'ready');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.emulateMedia({colorScheme:'dark'});
  await expect.poll(() => page.locator('#fossilCanvas').evaluate(c => {
    const data = c.getContext('2d').getImageData(0,0,c.width,c.height).data;
    let marks=0; for(let i=0;i<data.length;i+=4) if(data[i]>200 && data[i+3]>100) marks++;
    return marks;
  })).toBeGreaterThan(100);
  await page.locator('#fossilPanel').screenshot({path:test.info().outputPath('fossil-mobile-dark.png')});
});
