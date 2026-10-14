import test from 'node:test';
import assert from 'node:assert/strict';
import { DATASETS } from '../prototypes/dimensional-reduction/data.js';
import { validateDataset, stageForNode } from '../prototypes/dimensional-reduction/model.js';

const fixture = () => structuredClone(DATASETS[0]);
const reject = (value, pattern) => {
  const result = validateDataset(value);
  assert.equal(result.valid, false);
  assert.equal('data' in result, false);
  assert.ok(result.errors.some(error => pattern.test(error)), result.errors.join('\n'));
};

test('bundled datasets validate and survive a JSON export/import round trip', () => {
  assert.equal(new Set(DATASETS.map(dataset => dataset.id)).size, DATASETS.length);
  for (const dataset of DATASETS) {
    const first = validateDataset(dataset);
    assert.equal(first.valid, true, first.errors.join('\n'));
    const second = validateDataset(JSON.parse(JSON.stringify(first.data)));
    assert.deepEqual(second.data, first.data);
    assert.notEqual(first.data.nodes[0], dataset.nodes[0]);
  }
});

test('invalid input types and unsupported schema versions fail without throwing', () => {
  for (const value of [null, undefined, 1, true, 'text', [], { nodes: [null], edges: [null], sources: [null] }]) {
    assert.doesNotThrow(() => validateDataset(value));
    assert.equal(validateDataset(value).valid, false);
  }
  const dataset = fixture();
  dataset.schemaVersion = 2;
  reject(dataset, /schemaVersion/);
});

test('graph links and source references must resolve', () => {
  const dataset = fixture();
  dataset.edges[0].to = 'missing-node';
  dataset.nodes[0].sourceIds = ['missing-source'];
  reject(dataset, /unknown node "missing-node"/);
  reject(dataset, /unknown source "missing-source"/);
});

test('all graph entity IDs must be unique within their collection', () => {
  for (const collection of ['nodes', 'edges', 'sources']) {
    const dataset = fixture();
    dataset[collection].push(structuredClone(dataset[collection][0]));
    reject(dataset, new RegExp(`dataset\\.${collection}: duplicate ID`));
  }
});

test('source links only allow absolute HTTP(S) URLs without credentials', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'file:///etc/passwd', '/relative', 'https://user:password@example.com/']) {
    const dataset = fixture();
    dataset.sources[0].url = url;
    reject(dataset, /sources\[0\]\.url/);
  }
  const dataset = fixture();
  dataset.sources[0].url = 'https://example.com/a%20b?x=1#reference';
  assert.equal(validateDataset(dataset).valid, true);
});

test('dimensional claims respect the schema and distinguish text from its substrate', () => {
  const dataset = fixture();
  dataset.nodes[0].dimension = 4;
  reject(dataset, /psychomemes and phonomemes require null/);
  for (const dimension of [0, 5, '1', null]) {
    const invalid = fixture();
    invalid.nodes[2].dimension = dimension;
    reject(invalid, /phenomemes require dimension/);
  }
  const poem = DATASETS.find(dataset => dataset.id === 'paradise-lost');
  assert.ok(poem.nodes.filter(node => node.stage === 'phenomeme').every(node => node.dimension === 1));
});

test('bounds protect the renderer from oversized graphs and malformed nested values', () => {
  const dataset = fixture();
  dataset.nodes = Array.from({ length: 121 }, (_, index) => ({ ...structuredClone(dataset.nodes[0]), id: `node-${index}` }));
  reject(dataset, /at most 120 entries/);
  const malformed = fixture();
  malformed.nodes[0].preserves = 'not an array';
  malformed.nodes[0].summary = 'x'.repeat(2501);
  reject(malformed, /preserves: must be an array/);
  reject(malformed, /summary: must be at most 2500/);
});

test('unknown fields and accessor objects are rejected without invoking accessors', () => {
  const dataset = fixture();
  dataset.nodes[0].html = '<script>alert(1)</script>';
  reject(dataset, /html: is not a supported field/);
  const accessor = fixture();
  Object.defineProperty(accessor, 'title', { get() { throw new Error('must not execute'); }, enumerable: true });
  assert.doesNotThrow(() => reject(accessor, /getters or setters/));
});

test('grouping derives from stage and modeled dimension', () => {
  assert.equal(stageForNode({ stage: 'psychomeme', dimension: null }), 'psychomeme');
  assert.equal(stageForNode({ stage: 'phonomeme', dimension: null }), 'phonomeme');
  assert.equal(stageForNode({ stage: 'phenomeme', dimension: 3 }), 'phenomeme-3d');
  assert.equal(stageForNode(null), null);
});
