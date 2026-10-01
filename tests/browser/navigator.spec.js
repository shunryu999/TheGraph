const {test:base,expect}=require('@playwright/test');
const {PNG}=require('pngjs');
const test=base.extend({page:async({page},use)=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('404 (File not found)'))errors.push(m.text());});
  await page.route('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',r=>r.fulfill({path:require.resolve('three/build/three.min.js'),contentType:'application/javascript'}));
  await page.route('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',r=>r.fulfill({path:require.resolve('three/examples/js/controls/OrbitControls.js'),contentType:'application/javascript'}));
  await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:'',contentType:'text/css'}));
  await use(page);expect(errors).toEqual([]);
}});
const nav='/prototypes/ontograph-navigator/';
async function settled(page){await expect(page.locator('body')).toHaveAttribute('data-busy','false');await expect(page.locator('#status')).toContainText('Both views');await expect(page.locator('#error')).toBeHidden();}
async function drawn(canvas){
  await expect.poll(async()=>{
    const png=PNG.sync.read(await canvas.screenshot());let marks=0;
    for(let i=0;i<png.data.length;i+=4)if(Math.min(...png.data.slice(i,i+3))<190)marks++;
    return marks;
  }).toBeGreaterThan(250);
}
test('navigator couples record, dated shell and two real rendered globes',async({page})=>{
  await page.goto(nav);await settled(page);
  await expect(page.locator('[data-level="life"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#record')).toHaveValue('knm-wt-15000');
  await expect(page.locator('#sliceSummary')).toHaveText('1.6 Ma · 2 records on this shell');
  for(const id of ['historyFrame','sliceFrame'])await drawn(page.frameLocator('#'+id).locator('#view canvas'));
  await page.locator('#sliceRecords button').filter({hasText:'KNM-ER 3883'}).click();await settled(page);
  await expect(page.locator('#recordCard h3')).toHaveText('KNM-ER 3883');
  await expect(page.frameLocator('#historyFrame').locator('#card h2')).toHaveText('KNM-ER 3883');
  await expect(page.frameLocator('#sliceFrame').locator('#card h2')).toHaveText('KNM-ER 3883');
  // Canvas label selection must also flow back to the outer navigator.
  const label=page.frameLocator('#historyFrame').locator('.lab:visible').filter({hasNotText:'KNM-ER 3883'}).first();
  const name=await label.textContent();
  const expected=require('../../data/hominin-fossils/hominin-fossils.json').nodes.find(n=>n.label===name);
  await label.click();await settled(page);
  await expect(page.locator('#record')).toHaveValue(expected.id);
  await expect(page.frameLocator('#sliceFrame').locator('#card h2')).toHaveText(name);
  await page.locator('#shell').fill('0');await settled(page);
  await expect(page.locator('#sliceSummary')).toContainText('0 records');
  await expect(page.locator('#sliceRecords')).toContainText('No records intersect');
  await page.locator('#record').selectOption('');await settled(page);
  await page.reload();await settled(page);await expect(page.locator('#record')).toHaveValue('');
});
test('expanding a past shell fills the globe and restores via link',async({page})=>{
  await page.route(/\/stratasphere-viewer\/\?embed=/,async route=>{
    const response=await route.fetch();
    const html=(await response.text()).replace('  theme(); size();','  window.navProbe={uniforms,matP,renderer,getShell:()=>shellTime};\n  theme(); size();');
    await route.fulfill({response,body:html});
  });
  await page.goto(nav);await settled(page);
  const globe=page.frameLocator('#historyFrame').locator('#view');
  expect(Number(await globe.getAttribute('data-shell-radius'))).toBeLessThan(.9);
  expect(await gpuRadius(globe)).toBeLessThan(.9);
  expect(await gpuRadius(page.frameLocator('#sliceFrame').locator('#view'))).toBeCloseTo(1,2);
  const before=await globe.locator('canvas').screenshot();
  await page.locator('#expand').click();await settled(page);
  await expect(globe).toHaveAttribute('data-expanded','true');await expect(globe).toHaveAttribute('data-shell-radius','1');
  expect(await gpuRadius(globe)).toBeCloseTo(1,2);
  expect((await globe.locator('canvas').screenshot()).equals(before)).toBe(false);
  await page.locator('#gradient').fill('2.2');await settled(page);
  await page.reload();await settled(page);
  await expect(page.locator('#gradient')).toHaveValue('2.2');await expect(globe).toHaveAttribute('data-expanded','true');
  await expect(page.locator('#shellDate')).toHaveText('1.6 Ma');
  await page.locator('#whole').click();await settled(page);expect(Number(await globe.getAttribute('data-shell-radius'))).toBeLessThan(1);
  await page.locator('#record').selectOption('tm-266-01-060-1');await settled(page);
  await expect(page.locator('#sliceSummary')).toContainText('1 record');
});
test('level mapping handles unavailable data and keeps the reader location out of links',async({page})=>{
  await page.goto(nav);await settled(page);
  await page.locator('[data-level="energy"]').click();await expect(page.locator('#empty')).toBeVisible();await expect(page.locator('#historyFrame')).toBeHidden();
  await expect(page.locator('#emptyText')).toContainText('No dates');
  await page.reload();await expect(page.locator('#empty')).toBeVisible();
  await page.locator('[data-level="mind"]').click();await settled(page);await expect(page.locator('#dataset')).toHaveValue('ias');
  await page.locator('#dataset').selectOption('unix');await settled(page);await expect(page.locator('#datasetTitle')).toContainText('Unix');
  await expect(page.frameLocator('#sliceFrame').locator('#title')).toContainText('Unix');
  await page.locator('[data-level="i"]').click();await settled(page);
  await page.locator('#latitude').fill('35.1234');await page.locator('#longitude').fill('135.8765');
  await page.getByRole('button',{name:'Set my place'}).click();await settled(page);
  await expect(page.locator('#placeNote')).toContainText('shown in vermilion');
  expect(page.url()).not.toMatch(/35\.1234|135\.8765|lat=|lng=/);
  await expect(page.frameLocator('#historyFrame').locator('#placeOut')).toContainText('Your place');
  await page.reload();await settled(page);await expect(page.locator('#latitude')).toHaveValue('');await expect(page.locator('#removePlace')).toBeHidden();
});
test('latest dataset wins a race and failed data can be retried',async({page})=>{
  await page.goto(nav);await settled(page);
  let release;const gate=new Promise(r=>release=r);
  await page.route('**/ias-machine-lineage/ias-machine-lineage.json',async route=>{await gate;await route.continue();},{times:1});
  const requested=page.waitForRequest('**/ias-machine-lineage/ias-machine-lineage.json');
  await page.locator('[data-level="mind"]').click();await requested;
  await page.locator('[data-level="life"]').click();release();await settled(page);
  await expect(page.locator('#dataset')).toHaveValue('hominins');
  await page.route('**/sars-cov-2-lineages/sars-cov-2-lineages.json',r=>r.fulfill({json:{}}),{times:1});
  await page.locator('#dataset').selectOption('sars-cov-2');await expect(page.locator('#error')).toBeVisible();
  await expect(page.locator('#dataset')).toHaveValue('hominins');
  await page.locator('#retry').click();await settled(page);await expect(page.locator('#dataset')).toHaveValue('sars-cov-2');
  await expect(page.locator('#shellDate')).toContainText('202');
});
test('navigator fits a phone, supports keyboard level selection and draws in dark mode',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({colorScheme:'dark'});
  await page.goto(nav);await settled(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('[data-level="mind"]').focus();await page.keyboard.press('Enter');await settled(page);
  await expect(page.locator('#dataset')).toHaveValue('ias');
  const canvas=page.frameLocator('#sliceFrame').locator('#view canvas');
  const png=PNG.sync.read(await canvas.screenshot());let light=0;
  for(let i=0;i<png.data.length;i+=4)if(Math.max(...png.data.slice(i,i+3))>120)light++;
  expect(light).toBeGreaterThan(100);
  await page.screenshot({path:'test-results/navigator-phone-dark.png',fullPage:true});
});

// Encode the real production vertex shader's radius into an offscreen pixel.
// This catches a CPU label/ring update that fails to expand the rendered globe.
async function gpuRadius(view){return view.evaluate(()=>{
  const {uniforms,matP,renderer,getShell}=window.navProbe;
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute([1,0,0],3));
  geometry.setAttribute('dir',new THREE.Float32BufferAttribute([1,0,0],3));
  geometry.setAttribute('gen',new THREE.Float32BufferAttribute([getShell()],1));
  geometry.setAttribute('cls',new THREE.Float32BufferAttribute([1],1));
  const material=new THREE.ShaderMaterial({uniforms,vertexShader:matP.vertexShader,fragmentShader:'varying vec3 vPos; void main(){gl_FragColor=vec4(length(vPos),0.0,0.0,1.0);}'});
  const scene=new THREE.Scene(),point=new THREE.Points(geometry,material);point.frustumCulled=false;scene.add(point);
  const camera=new THREE.OrthographicCamera(-2,2,2,-2,.1,10);camera.position.z=4;
  const target=new THREE.WebGLRenderTarget(64,64),oldTarget=renderer.getRenderTarget(),oldColor=renderer.getClearColor(new THREE.Color()),oldAlpha=renderer.getClearAlpha();
  try{
    renderer.setRenderTarget(target);renderer.setClearColor(0x000000,0);renderer.render(scene,camera);
    const pixels=new Uint8Array(64*64*4);renderer.readRenderTargetPixels(target,0,0,64,64,pixels);
    let red=-1;for(let i=0;i<pixels.length;i+=4)if(pixels[i+3])red=Math.max(red,pixels[i]);return red/255;
  }finally{renderer.setRenderTarget(oldTarget);renderer.setClearColor(oldColor,oldAlpha);geometry.dispose();material.dispose();target.dispose();}
});}
