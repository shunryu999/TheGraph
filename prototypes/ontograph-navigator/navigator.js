const $ = id => document.getElementById(id);
const membership = {hominins:'life', 'sars-cov-2':'life', ias:'mind', printing:'mind', unix:'mind'};
const defaults = {life:'hominins', mind:'ias'};
const notes = {
  energy:'The outer level remains visible. This catalog has no sourced cosmic-history dataset yet.',
  matter:'This catalog has no sourced geological or physical-history dataset yet.',
  life:'Explore biological records. The case study defines the available time span; it does not date the beginning of life.',
  mind:'Explore cultural and technical inheritance. These are browsing categories, not a proposed date for the emergence of mind.',
  i:'Your place within the current view. This changes your vantage point, not the age or ancestry of the selected record.'
};
let catalog=[], dataBase='', data=null, state=null, loadRun=0, viewRun=0, reader=null, frameAPIs=null;
let retryAction=()=>location.reload();
const params = new URLSearchParams(location.search);
const escape = x => String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num = (value,unit) => unit === 'yearBP' ? -Number(value) : unit === 'year' ? Number(value) : Number(String(value).slice(0,4))+(Number(String(value).slice(5,7))-1)/12;
const unit = () => data.meta.unit || 'year';
const date = value => {
  if(unit()==='yearBP'){const x=Number(value);return x>=1e6 ? (x/1e6).toLocaleString(undefined,{maximumFractionDigits:3})+' Ma' : x>=1000 ? (x/1000).toLocaleString(undefined,{maximumFractionDigits:2})+' ka' : x+' BP';}
  if(unit()==='month'){const [y,m]=String(value).split('-');return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+m-1]+' '+y;}
  return String(value);
};
const inferred = node => node.provenance ? node.provenance === 'inferred' : !!node.inferred;
const shellNodes = () => {const t=num(state.shell,unit());return data.nodes.filter(n=>num(n.t,unit())<=t+1e-6 && num(n.tEnd ?? data.meta.tEnd,unit())>=t-1e-6);};
function error(message, retry){$('errorText').textContent=message;$('error').hidden=false;retryAction=retry;document.body.dataset.busy='false';}
function busy(value){document.body.dataset.busy=String(value);$('status').textContent=value?'Updating both views…':'';}
function saveURL(){
  const q=new URLSearchParams({level:state.level,d:state.dataset});
  q.set('pick',state.pick || '');
  q.set('shell',state.shell);if(state.expanded)q.set('expanded','1');q.set('g',state.gradient);
  history.replaceState(null,'',location.pathname+'?'+q);
  const link=new URL('../stratasphere-viewer/',location.href);link.searchParams.set('d',state.dataset);if(state.pick)link.searchParams.set('pick',state.pick);
  if(state.expanded)link.searchParams.set('t',state.shell);
  $('standalone').href=link.href;
}
function controls(){
  if(!state)return;
  const available=!['energy','matter'].includes(state.level);
  document.querySelectorAll('[data-level]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.level===state.level)));
  document.querySelectorAll('[data-loop]').forEach(p=>p.classList.toggle('active',p.dataset.loop===state.level));
  $('levelNote').textContent=notes[state.level];$('placeForm').hidden=state.level!=='i';
  $('historyContent').hidden=$('spatialContent').hidden=!available;$('empty').hidden=$('spatialEmpty').hidden=available;$('datasetLabel').hidden=!available;
  if(!available){$('emptyTitle').textContent=state.level==='energy'?'Energy awaits a dataset':'Matter awaits a dataset';$('emptyText').textContent='The navigation level is part of the Ontograph. A dated, located dataset is needed before it can be drawn here. No dates or world history have been assigned to this empty level.';return;}
  const group=state.level==='i'?membership[state.dataset]:state.level;
  $('dataset').replaceChildren(...catalog.filter(e=>membership[e.id]===group).map(e=>new Option(e.title,e.id)));
  $('dataset').value=state.dataset;$('dataset').disabled=false;$('datasetTitle').textContent=data.meta.title;
  const dates=[...new Set([data.meta.tStart,...data.nodes.map(n=>n.t),data.meta.tEnd].map(String))].sort((a,b)=>num(a,unit())-num(b,unit()));
  state.dates=dates;
  $('shell').max=dates.length-1;$('shell').value=dates.indexOf(String(state.shell));$('shell').disabled=false;
  $('shellDate').textContent=date(state.shell);$('earlier').disabled=+$('shell').value===0;$('later').disabled=+$('shell').value===dates.length-1;
  $('expand').disabled=state.expanded;$('whole').disabled=!state.expanded;
  $('scaleNote').textContent=state.expanded?'Outer shell: '+date(state.shell):'Full dataset extent';
  $('gradient').value=state.gradient;$('gradientValue').value=state.gradient.toFixed(1);
  $('record').replaceChildren(new Option('No selection',''),...data.nodes.slice().sort((a,b)=>num(a.t,unit())-num(b.t,unit())).map(n=>new Option(n.label+' · '+date(n.t),n.id)));
  $('record').value=state.pick || '';$('record').disabled=false;
  const records=shellNodes();
  $('sliceSummary').textContent=`${date(state.shell)} · ${records.length} ${records.length===1?'record':'records'} on this shell`;
  $('sliceRecords').replaceChildren(...records.map(n=>{const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.textContent=n.label;b.onclick=()=>selectRecord(n.id);li.append(b);return li;}));
  if(!records.length){const li=document.createElement('li');li.textContent='No records intersect this moment.';$('sliceRecords').append(li);}
  recordCard();
}
function recordCard(){
  const node=data.nodes.find(n=>n.id===state.pick),card=$('recordCard');
  if(!node){card.innerHTML=`<h3>${escape(data.meta.title)}</h3><p>${escape(data.meta.caveats || data.meta.description || '')}</p>`;return;}
  const sources=(node.sources || []).map((s,i)=>/^https?:\/\/\S+$/i.test(s)?`<a href="${escape(s)}" target="_blank" rel="noopener noreferrer">Source ${i+1}</a>`:escape(s));
  const t=num(state.shell,unit()),begin=num(node.t,unit()),end=num(node.tEnd ?? data.meta.tEnd,unit());
  const included=begin<=t+1e-6&&end>=t-1e-6;
  card.innerHTML=`<h3>${escape(node.label)}</h3><p class="meta">${escape(node.dateLabel || date(node.t))} · ${escape(node.place || '')}</p>${inferred(node)?'<p class="inferred">Inferred placement: read the qualification below.</p>':''}<p>${escape(node.note || '')}</p><p class="note">${included?'Shown in the spatial pane at this moment.':'Outside this shell: select this record again to inspect its own date.'}</p>${data.meta.relationshipMode==='comparison'?'<p class="note">Links are editorial comparisons, not asserted ancestry.</p>':''}${sources.length?'<p class="sources">'+sources.join(' · ')+'</p>':''}`;
}
function frameReady(frame){
  return new Promise((resolve,reject)=>{
    let finished=false;
    const timer=setTimeout(()=>finish(new Error('The 3D view did not become ready. Check WebGL and the network, then try again.')),20000);
    function finish(err,api){if(finished)return;finished=true;clearTimeout(timer);frame.removeEventListener('load',loaded);err?reject(err):resolve(api);}
    function loaded(){const api=frame.contentWindow.PhylographEmbed;if(!api){finish(new Error('The 3D renderer is unavailable. Check WebGL and reload the views.'));return;}api.ready.then(()=>finish(null,api),e=>finish(e));}
    if(frame.contentWindow.PhylographEmbed)loaded();else frame.addEventListener('load',loaded);
  });
}
async function connectFrames(){
  const apis=await Promise.all([frameReady($('historyFrame')),frameReady($('sliceFrame'))]);
  for(const api of apis)api.onPick=(id,dataset)=>{if(state && dataset===state.dataset && document.body.dataset.busy!=='true')selectRecord(id);};
  frameAPIs=apis;return apis;
}
let framesReady=connectFrames();framesReady.catch(()=>{});
async function sync(){
  if(!state)return;
  const run=++viewRun;
  controls();saveURL();
  if(['energy','matter'].includes(state.level)){busy(false);$('error').hidden=true;$('status').textContent='No dataset is assigned to this level.';return;}
  busy(true);$('error').hidden=true;
  const view={dataset:state.dataset,pick:state.pick,shell:state.shell,expanded:state.expanded,gradient:state.gradient,reader};
  try{
    const apis=await framesReady;if(run!==viewRun)return;
    const result=await Promise.all(apis.map(api=>api.setView(view)));
    if(run!==viewRun)return;
    if(result.some(r=>!r || r.dataset!==view.dataset))throw new Error('The views did not agree on the current dataset.');
    busy(false);$('status').textContent=`Both views show ${data.meta.title}. Inspected shell: ${date(state.shell)}.`;
  }catch(e){if(run===viewRun)error(e.message,async()=>{for(const id of ['historyFrame','sliceFrame'])$(id).src=$(id).src;framesReady=connectFrames();framesReady.catch(()=>{});await sync();});}
}
async function fetchJSON(url){const response=await fetch(url);if(!response.ok)throw new Error('Could not load '+url+' ('+response.status+').');return response.json();}
async function chooseDataset(id,want={}){
  const run=++loadRun;++viewRun;busy(true);$('error').hidden=true;
  try{
    const entry=catalog.find(e=>e.id===id);if(!entry || !membership[id])throw new Error('This dataset has no Ontograph assignment.');
    const loaded=await fetchJSON(dataBase+entry.path);if(run!==loadRun)return;
    if(!loaded.meta || !Array.isArray(loaded.nodes) || !loaded.nodes.length || !['year','month','yearBP'].includes(loaded.meta.unit || 'year'))throw new Error('This case study does not provide supported dates and records.');
    const candidate=loaded.nodes.find(n=>n.id===want.pick)||loaded.nodes.find(n=>n.id===loaded.meta.defaultPick)||loaded.nodes[0];
    const dates=[loaded.meta.tStart,...loaded.nodes.map(n=>n.t),loaded.meta.tEnd].map(String);
    data=loaded;
    state={dataset:id,level:['energy','matter','i'].includes(want.level)?want.level:membership[id],pick:want.pick===''?'':candidate.id,shell:dates.includes(String(want.shell))?String(want.shell):String(candidate.t),expanded:want.expanded===true,gradient:Number.isFinite(want.gradient)?Math.max(0,Math.min(5,want.gradient)):(loaded.meta.defaultGradient ?? 1)};
    await sync();
  }catch(e){if(run===loadRun){controls();error('The case study could not be opened. '+e.message,()=>chooseDataset(id,want));}}
}
function selectLevel(level){
  if(!state)return;
  ++loadRun;
  if(defaults[level] && membership[state.dataset]!==level){chooseDataset(defaults[level]);return;}
  state.level=level;sync();
}
function selectRecord(id){
  const node=data.nodes.find(n=>n.id===id);state.pick=node?.id||'';
  if(node)state.shell=String(node.t);
  sync();
}
document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>selectLevel(b.dataset.level));
$('returnLife').onclick=()=>selectLevel('life');
$('dataset').onchange=e=>chooseDataset(e.target.value);
$('record').onchange=e=>selectRecord(e.target.value);
$('shell').oninput=e=>{state.shell=state.dates[+e.target.value];sync();};
$('earlier').onclick=()=>{state.shell=state.dates[Math.max(0,+$('shell').value-1)];sync();};
$('later').onclick=()=>{state.shell=state.dates[Math.min(state.dates.length-1,+$('shell').value+1)];sync();};
$('expand').onclick=()=>{state.expanded=true;sync();};$('whole').onclick=()=>{state.expanded=false;sync();};
$('gradient').oninput=e=>{if(state){state.gradient=+e.target.value;sync();}};
$('retry').onclick=()=>retryAction();
$('copyLink').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);$('status').textContent='View link copied. Your coordinates are excluded.';}catch{$('status').textContent='Copy the link from the address bar. Your coordinates are excluded.';}};
$('placeForm').onsubmit=e=>{e.preventDefault();reader={lat:+$('latitude').value,lng:+$('longitude').value};$('removePlace').hidden=false;$('placeNote').textContent='Your place is shown in vermilion. It stays in this page and is excluded from links.';sync();};
$('removePlace').onclick=()=>{reader=null;$('latitude').value=$('longitude').value='';$('removePlace').hidden=true;$('placeNote').textContent='Your place was removed.';sync();};
async function start(){
  try{
    const prefix=location.pathname.includes('/prototypes/')?'../../data/':'../data/';
    const c=await fetchJSON(prefix+'catalog.json');catalog=c.datasets;dataBase=prefix;
    const id=catalog.some(e=>e.id===params.get('d')&&membership[e.id])?params.get('d'):defaults[params.get('level')]||'hominins';
    await chooseDataset(id,{level:params.get('level'),pick:params.has('pick')?params.get('pick'):undefined,shell:params.get('shell'),expanded:params.get('expanded')==='1',gradient:params.has('g') && params.get('g').trim()!==''?Number(params.get('g')):undefined});
  }catch(e){error('The dataset catalog could not be opened. '+e.message,start);}
}
window.addEventListener('popstate',()=>location.reload());
start();
