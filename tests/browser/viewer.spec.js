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
