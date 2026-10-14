export const SCHEMA_VERSION = 1;
export const STAGES = Object.freeze(['psychomeme', 'phonomeme', 'phenomeme']);
export const DIMENSIONS = Object.freeze([4, 3, 2, 1]);
export const EVIDENCE_TYPES = Object.freeze(['framework', 'documented', 'inferred', 'illustrative']);
export const EDGE_KINDS = Object.freeze(['externalization', 'transduction', 're-encoding', 'copying']);
export const DATASET_KINDS = Object.freeze(['framework', 'case-study', 'illustrative']);

const LIMITS = Object.freeze({ nodes: 120, edges: 240, sources: 60, notes: 20, claims: 12, sourceIds: 20 });
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const CONTROL_CHARACTERS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export function stageForNode(node) {
  if (node?.stage === 'phenomeme' && DIMENSIONS.includes(node.dimension)) {
    return `phenomeme-${node.dimension}d`;
  }
  return STAGES.includes(node?.stage) ? node.stage : null;
}

export function validateDataset(value) {
  const errors = [];
  const error = (path, message) => {
    if (errors.length < 50) errors.push(`${path}: ${message}`);
  };
  const record = (input, path, allowed) => {
    if (input === null || typeof input !== 'object' || Array.isArray(input)) {
      error(path, 'must be an object');
      return {};
    }
    const prototype = Object.getPrototypeOf(input);
    if (prototype !== Object.prototype && prototype !== null) {
      error(path, 'must be a plain object');
      return {};
    }
    const descriptors = Object.getOwnPropertyDescriptors(input);
    if (Object.values(descriptors).some(descriptor => !Object.hasOwn(descriptor, 'value'))) {
      error(path, 'must not contain getters or setters');
      return {};
    }
    for (const key of Object.keys(input)) {
      if (!allowed.includes(key)) error(`${path}.${key}`, 'is not a supported field');
    }
    return input;
  };
  const string = (input, path, maximum = 1000, allowEmpty = false) => {
    if (typeof input !== 'string') {
      error(path, 'must be text');
      return '';
    }
    const normalized = input.trim();
    if (!allowEmpty && !normalized) error(path, 'must not be empty');
    if (input.length > maximum) error(path, `must be at most ${maximum} characters`);
    if (CONTROL_CHARACTERS.test(input)) error(path, 'contains unsupported control characters');
    return normalized;
  };
  const identifier = (input, path) => {
    const id = string(input, path, 80);
    if (id && !IDENTIFIER.test(id)) error(path, 'must use letters, numbers, periods, underscores or hyphens');
    return id;
  };
  const choice = (input, path, values) => {
    if (!values.includes(input)) error(path, `must be one of ${values.join(', ')}`);
    return input;
  };
  const list = (input, path, maximum, map, optional = false) => {
    if (input === undefined && optional) return [];
    if (!Array.isArray(input)) {
      error(path, 'must be an array');
      return [];
    }
    if (input.length > maximum) error(path, `must contain at most ${maximum} entries`);
    return input.slice(0, maximum).map((item, index) => map(item, `${path}[${index}]`));
  };
  const textList = (input, path, maximum, length) => list(input, path, maximum, (item, itemPath) => string(item, itemPath, length), true);
  const ids = (input, path) => {
    const result = list(input, path, LIMITS.sourceIds, identifier, true);
    if (new Set(result).size !== result.length) error(path, 'must not contain duplicate source IDs');
    return result;
  };
  const uniqueIds = (items, path) => {
    const seen = new Set();
    for (const item of items) {
      if (seen.has(item.id)) error(path, `duplicate ID "${item.id}"`);
      seen.add(item.id);
    }
    return seen;
  };
  const sourceUrl = (input, path) => {
    const raw = string(input, path, 2048);
    try {
      const url = new URL(raw);
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
        error(path, 'must be an HTTP or HTTPS URL without credentials');
      }
      return url.href;
    } catch {
      error(path, 'must be a valid absolute HTTP or HTTPS URL');
      return raw;
    }
  };

  const input = record(value, 'dataset', ['schemaVersion', 'id', 'title', 'subtitle', 'kind', 'description', 'notes', 'sources', 'nodes', 'edges']);
  if (input.schemaVersion !== SCHEMA_VERSION) error('dataset.schemaVersion', `must be ${SCHEMA_VERSION}`);
  const data = {
    schemaVersion: SCHEMA_VERSION,
    id: identifier(input.id, 'dataset.id'),
    title: string(input.title, 'dataset.title', 160),
    subtitle: string(input.subtitle ?? '', 'dataset.subtitle', 300, true),
    kind: choice(input.kind, 'dataset.kind', DATASET_KINDS),
    description: string(input.description, 'dataset.description', 5000),
    notes: textList(input.notes, 'dataset.notes', LIMITS.notes, 1500),
    sources: list(input.sources, 'dataset.sources', LIMITS.sources, (value, path) => {
      const source = record(value, path, ['id', 'title', 'url', 'locator']);
      const result = {
        id: identifier(source.id, `${path}.id`),
        title: string(source.title, `${path}.title`, 300),
        url: sourceUrl(source.url, `${path}.url`),
      };
      if (source.locator !== undefined) result.locator = string(source.locator, `${path}.locator`, 500);
      return result;
    }, true),
    nodes: list(input.nodes, 'dataset.nodes', LIMITS.nodes, (value, path) => {
      const node = record(value, path, ['id', 'label', 'stage', 'dimension', 'form', 'summary', 'preserves', 'loses', 'gains', 'evidence', 'sourceIds', 'dateLabel', 'example', 'detail']);
      const stage = choice(node.stage, `${path}.stage`, STAGES);
      const dimension = node.dimension;
      if (stage === 'phenomeme' && !DIMENSIONS.includes(dimension)) {
        error(`${path}.dimension`, 'phenomemes require dimension 4, 3, 2 or 1');
      } else if (stage !== 'phenomeme' && dimension !== null) {
        error(`${path}.dimension`, 'psychomemes and phonomemes require null');
      }
      const result = {
        id: identifier(node.id, `${path}.id`),
        label: string(node.label, `${path}.label`, 160),
        stage,
        dimension,
        form: string(node.form, `${path}.form`, 300),
        summary: string(node.summary, `${path}.summary`, 2500),
        preserves: textList(node.preserves, `${path}.preserves`, LIMITS.claims, 800),
        loses: textList(node.loses, `${path}.loses`, LIMITS.claims, 800),
        gains: textList(node.gains, `${path}.gains`, LIMITS.claims, 800),
        evidence: choice(node.evidence, `${path}.evidence`, EVIDENCE_TYPES),
        sourceIds: ids(node.sourceIds, `${path}.sourceIds`),
      };
      for (const key of ['dateLabel', 'example', 'detail']) {
        if (node[key] !== undefined) result[key] = string(node[key], `${path}.${key}`, key === 'detail' ? 6000 : 1000);
      }
      return result;
    }),
    edges: list(input.edges, 'dataset.edges', LIMITS.edges, (value, path) => {
      const edge = record(value, path, ['id', 'from', 'to', 'kind', 'label', 'summary', 'sourceIds']);
      const result = {
        id: identifier(edge.id, `${path}.id`),
        from: identifier(edge.from, `${path}.from`),
        to: identifier(edge.to, `${path}.to`),
        kind: choice(edge.kind, `${path}.kind`, EDGE_KINDS),
        label: string(edge.label, `${path}.label`, 160),
        sourceIds: ids(edge.sourceIds, `${path}.sourceIds`),
      };
      if (edge.summary !== undefined) result.summary = string(edge.summary, `${path}.summary`, 2500);
      return result;
    }),
  };
  if (data.nodes.length === 0) error('dataset.nodes', 'must contain at least one node');
  const sourceIds = uniqueIds(data.sources, 'dataset.sources');
  const nodeIds = uniqueIds(data.nodes, 'dataset.nodes');
  uniqueIds(data.edges, 'dataset.edges');
  const checkSources = (item, path) => {
    for (const sourceId of item.sourceIds) {
      if (!sourceIds.has(sourceId)) error(`${path}.sourceIds`, `unknown source "${sourceId}"`);
    }
  };
  data.nodes.forEach((node, index) => checkSources(node, `dataset.nodes[${index}]`));
  data.edges.forEach((edge, index) => {
    const path = `dataset.edges[${index}]`;
    if (!nodeIds.has(edge.from)) error(`${path}.from`, `unknown node "${edge.from}"`);
    if (!nodeIds.has(edge.to)) error(`${path}.to`, `unknown node "${edge.to}"`);
    checkSources(edge, path);
  });
  return errors.length ? { valid: false, errors } : { valid: true, errors: [], data };
}
