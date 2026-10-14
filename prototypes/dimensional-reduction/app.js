import { DATASETS as RAW_DATASETS } from './data.js';
import { validateDataset, stageForNode } from './model.js';

const DATASETS = RAW_DATASETS.map(value => {
  const result = validateDataset(value);
  if (!result.valid) throw new Error(`Invalid bundled example: ${result.errors.join('; ')}`);
  return result.data;
});
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const escape = (text) => String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
const stageNames = { psychomeme: 'Psychomeme', phonomeme: 'Phonomeme', phenomeme: 'Phenomeme' };
const kindNames = { framework: 'Conceptual framework', 'case-study': 'Source-based case study', illustrative: 'Constructed example' };
const palettes = { psychomeme: '#78678a', phonomeme: '#43859a', 'phenomeme-4d': '#b95740', 'phenomeme-3d': '#9a7a33', 'phenomeme-2d': '#3d8a6c', 'phenomeme-1d': '#476c85' };
const color = (node) => palettes[stageForNode(node)] || '#4c6a59';
const dimension = (node) => node.dimension ? `${node.dimension}D` : stageNames[node.stage];
const storageKey = 'phylograph.dimensions.examples.v1';
$('.brand').href = new URL(location.pathname.includes('/prototypes/') ? '../../site/' : '../', import.meta.url).href;
let imported = [];
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(stored)) imported = stored.slice(0, 10).map(validateDataset).filter(r => r.valid).map(r => r.data).filter(d => !DATASETS.some(b => b.id === d.id));
} catch { /* Local storage can be unavailable in private browser contexts. */ }
let datasets = [...DATASETS, ...imported];
let dataset = datasets[0];
let selectedId = dataset.nodes[2]?.id || dataset.nodes[0].id;
let activeView = 'map';
let timer;
let toastTimer;
let activeEdgeId = null;

function refreshIcons() { window.lucide?.createIcons({ attrs: { 'aria-hidden': 'true' } }); }
function selectedNode() { return dataset.nodes.find(n => n.id === selectedId) || dataset.nodes[0]; }
function selectedIndex() { return dataset.nodes.findIndex(n => n.id === selectedId); }
function message(text) {
  clearTimeout(toastTimer);
  $('#toast').textContent = text;
  $('#toast').hidden = false;
  toastTimer = setTimeout(() => { $('#toast').hidden = true; }, 4000);
}
function updateAddress() {
  const params = new URLSearchParams({ dataset: dataset.id, node: selectedId, view: activeView });
  history.replaceState(null, '', `${location.pathname}${location.search}#${params}`);
}
function readAddress() {
  const params = new URLSearchParams(location.hash.slice(1));
  const found = datasets.find(d => d.id === params.get('dataset'));
  if (found) dataset = found;
  const node = dataset.nodes.find(n => n.id === params.get('node'));
  selectedId = node?.id || dataset.nodes.find(n => n.dimension === 4)?.id || dataset.nodes[0].id;
  activeView = params.get('view') === 'comparison' ? 'comparison' : 'map';
}

// These are data marks: thought associations, acoustic rhythm, and four organizations of form.
function motif(node, large = false) {
  const stroke = color(node);
  const common = `fill="none" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`;
  let shapes = '';
  if (node.stage === 'psychomeme') {
    const points = [[24,20],[45,13],[60,30],[50,54],[25,59],[12,38],[35,37]];
    const links = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[6,0],[6,2],[6,4],[6,5],[1,6],[6,3]];
    shapes = links.map(([a,b]) => `<path d="M${points[a]} L${points[b]}" opacity=".44"/>`).join('') + points.map(([x,y],i) => `<circle cx="${x}" cy="${y}" r="${i===6?5:3}" fill="${i===6?stroke:'#fff'}"/>`).join('');
  } else if (node.stage === 'phonomeme') {
    const heights = [8,15,27,41,24,53,33,16,28,12,7];
    shapes = heights.map((h,i) => `<path d="M${7+i*6} ${38-h/2}v${h}" stroke-width="${i===5?2.2:1.5}"/>`).join('');
  } else if (node.dimension === 4) {
    shapes = [0,1,2,3].map(i => {
      const x = 13+i*15;
      const y = 28-Math.sin(i*.95)*9;
      return `<g opacity="${.25+i*.23}"><circle cx="${x}" cy="${y}" r="3"/><path d="M${x} ${y+4}v16m0-11l-6 ${7-i*3}m6 ${i*3-7}l7 ${i*2-4}m-7 ${15-i*2}l-5 11m5-11l7 9"/></g>`;
    }).join('') + '<path d="M7 65h61m-4-3 4 3-4 3" opacity=".5"/>';
  } else if (node.dimension === 3) {
    shapes = '<path d="M17 26 42 13 64 28 38 42Z" fill="'+stroke+'" fill-opacity=".08"/><path d="M17 26v27l21 13V42m0 24 26-16V28M42 13v25l22 12M17 53l25-15"/><path d="M42 13v25L17 53" stroke-dasharray="2 3" opacity=".45"/>';
  } else if (node.dimension === 2) {
    shapes = '<rect x="12" y="14" width="52" height="47" rx="1"/><path d="m18 52 15-24 14 18 7-10 6 16Z" fill="'+stroke+'" fill-opacity=".08"/><circle cx="51" cy="25" r="4"/><path d="M12 67h52m-52-3v6m52-6v6M6 14v47m-3-47h6M3 61h6" opacity=".5"/>';
  } else {
    shapes = '<path d="M5 39h66" opacity=".4"/>'+[0,1,2,3,4,5,6,7].map((i)=>`<rect x="${6+i*8}" y="${i%3===0?29:33}" width="5" height="${i%3===0?20:12}" fill="${stroke}" fill-opacity="${.28+i*.09}" stroke="none"/>`).join('')+'<path d="M9 61h58m-4-3 4 3-4 3" opacity=".5"/>';
  }
  return `<svg class="motif" viewBox="0 0 76 76" width="${large?96:76}" height="${large?96:76}" aria-hidden="true"><g ${common}>${shapes}</g></svg>`;
}

function renderLibrary() {
  $('#dataset-count').textContent = String(datasets.length).padStart(2, '0');
  $('#dataset-list').innerHTML = datasets.map(d => `<button class="dataset-button" data-dataset="${escape(d.id)}" aria-current="${d.id===dataset.id}">${icon(d.kind==='framework'?'network':d.kind==='case-study'?'book-open':'spline')}<span><strong>${escape(d.title)}</strong><small>${d.kind==='framework'?'The general model':d.kind==='case-study'?'Historical transmission':'A passage through the model'}</small></span></button>`).join('');
  $$('.dataset-button').forEach(b => b.addEventListener('click', () => chooseDataset(b.dataset.dataset)));
}
function renderNodes() {
  $('#nodes').innerHTML = dataset.nodes.map((n,i) => `<button class="node" data-node="${escape(n.id)}" aria-pressed="${n.id===selectedId}" aria-label="${escape(n.label)}, ${escape(dimension(n))}" style="--node-color:${color(n)}"><span class="node-seq">${String(i+1).padStart(2,'0')}</span><span class="node-art">${motif(n)}</span><span class="node-label">${escape(n.label)}</span><span class="node-form">${escape(n.form)}</span><span class="node-dimension">${n.dimension?`${n.dimension}D`:(n.stage==='psychomeme'?'MENTAL':'VOCAL')}</span>${n.dateLabel?`<span class="node-date">${escape(n.dateLabel)}</span>`:''}</button>`).join('');
  $$('.node').forEach(b => b.addEventListener('click', () => { stopPlayback(); selectNode(b.dataset.node); }));
}

function renderInspector() {
  const n = selectedNode();
  const sources = dataset.sources.filter(s => n.sourceIds.includes(s.id));
  const property = (name, items, mark) => `<section class="property-section"><h3>${icon(mark)}${name}</h3>${items.length?`<ul>${items.map(s=>`<li>${escape(s)}</li>`).join('')}</ul>`:'<p class="summary">Not specified for this form.</p>'}</section>`;
  $('#inspector').style.setProperty('--node-color',color(n));
  $('#inspector').innerHTML = `<div class="inspector-top"><span>SELECTED FORM</span><span class="evidence-badge">${escape(n.evidence)}</span></div><div class="inspector-dimension">${n.dimension?`${n.dimension}D`:n.stage==='psychomeme'?'01':'02'}</div><h2>${escape(n.label)}</h2><p class="summary">${escape(n.summary)}</p>${n.example?`<p class="example"><strong>Instances</strong>${escape(n.example)}</p>`:''}${property('PRESERVED',n.preserves,'equal')}${property('LOST / UNAVAILABLE',n.loses,'minus')}${property('GAINED',n.gains,'plus')}${n.detail?`<section class="property-section"><h3>INTERPRETATION</h3><p class="summary">${escape(n.detail)}</p></section>`:''}${sources.length?`<section class="property-section"><h3>${icon('book-open')}EVIDENCE</h3><div class="source-links">${sources.map(s=>`<div><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)}</a>${s.locator?`<small><br>${escape(s.locator)}</small>`:''}</div>`).join('')}</div></section>`:''}${dataset.id==='paradise-lost'&&/print|1667/i.test(n.label+' '+n.id)?'<figure class="artifact-image"><a href="https://commons.wikimedia.org/wiki/File:Houghton_EC65.M6427P.1667aa_-_Paradise_Lost,_1667.jpg" target="_blank" rel="noopener noreferrer"><img src="./assets/paradise-lost-1667.jpg" alt="Title page of the 1667 edition of Paradise Lost, from Houghton Library" loading="lazy"></a><figcaption>1667 title page. Houghton Library, Harvard University, EC65.M6427P.1667aa. Public domain.</figcaption></figure>':''}`;
}
function renderComparison() {
  $('#comparison-body').innerHTML = dataset.nodes.map(n => `<tr class="${n.id===selectedId?'selected':''}" data-row="${escape(n.id)}"><td><button data-select-node="${escape(n.id)}">${escape(n.label)}</button><small>${escape(stageNames[n.stage])}</small></td><td>${escape(dimension(n))}<small>${escape(n.form)}</small></td>${[n.preserves,n.loses,n.gains].map(items=>`<td>${items.length?`<ul>${items.map(s=>`<li>${escape(s)}</li>`).join('')}</ul>`:'<span aria-label="Not specified">—</span>'}</td>`).join('')}</tr>`).join('');
  $$('[data-select-node]').forEach(b => b.addEventListener('click', () => selectNode(b.dataset.selectNode)));
}
function renderConnection() {
  const edges = dataset.edges.filter(e => e.to===selectedId);
  if (!edges.length) edges.push(...dataset.edges.filter(e=>e.from===selectedId));
  const edge = edges.find(e=>e.id===activeEdgeId) || edges[0];
  activeEdgeId = edge?.id || null;
  const target = $('#selected-connection');
  if (!edge) { target.innerHTML = `<p>${escape(selectedNode().detail || 'No transformation is recorded for this form.')}</p>`; return; }
  const from = dataset.nodes.find(n=>n.id===edge.from);
  const to = dataset.nodes.find(n=>n.id===edge.to);
  target.innerHTML = `<div class="connection-label">${icon('move-right')}<span>${escape(edge.label)} · ${escape(from.label)} → ${escape(to.label)}</span></div><p>${escape(edge.summary || `${edge.label} connects these forms. Inspect each form for the selected properties preserved, lost and gained.`)}</p>${edges.length>1?edges.map(e=>`<button class="edge-choice" data-edge="${escape(e.id)}" aria-pressed="${e.id===edge.id}">${escape(e.label)}</button>`).join(''):''}`;
  $$('[data-edge]').forEach(b=>b.addEventListener('click',()=>{activeEdgeId=b.dataset.edge;renderConnection();drawConnections();refreshIcons();}));
}
function connectionCurve(a,b,offset=0) {
  if (Math.abs(a.y-b.y)<10 && b.x>a.x) {
    const d=Math.max(16,(b.x-a.x)/2);
    return `M${a.x},${a.y} C${a.x+d},${a.y} ${b.x-d},${b.y} ${b.x},${b.y}`;
  }
  const middle=a.y+(b.y-a.y)/2+offset;
  return `M${a.x},${a.y} C${a.x+20},${middle} ${b.x-20},${middle} ${b.x},${b.y}`;
}
function drawConnections() {
  if (activeView!=='map') return;
  const box=$('#graph').getBoundingClientRect();
  if (!box.width) return;
  const svg=$('#connections');
  svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
  const positions=new Map($$('.node').map(el=>{
    const rect=el.querySelector('.node-art').getBoundingClientRect();
    return [el.dataset.node,{x:rect.x-box.x+rect.width/2,y:rect.y-box.y+rect.height/2,w:rect.width,h:rect.height}];
  }));
  svg.innerHTML='<defs><marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="#aab9af"/></marker><marker id="arrow-active" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="#b64c35"/></marker></defs>';
  dataset.edges.forEach((edge,i)=>{
    const a=positions.get(edge.from),b=positions.get(edge.to);
    if(!a||!b) return;
    const active=edge.id===activeEdgeId;
    const path=document.createElementNS('http://www.w3.org/2000/svg','path');
    const sameRow=Math.abs(a.y-b.y)<10;
    const adjacent=dataset.nodes.findIndex(n=>n.id===edge.to)===dataset.nodes.findIndex(n=>n.id===edge.from)+1;
    // Row changes travel in the gap around labels; backward links remain explicit.
    let d;
    if(sameRow && b.x>a.x && adjacent) d=connectionCurve({x:a.x+a.w/2+2,y:a.y},{x:b.x-b.w/2-3,y:b.y});
    else if(sameRow) {
      const y=Math.max(2,a.y-a.h/2-22-(i%3)*5);
      d=`M${a.x+12},${a.y-a.h/2} L${a.x+12},${y} L${b.x-12},${y} L${b.x-12},${b.y-b.h/2}`;
    } else {
      const fromEl=$$('.node').find(el=>el.dataset.node===edge.from).getBoundingClientRect();
      const routeY=b.y>a.y?fromEl.bottom-box.y+15:Math.max(3,b.y-b.h/2-22);
      d=`M${a.x+a.w/2+2},${a.y} L${a.x+a.w/2+8},${a.y} L${a.x+a.w/2+8},${routeY} L${b.x-b.w/2-9},${routeY} L${b.x-b.w/2-9},${b.y} L${b.x-b.w/2-3},${b.y}`;
    }
    path.setAttribute('d',d);path.setAttribute('class',`connection-path${active?' active':''}`);path.setAttribute('marker-end',`url(#${active?'arrow-active':'arrow'})`);
    if(edge.kind==='copying')path.setAttribute('stroke-dasharray','4 3');
    svg.append(path);
  });
}
function selectNode(id) {
  if (!dataset.nodes.some(n=>n.id===id)) return;
  selectedId=id;activeEdgeId=null;
  $$('.node').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.node===id)));
  $$('[data-row]').forEach(r=>r.classList.toggle('selected',r.dataset.row===id));
  renderInspector();renderConnection();updateControls();refreshIcons();drawConnections();updateAddress();
}
function updateControls() {
  $('#step-counter').textContent=`${String(selectedIndex()+1).padStart(2,'0')} / ${String(dataset.nodes.length).padStart(2,'0')}`;
  $('#previous-button').disabled=selectedIndex()===0;
  $('#next-button').disabled=selectedIndex()===dataset.nodes.length-1;
}
function setView(view) {
  activeView=view;
  for(const v of ['map','comparison']) {
    $(`#${v}-tab`).setAttribute('aria-selected',String(v===view));
    $(`#${v}-panel`).hidden=v!==view;
  }
  if(view==='comparison')renderComparison();
  requestAnimationFrame(drawConnections);updateAddress();
}
function render() {
  document.title=`${dataset.title} | Phylograph`;
  $('#dataset-kind').textContent=kindNames[dataset.kind].toUpperCase();
  $('#dataset-title').textContent=dataset.title;
  $('#dataset-subtitle').textContent=dataset.subtitle;
  $('#dataset-description').textContent=dataset.description;
  $('#chart-caption').textContent=dataset.kind==='framework'?'FROM EXPERIENCE TO ENCODING':dataset.kind==='case-study'?'TRANSMISSION & RE-ENCODING':'A CONSTRUCTED TRANSDUCTION';
  renderLibrary();renderNodes();renderInspector();renderConnection();renderComparison();setView(activeView);updateControls();refreshIcons();requestAnimationFrame(drawConnections);
}
function chooseDataset(id) {
  const found=datasets.find(d=>d.id===id);if(!found)return;
  stopPlayback();dataset=found;selectedId=dataset.nodes.find(n=>n.dimension===4)?.id || dataset.nodes[0].id;activeEdgeId=null;render();
}
function stopPlayback() {
  clearInterval(timer);timer=null;
  $('#play-button').innerHTML=icon('play');$('#play-button').setAttribute('aria-label','Play sequence');$('#play-button').dataset.tooltip='Play sequence';refreshIcons();
}
function play() {
  if(timer){stopPlayback();return;}
  if(selectedIndex()===dataset.nodes.length-1)selectNode(dataset.nodes[0].id);
  $('#play-button').innerHTML=icon('pause');$('#play-button').setAttribute('aria-label','Pause sequence');$('#play-button').dataset.tooltip='Pause sequence';refreshIcons();
  timer=setInterval(()=>{
    const next=selectedIndex()+1;
    if(next>=dataset.nodes.length){stopPlayback();return;}
    selectNode(dataset.nodes[next].id);
    if(next===dataset.nodes.length-1)stopPlayback();
  },2600);
}

function openNotes(sourcesFirst=false) {
  stopPlayback();
  $('#notes-content').innerHTML=`<p>The model traces cultural expression from thought to voice to embodied and material forms. Within the phenomemetic domain, it follows a reduction in the dimensions used to organize a representation.</p><div class="model-sequence">Psychomeme → Phonomeme → Phenomeme<br><br>4D event → 3D object → 2D image → 1D sequence</div><p>4D means an embodied form unfolding through time. A 3D object stabilizes a spatial form; a 2D image selects a plane; a 1D encoding specifies an ordered sequence. The categories describe the chosen representation. All rely on physical carriers, and each can encode something more complex than its own form.</p><p>Transformation can omit qualities of an experience while making an encoding easier to revisit, distribute or copy. Fidelity to an originating thought, accuracy of a transcription, and accuracy of later copies are separate questions.</p><h3>${escape(dataset.title)}: assumptions</h3><ul>${dataset.notes.map(note=>`<li>${escape(note)}</li>`).join('')}</ul><h3 id="dialog-sources">Sources</h3>${dataset.sources.length?`<ol>${dataset.sources.map(s=>`<li><a href="${escape(s.url)}" target="_blank" rel="noopener noreferrer">${escape(s.title)}</a>${s.locator?`<span class="source-locator">${escape(s.locator)}</span>`:''}</li>`).join('')}</ol>`:'<p>This is a constructed example, not a sourced historical lineage.</p>'}<h3>Reading the evidence</h3><p>Documented marks the historical existence or relationship supported by a source. Inferred marks a reconstruction. Framework marks a category in the model. Illustrative marks a constructed example. Dimensional assignments and preservation claims remain interpretations even when an artifact is documented.</p>${imported.some(d=>d.id===dataset.id)?'<button class="outline-button" id="remove-import">'+icon('trash-2')+'Remove imported example</button>':''}`;
  $('#notes-dialog').showModal();refreshIcons();
  if(sourcesFirst)$('#dialog-sources').scrollIntoView({block:'start'});
  $('#remove-import')?.addEventListener('click',()=>{
    imported=imported.filter(d=>d.id!==dataset.id);persistImports();datasets=[...DATASETS,...imported];$('#notes-dialog').close();chooseDataset(DATASETS[0].id);message('Imported example removed from this browser.');
  });
}
function download(content,type,name) {
  const url=URL.createObjectURL(new Blob([content],{type}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function wrapped(text,max=24,maxLines=5) {
  const words=String(text).split(/\s+/);const lines=[];let current='';
  for(const word of words){if(current.length+word.length+1>max&&current){lines.push(current);current='';}for(let i=0;i<word.length;i+=max){const part=word.slice(i,i+max);if(current&&current.length+part.length+1>max){lines.push(current);current='';}current+=(current?' ':'')+part;if(i+max<word.length){lines.push(current);current='';}}}if(current)lines.push(current);
  if(lines.length>maxLines){lines.length=maxLines;lines[maxLines-1]=lines[maxLines-1].slice(0,max-1)+'…';}return lines;
}
function exportSvg() {
  const width=1400,cols=Math.min(6,dataset.nodes.length),cell=(width-100)/cols;
  const titleLines=wrapped(dataset.title,70,4),header=170+(titleLines.length-1)*38;
  const rows=Math.ceil(dataset.nodes.length/cols),height=header+65+rows*260;
  const pos=new Map(dataset.nodes.map((n,i)=>[n.id,{x:50+(i%cols+.5)*cell,y:header+Math.floor(i/cols)*260}]));
  const text=(str,x,y,size=14,fill='#27352f',max=24,lines=4)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="${fill}" font-family="Arial,sans-serif" font-size="${size}">${wrapped(str,max,lines).map((line,i)=>`<tspan x="${x}" dy="${i?size*1.5:0}">${escape(line)}</tspan>`).join('')}</text>`;
  const paths=dataset.edges.map((e,i)=>{const a=pos.get(e.from),b=pos.get(e.to);const same=a.y===b.y;const adjacent=dataset.nodes.findIndex(n=>n.id===e.to)===dataset.nodes.findIndex(n=>n.id===e.from)+1;const start={x:a.x+45,y:a.y},end={x:b.x-45,y:b.y};let d;if(same&&b.x>a.x&&adjacent)d=connectionCurve(start,end);else if(same){const route=a.y-85-(i%3)*6;d=`M${a.x+15},${a.y-40}V${route}H${b.x-15}V${b.y-40}`;}else d=`M${start.x},${start.y} L${start.x+12},${start.y} L${start.x+12},${a.y+170+(i%3)*9} L${end.x-12},${a.y+170+(i%3)*9} L${end.x-12},${end.y} L${end.x},${end.y}`;return `<path d="${d}" fill="none" stroke="#aab9af" stroke-width="1.5" marker-end="url(#export-arrow)"/>`;}).join('');
  const nodes=dataset.nodes.map(n=>{const p=pos.get(n.id);return `<g transform="translate(${p.x-38} ${p.y-38})">${motif(n)}</g>${text(n.label,p.x,p.y+71,15,'#27352f',22,3)}${text(n.form,p.x,p.y+138,11,'#68756e',28,2)}${text(dimension(n),p.x,p.y-59,11,color(n),24,2)}`;}).join('');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><title>${escape(dataset.title)}</title><desc>${escape(dataset.description)}</desc><rect width="100%" height="100%" fill="#fff"/><defs><marker id="export-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M1 1L7 4L1 7" fill="none" stroke="#aab9af"/></marker></defs><text x="50" y="35" font-family="Arial,sans-serif" font-size="11" fill="#246451">PHYLOGRAPH / PROJECT 09</text><text x="50" y="76" font-family="Georgia,serif" font-size="30" fill="#27352f">${titleLines.map((line,i)=>`<tspan x="50" dy="${i?38:0}">${escape(line)}</tspan>`).join('')}</text>${paths}${nodes}<line x1="50" x2="1350" y1="${height-65}" y2="${height-65}" stroke="#dce4df"/><text x="50" y="${height-35}" font-family="Arial,sans-serif" font-size="11" fill="#68756e">Conceptual dimensions: 4D embodied time / 3D volume / 2D plane / 1D sequence. Forms coexist. See the dataset for evidence and interpretations.</text></svg>`;
  download(svg,'image/svg+xml',`${dataset.id}.svg`);message('Chart exported. Source notes are included in the dataset export.');
}
function persistImports() {
  try{localStorage.setItem(storageKey,JSON.stringify(imported));return true;}catch{return false;}
}
async function importFile(file) {
  if(!file)return;
  try {
    if(file.size>2_000_000)throw new Error('The example exceeds the 2 MB import limit.');
    const result=validateDataset(JSON.parse(await file.text()));
    if(!result.valid)throw new Error(result.errors.slice(0,12).join('\n'));
    if(DATASETS.some(d=>d.id===result.data.id))throw new Error('This ID belongs to a built-in example. Give your example a new ID.');
    if(imported.some(d=>d.id===result.data.id))throw new Error('An imported example already uses this ID. Remove it first or use a new ID.');
    if(imported.length>=10)throw new Error('This browser already holds 10 imported examples. Remove one before importing another.');
    imported.push(result.data);const saved=persistImports();datasets=[...DATASETS,...imported];chooseDataset(result.data.id);
    message(saved?'Example imported and retained in this browser.':'Example imported for this session. Browser storage is unavailable.');
  } catch(error) {
    $('#import-result').innerHTML='<p class="import-error"></p>';$('#import-result p').textContent=error.message;
    $('#import-result p').style.whiteSpace='pre-wrap';$('#import-dialog').showModal();
  } finally {$('#import-file').value='';}
}

$('#map-tab').addEventListener('click',()=>setView('map'));
$('#comparison-tab').addEventListener('click',()=>setView('comparison'));
$('.tabs').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();const next=activeView==='map'?'comparison':'map';setView(next);$(`#${next}-tab`).focus();}});
$('#previous-button').addEventListener('click',()=>{stopPlayback();selectNode(dataset.nodes[Math.max(0,selectedIndex()-1)].id);});
$('#next-button').addEventListener('click',()=>{stopPlayback();selectNode(dataset.nodes[Math.min(dataset.nodes.length-1,selectedIndex()+1)].id);});
$('#play-button').addEventListener('click',play);
$('#model-button').addEventListener('click',()=>openNotes());
$('#sources-button').addEventListener('click',()=>openNotes(true));
$$('.close-dialog').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
$('#export-button').addEventListener('click',()=>{const hidden=!$('#export-menu').hidden;$('#export-menu').hidden=hidden;$('#export-button').setAttribute('aria-expanded',String(!hidden));});
function closeExport(){$('#export-menu').hidden=true;$('#export-button').setAttribute('aria-expanded','false');}
document.addEventListener('click',e=>{if(!e.target.closest('.export-wrap'))closeExport();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeExport();stopPlayback();}});
$('#export-data').addEventListener('click',()=>{download(JSON.stringify(dataset,null,2),'application/json',`${dataset.id}.json`);closeExport();});
$('#export-image').addEventListener('click',()=>{exportSvg();closeExport();});
$('#template-button').addEventListener('click',()=>{const template=structuredClone(DATASETS.find(d=>d.id==='performed-pattern') || DATASETS[0]);template.id='my-cultural-example';template.title='My cultural example';download(JSON.stringify(template,null,2),'application/json','cultural-example-template.json');});
$('#import-button').addEventListener('click',()=>$('#import-file').click());
$('#import-file').addEventListener('change',e=>importFile(e.target.files[0]));
$('#share-button').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);message(imported.some(d=>d.id===dataset.id)?'View link copied. Share the exported dataset too; imported examples stay in this browser.':'View link copied.');}catch{message('Copy this view from the browser address bar.');}});
window.addEventListener('hashchange',()=>{stopPlayback();readAddress();render();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopPlayback();});
new ResizeObserver(()=>requestAnimationFrame(drawConnections)).observe($('#graph'));
readAddress();render();
