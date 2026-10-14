const { test: base, expect } = require('@playwright/test');
const { PNG } = require('pngjs');
const fs = require('node:fs/promises');

const dimensions = process.env.DIMENSIONS_PATH || '/prototypes/dimensional-reduction/';
const storageKey = 'phylograph.dimensions.examples.v1';
let datasets;
let validateDataset;

const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', response => {
      const pathname = new URL(response.url()).pathname;
      if (response.status() >= 400 && pathname !== '/favicon.ico') {
        errors.push(`${response.status()} ${pathname}`);
      }
    });
    await use(page);
    expect(errors, 'No page, console or resource errors').toEqual([]);
  },
});

test.beforeAll(async () => {
  ({ DATASETS: datasets } = await import('../../prototypes/dimensional-reduction/data.js'));
  ({ validateDataset } = await import('../../prototypes/dimensional-reduction/model.js'));
});

function example(id = 'browser-example') {
  const data = structuredClone(datasets.find(entry => entry.id === 'performed-pattern'));
  data.id = id;
  data.title = 'Imported cultural example';
  return data;
}

async function importExample(page, data, name = 'example.json') {
  await page.locator('#import-file').setInputFiles({
    name,
    mimeType: 'application/json',
    buffer: Buffer.from(typeof data === 'string' ? data : JSON.stringify(data)),
  });
}

async function downloadText(page, trigger) {
  const ready = page.waitForEvent('download');
  await trigger();
  const download = await ready;
  return { name: download.suggestedFilename(), content: await fs.readFile(await download.path(), 'utf8') };
}

async function expectNoOverflow(page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Page fits the viewport').toBe(true);
}

async function expectDiagram(page, data) {
  await expect(page.locator('.node')).toHaveCount(data.nodes.length);
  await expect(page.locator('#connections .connection-path')).toHaveCount(data.edges.length);
  await expect.poll(async () => {
    const png = PNG.sync.read(await page.locator('.node .motif').first().screenshot());
    let ink = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      if (png.data[i + 3] > 0 && Math.min(png.data[i], png.data[i + 1], png.data[i + 2]) < 210) ink++;
    }
    return ink;
  }, { message: 'The SVG motif contains drawn marks' }).toBeGreaterThan(30);
}

for (const id of ['cultural-progression', 'paradise-lost', 'performed-pattern']) {
  test(`dimensional reduction renders and inspects ${id}`, async ({ page }) => {
    const data = datasets.find(entry => entry.id === id);
    await page.goto(`${dimensions}#dataset=${id}`);
    await expect(page.locator('#dataset-title')).toHaveText(data.title);
    await expectDiagram(page, data);
    for (const node of data.nodes) {
      await page.locator(`[data-node="${node.id}"]`).click();
      await expect(page.locator('#inspector h2')).toHaveText(node.label);
      await expect(page.locator('#inspector .summary').first()).toHaveText(node.summary);
      await expect(page).toHaveURL(new RegExp(`node=${node.id}(?:&|$)`));
    }
    await page.locator('#comparison-tab').click();
    await expect(page.locator('#comparison-body tr')).toHaveCount(data.nodes.length);
    await expect(page.locator('#map-panel')).toBeHidden();
    await page.locator(`[data-select-node="${data.nodes[0].id}"]`).click();
    await expect(page.locator('#inspector h2')).toHaveText(data.nodes[0].label);
    await page.reload();
    await expect(page.locator('#comparison-tab')).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('#inspector h2')).toHaveText(data.nodes[0].label);
    await page.locator('#comparison-tab').focus();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator('#map-tab')).toBeFocused();
    await expect(page.locator('#map-panel')).toBeVisible();
  });
}

test('dimensional reduction normalizes a minimal bundled dataset across all views and exports', async ({ page, baseURL }) => {
  const minimal = {
    schemaVersion: 1,
    id: 'minimal-bundled-example',
    title: 'A minimal bundled example',
    kind: 'illustrative',
    description: 'A valid example with every optional field omitted.',
    nodes: [
      { id: 'thought', label: 'A thought', stage: 'psychomeme', dimension: null, form: 'Mental pattern', summary: 'An imagined pattern.', evidence: 'illustrative' },
      { id: 'text', label: 'A text', stage: 'phenomeme', dimension: 1, form: 'Ordered symbols', summary: 'An inscribed sequence.', evidence: 'illustrative' },
    ],
    edges: [{ id: 'thought-text', from: 'thought', to: 'text', kind: 'externalization', label: 'Inscription' }],
  };
  const normalized = validateDataset(minimal);
  expect(normalized.valid).toBe(true);
  const dataURL = new URL('data.js', new URL(dimensions, baseURL)).href;
  await page.route(dataURL, route => route.fulfill({
    contentType: 'application/javascript',
    body: `export const DATASETS = ${JSON.stringify([minimal])};`,
  }));
  await page.goto(dimensions);
  await expect(page.locator('#dataset-title')).toHaveText(minimal.title);
  await expect(page.locator('#dataset-subtitle')).toBeEmpty();
  await expectDiagram(page, minimal);
  await expect(page.locator('#inspector h2')).toHaveText('A thought');
  await expect(page.getByText('Not specified for this form.', { exact: true })).toHaveCount(3);
  await page.locator('#comparison-tab').click();
  await expect(page.locator('#comparison-body tr')).toHaveCount(2);
  await page.locator('[data-select-node="text"]').click();
  await expect(page.locator('#inspector h2')).toHaveText('A text');
  await page.locator('#model-button').click();
  await expect(page.locator('#notes-dialog')).toBeVisible();
  await expect(page.locator('#notes-content')).toContainText(`${minimal.title}: assumptions`);
  await expect(page.locator('#notes-content a')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.locator('#export-button').click();
  const exported = await downloadText(page, () => page.locator('#export-data').click());
  expect(JSON.parse(exported.content)).toEqual(normalized.data);
  await page.locator('#export-button').click();
  const svg = await downloadText(page, () => page.locator('#export-image').click());
  expect(svg.content).toContain('<svg');
  expect(svg.content).toContain(minimal.title);
  const template = await downloadText(page, () => page.locator('#template-button').click());
  const templateData = JSON.parse(template.content);
  expect(validateDataset(templateData).valid).toBe(true);
  expect(templateData.id).toBe('my-cultural-example');
  expect(templateData.nodes).toEqual(normalized.data.nodes);
});

test('dimensional reduction links to the correct home page containing the prototype entry', async ({ page, baseURL }) => {
  await page.goto(dimensions);
  await expect(page.locator('#dataset-title')).toHaveText(datasets[0].title);
  const entryURL = new URL(dimensions, baseURL);
  const homeURL = new URL(entryURL.pathname.includes('/prototypes/') ? '../../site/' : '../', entryURL).href;
  await expect(page.locator('.brand')).toHaveAttribute('href', homeURL);
  // Read the real home response without loading its external font resources.
  const response = await page.request.get(homeURL);
  expect(response.ok()).toBe(true);
  const links = await page.evaluate(html => {
    const document = new DOMParser().parseFromString(html, 'text/html');
    return [...document.querySelectorAll('a')].map(link => ({ href: link.getAttribute('href'), text: link.textContent.trim() }));
  }, await response.text());
  expect(links).toContainEqual({ href: 'dimensional-reduction/', text: 'Cultural dimensions' });
});

test('dimensional reduction shows the historical artifact and specific source notes', async ({ page }) => {
  const data = datasets.find(entry => entry.id === 'paradise-lost');
  const firstPrint = data.nodes.find(node => node.id === 'printed-poem');
  await page.goto(`${dimensions}#dataset=paradise-lost&node=${firstPrint.id}`);
  const image = page.locator('.artifact-image img');
  await expect(image).toBeVisible();
  await image.scrollIntoViewIfNeeded();
  await image.evaluate(element => element.decode());
  expect(await image.evaluate(element => element.complete && element.naturalWidth > 1000)).toBe(true);
  await expect(page.locator('.artifact-image figcaption')).toContainText('Houghton Library');
  await expect(page.locator('.inspector-dimension')).toHaveText('1D');
  await page.locator('#sources-button').click();
  await expect(page.locator('#notes-dialog')).toBeVisible();
  for (const source of data.sources) {
    await expect(page.locator('#notes-dialog').getByRole('link', { name: source.title, exact: true })).toHaveAttribute('href', source.url);
  }
  await expect(page.locator('#notes-content')).toContainText('1674');
  await expect(page.locator('#notes-content')).toContainText('accuracy of a transcription');
  await page.keyboard.press('Escape');
  await expect(page.locator('#notes-dialog')).toBeHidden();
});

test('dimensional reduction imports, exports, persists and removes a reusable example', async ({ page }) => {
  const custom = example();
  custom.kind = 'framework';
  custom.description = 'A distinct framework description retained by the shared renderer.';
  await page.goto(dimensions);
  await importExample(page, custom);
  await expect(page.locator('#dataset-title')).toHaveText(custom.title);
  await expect(page.locator('#dataset-description')).toHaveText(custom.description);
  await page.locator('#export-button').click();
  const exported = await downloadText(page, () => page.locator('#export-data').click());
  expect(exported.name).toBe(`${custom.id}.json`);
  expect(JSON.parse(exported.content)).toEqual(validateDataset(custom).data);
  await page.reload();
  await expect(page.locator('#dataset-title')).toHaveText(custom.title);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).map(data => data.id), storageKey)).toEqual([custom.id]);
  await page.locator('#model-button').click();
  await page.locator('#remove-import').click();
  await expect(page.locator(`[data-dataset="${custom.id}"]`)).toHaveCount(0);
  await page.reload();
  await expect(page.locator(`[data-dataset="${custom.id}"]`)).toHaveCount(0);

  const template = await downloadText(page, () => page.locator('#template-button').click());
  expect(template.name).toBe('cultural-example-template.json');
  expect(validateDataset(JSON.parse(template.content)).valid).toBe(true);
  await importExample(page, template.content);
  await expect(page.locator('#dataset-title')).toHaveText('My cultural example');
});

test('dimensional reduction rejects malformed and unsafe imports without replacing the current case', async ({ page }) => {
  const custom = example('retained-example');
  await page.goto(dimensions);
  await importExample(page, custom);
  await expect(page.locator('#dataset-title')).toHaveText(custom.title);
  const dangling = example('dangling-example');
  dangling.edges[0].to = 'missing-node';
  const unsafe = example('unsafe-example');
  unsafe.sources = [{ id: 'unsafe-source', title: 'Untrusted source', url: 'javascript:alert(1)' }];
  const cases = [
    ['{invalid JSON', /JSON|property|Unexpected/i],
    [dangling, /unknown node/],
    [unsafe, /HTTP or HTTPS/],
    [custom, /already uses this ID/],
  ];
  for (const [data, error] of cases) {
    await importExample(page, data, 'invalid.json');
    await expect(page.locator('#import-dialog')).toBeVisible();
    await expect(page.locator('#import-result')).toContainText(error);
    await expect(page.locator('#dataset-title')).toHaveText(custom.title);
    await page.keyboard.press('Escape');
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).map(data => data.id), storageKey)).toEqual([custom.id]);
});

test('dimensional reduction renders imported markup as text and routes branching links around nodes', async ({ page }) => {
  await page.setViewportSize({ width: 1512, height: 1050 });
  const custom = example('literal-text-example');
  custom.title = 'Imported <b>example</b>';
  custom.subtitle = 'LongUnbrokenSubtitle'.repeat(14);
  custom.nodes[0].label = '<img src=x onerror="window.dimensionXss=1">';
  custom.nodes[0].summary = 'LongUnbrokenInterpretation'.repeat(35);
  custom.notes.push('<img src=x onerror="window.dimensionXss=2">');
  custom.edges.push({ id: 'feedback', from: custom.nodes[5].id, to: custom.nodes[0].id, kind: 'transduction', label: 'Reinterpretation', sourceIds: [] });
  custom.edges.push({ id: 'skip-stage', from: custom.nodes[0].id, to: custom.nodes[2].id, kind: 'transduction', label: 'Direct expression', sourceIds: [] });
  await page.goto(dimensions);
  await importExample(page, custom);
  await expect(page.locator('#dataset-title')).toHaveText(custom.title);
  await expect(page.locator('#dataset-title b, #nodes img')).toHaveCount(0);
  await expect(page.locator('#connections .connection-path')).toHaveCount(custom.edges.length);
  const crossesMiddleNode = await page.locator('#connections .connection-path').last().evaluate(path => {
    const middle = document.querySelectorAll('.node-art')[1].getBoundingClientRect();
    const matrix = path.getScreenCTM();
    const length = path.getTotalLength();
    for (let step = 0; step <= 200; step++) {
      const point = path.getPointAtLength(length * step / 200).matrixTransform(matrix);
      if (point.x > middle.left + 1 && point.x < middle.right - 1 && point.y > middle.top + 1 && point.y < middle.bottom - 1) return true;
    }
    return false;
  });
  expect(crossesMiddleNode, 'A skip link must not imply a connection through the intervening node').toBe(false);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.locator(`[data-node="${custom.nodes[0].id}"]`).click();
  await expect(page.locator('#inspector h2')).toHaveText(custom.nodes[0].label);
  await expectNoOverflow(page);
  await page.locator('#model-button').click();
  await expect(page.locator('#notes-content')).toContainText(custom.notes.at(-1));
  await expect(page.locator('#notes-content img')).toHaveCount(0);
  expect(await page.evaluate(() => window.dimensionXss)).toBeUndefined();
});

test('dimensional reduction imports remain usable when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', {
    get() { throw new DOMException('Storage disabled', 'SecurityError'); },
  }));
  const custom = example('session-example');
  await page.goto(dimensions);
  await importExample(page, custom);
  await expect(page.locator('#dataset-title')).toHaveText(custom.title);
  await expect(page.locator('#toast')).toContainText('for this session');
  await expectDiagram(page, custom);
});

test('dimensional reduction playback advances, pauses and stops at the last form', async ({ page }) => {
  await page.clock.install();
  const data = datasets[0];
  await page.goto(`${dimensions}#dataset=${data.id}&node=${data.nodes[0].id}`);
  await expect(page.locator('#previous-button')).toBeDisabled();
  await page.locator('#play-button').click();
  await page.clock.runFor(2601);
  await expect(page.locator('#inspector h2')).toHaveText(data.nodes[1].label);
  await page.locator('#play-button').click();
  await page.clock.runFor(5200);
  await expect(page.locator('#inspector h2')).toHaveText(data.nodes[1].label);
  await page.locator('#play-button').click();
  await page.clock.runFor(2601 * data.nodes.length);
  await expect(page.locator('#inspector h2')).toHaveText(data.nodes.at(-1).label);
  await expect(page.locator('#next-button')).toBeDisabled();
  await expect(page.locator('#play-button')).toHaveAttribute('aria-label', 'Play sequence');
  await page.locator('#play-button').click();
  await expect(page.locator('#inspector h2')).toHaveText(data.nodes[0].label);
  await page.keyboard.press('Escape');
  await expect(page.locator('#play-button')).toHaveAttribute('aria-label', 'Play sequence');
});

test('dimensional reduction exports a standalone SVG with bounded motifs and text', async ({ page, context }, testInfo) => {
  const custom = example('svg-example');
  custom.title = 'An extended account of cultural transformation across thought, speech, performed gestures, durable objects, planar diagrams and ordered symbolic sequences';
  await page.goto(dimensions);
  await importExample(page, custom);
  await expect(page.locator('#dataset-title')).toHaveText(custom.title);
  await page.locator('#export-button').click();
  const exported = await downloadText(page, () => page.locator('#export-image').click());
  expect(exported.name).toBe('svg-example.svg');
  const rendered = await context.newPage();
  try {
    await rendered.setViewportSize({ width: 1512, height: 1050 });
    await rendered.setContent(exported.content);
    expect(await rendered.evaluate(svg => new DOMParser().parseFromString(svg, 'image/svg+xml').querySelector('parsererror') === null, exported.content)).toBe(true);
    await expect(rendered.locator('svg.motif')).toHaveCount(custom.nodes.length);
    const bounds = await rendered.evaluate(() => {
      const root = document.querySelector('body > svg').getBoundingClientRect();
      const within = element => {
        const rect = element.getBoundingClientRect();
        return rect.left >= root.left - 1 && rect.right <= root.right + 1 && rect.top >= root.top - 1 && rect.bottom <= root.bottom + 1;
      };
      return {
        motifs: [...document.querySelectorAll('svg.motif')].every(element => {
          const rect = element.getBoundingClientRect();
          return within(element) && rect.width > 10 && rect.width <= 80 && rect.height > 10 && rect.height <= 80;
        }),
        text: [...document.querySelectorAll('svg text')].every(within),
      };
    });
    expect(bounds).toEqual({ motifs: true, text: true });
    await rendered.screenshot({ path: testInfo.outputPath('dimensional-reduction-export.png'), fullPage: true });
  } finally {
    await rendered.close();
  }
});

for (const width of [1512, 768, 390, 320]) {
  test(`dimensional reduction fits a ${width}px viewport`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(dimensions);
    await expectDiagram(page, datasets[0]);
    await expectNoOverflow(page);
    const overlaps = await page.locator('.node').evaluateAll(nodes => {
      const boxes = nodes.map(node => node.getBoundingClientRect());
      return boxes.some((a, index) => boxes.slice(index + 1).some(b => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1));
    });
    expect(overlaps, 'Node buttons do not overlap').toBe(false);
    await page.screenshot({ path: testInfo.outputPath(`dimensional-reduction-${width}.png`), fullPage: true });
    await page.locator('#comparison-tab').click();
    await expect(page.locator('#comparison-body tr')).toHaveCount(datasets[0].nodes.length);
    await expectNoOverflow(page);
  });
}
