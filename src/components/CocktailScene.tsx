'use client';
import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type * as Three from 'three';

export default function CocktailScene({progress,onReady}:{progress:MutableRefObject<number>;onReady:(ready:boolean)=>void}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{let cancelled=false;let dispose=()=>{};
 (async()=>{try{
 const T=await import('three');const {RoundedBoxGeometry}=await import('three/addons/geometries/RoundedBoxGeometry.js');const {RoomEnvironment}=await import('three/addons/environments/RoomEnvironment.js');if(cancelled||!host.current)return;
 const el=host.current;const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;el.appendChild(renderer.domElement);
 const scene=new T.Scene();const camera=new T.PerspectiveCamera(36,1,.1,60);camera.position.set(0,1.5,10);
 const pmrem=new T.PMREMGenerator(renderer);const room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight(0xa1d8e0,0x28180b,2));const key=new T.DirectionalLight(0xffd99c,5);key.position.set(3,5,4);scene.add(key);const rim=new T.PointLight(0x8ac8d6,50);rim.position.set(-3,2,-2);scene.add(rim);
 // Physical optics and continuous, closed glass profiles. All assets are original procedural models.
 const textures:Three.Texture[]=[];
 let seed=81723;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 function texture(kind:'rind'|'slice'|'ice'){
 const c=document.createElement('canvas');c.width=c.height=512;const x=c.getContext('2d')!;
 x.fillStyle=kind==='ice'?'#d8e0e2':kind==='rind'?'#dfb524':'#fff1a1';x.fillRect(0,0,512,512);
 if(kind==='slice'){
 const cx=256,cy=256;x.fillStyle='#edc236';x.beginPath();x.arc(cx,cy,252,0,Math.PI*2);x.fill();x.fillStyle='#fff5c6';x.beginPath();x.arc(cx,cy,229,0,Math.PI*2);x.fill();
 for(let i=0;i<10;i++){const a=i*Math.PI/5+.035,b=(i+1)*Math.PI/5-.035;x.fillStyle=i%2?'#f2d763':'#e9c44b';x.beginPath();x.moveTo(cx,cy);x.arc(cx,cy,216,a,b);x.closePath();x.fill();
 for(let j=0;j<190;j++){const ang=a+rand()*(b-a),r=20+Math.sqrt(rand())*186;const px=cx+Math.cos(ang)*r,py=cy+Math.sin(ang)*r;x.strokeStyle=rand()>.5?'#ffefac88':'#b490272a';x.lineWidth=.5+rand();x.beginPath();x.moveTo(px,py);x.lineTo(px+Math.cos(ang)*(5+rand()*12),py+Math.sin(ang)*(5+rand()*12));x.stroke()}}
 x.fillStyle='#fff7d2';x.beginPath();x.arc(cx,cy,13,0,Math.PI*2);x.fill();
 }else{for(let i=0;i<18000;i++){const v=rand();x.fillStyle=kind==='ice'?`rgba(255,255,255,${v*.23})`:`rgba(${v>.5?'255,243,123':'103,79,6'},${.03+rand()*.19})`;x.beginPath();x.arc(rand()*512,rand()*512,.3+rand()*1.5,0,Math.PI*2);x.fill()}}
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());textures.push(t);return t;
 }
 const rindMap=texture('rind'),sliceMap=texture('slice'),iceMap=texture('ice');
 const glass=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.025,metalness:0,transmission:1,thickness:.045,ior:1.5,clearcoat:1,envMapIntensity:1.7});
 const amber=new T.MeshPhysicalMaterial({color:0xffc66e,metalness:0,roughness:.045,transmission:.88,thickness:.8,ior:1.333,attenuationColor:0xae4104,attenuationDistance:.6,clearcoat:1});
 const group=new T.Group();scene.add(group);
 function mesh(g:Three.BufferGeometry,m:Three.Material|Three.Material[],x=0,y=0,z=0){const a=new T.Mesh(g,m);a.position.set(x,y,z);group.add(a);return a}
 const profile:number[][]=[[.001,-1.35],[.26,-1.35],[.55,-1.34],[.61,-1.32],[.59,-1.29],[.36,-1.275],[.12,-1.25],[.055,-1.19],[.037,-1.05],[.033,-.45],[.039,.12],[.08,.2],[.2,.24],[.4,.31],[.63,.43],[.83,.59],[.99,.8],[1.11,1.04],[1.112,1.065],[1.093,1.067],[1.087,1.042],[.969,.806],[.808,.598],[.612,.44],[.383,.331],[.188,.27],[.05,.25],[.001,.25]];
 const glassBody=mesh(new T.LatheGeometry(profile.map(([x,y])=>new T.Vector2(x,y)),128),glass);
 const liquid=mesh(new T.LatheGeometry([[.001,.27],[.17,.29],[.37,.35],[.6,.46],[.79,.61],[.926,.785],[.93,.794],[.91,.788],[.001,.788]].map(([x,y])=>new T.Vector2(x,y)),96),amber);
 const surface=mesh(new T.CircleGeometry(.923,96),amber,0,.789);surface.rotation.x=-Math.PI/2;
 const rindMaterial=new T.MeshStandardMaterial({map:rindMap,bumpMap:rindMap,bumpScale:.012,roughness:.58,color:0xffee83});
 const flesh=new T.MeshPhysicalMaterial({map:sliceMap,roughness:.38,clearcoat:.45,clearcoatRoughness:.3});
 const garnish=new T.Group();group.add(garnish);
 const slice=new T.Mesh(new T.CylinderGeometry(.43,.43,.085,80),[rindMaterial,flesh,flesh]);slice.rotation.x=Math.PI/2;garnish.add(slice);garnish.position.set(.8,1.01,.17);garnish.rotation.set(.15,.3,-.4);
 const lemonGeometry=new T.SphereGeometry(.42,64,40);const pos=lemonGeometry.attributes.position;
 for(let i=0;i<pos.count;i++){let x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);const t=Math.abs(y)/.42;const taper=1-.18*Math.pow(t,5);pos.setXYZ(i,x*taper,y*1.48+Math.sign(y)*.025*Math.pow(t,12),z*taper)}lemonGeometry.computeVertexNormals();
 const lemon=mesh(lemonGeometry,rindMaterial,2,1,0);lemon.rotation.z=.7;
 const iceMaterial=new T.MeshPhysicalMaterial({color:0xf5fcff,roughness:.08,transmission:1,thickness:.35,ior:1.31,attenuationColor:0xcde6ed,attenuationDistance:1.5,bumpMap:iceMap,bumpScale:.008});
 const cubes=Array.from({length:3},(_,i)=>{const a=mesh(new RoundedBoxGeometry(.32,.3,.34,4,.035),iceMaterial);a.rotation.set(i*.4,.3+i,.2);return a});
 const inclusions=new T.Group();group.add(inclusions);const bubbleGeo=new T.SphereGeometry(.008,6,4);const bubbleMat=new T.MeshPhysicalMaterial({color:0xffffff,roughness:.2,transparent:true,opacity:.23});
 for(let i=0;i<30;i++){const a=new T.Mesh(bubbleGeo,bubbleMat);a.position.set((rand()-.5)*.6,.4+rand()*.35,(rand()-.5)*.6);inclusions.add(a)}
 // Broad studio lights create readable reflections rather than a metal-looking gold rim.
 const softbox=new T.DirectionalLight(0xffffff,2);softbox.position.set(-4,3,6);scene.add(softbox);
 const positions=new Float32Array(180*3);for(let i=0;i<positions.length;i++)positions[i]=(Math.sin(i*127.1)*43758.5453%1)*7;
 const dustGeo=new T.BufferGeometry();dustGeo.setAttribute('position',new T.BufferAttribute(positions,3));const dust=new T.Points(dustGeo,new T.PointsMaterial({size:.018,color:0xc7ad78,transparent:true,opacity:.4}));scene.add(dust);
 const resize=()=>{if(!el.clientWidth||!el.clientHeight)return;renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix()};const ro=new ResizeObserver(resize);ro.observe(el);resize();let pointer={x:0,y:0};const move=(e:PointerEvent)=>{pointer={x:e.clientX/innerWidth-.5,y:e.clientY/innerHeight-.5}};window.addEventListener('pointermove',move,{passive:true});let inView=true;const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting});observer.observe(el);
 const lost=(e:Event)=>{e.preventDefault();onReady(false)};renderer.domElement.addEventListener('webglcontextlost',lost);let smooth=0;
 renderer.setAnimationLoop((time)=>{if(!inView||document.hidden)return;smooth+=(progress.current-smooth)*.07;const p=smooth;const beat=Math.sin(Math.min(1,Math.max(0,(p-.16)/.34))*Math.PI);const assembly=beat*1.25;
 group.position.set(1.3-Math.sin(p*Math.PI)*1.6,-.1+Math.sin(p*Math.PI*2)*.13,0);group.rotation.set(pointer.y*.025,p*Math.PI*.7+pointer.x*.06,0);group.scale.setScalar(1+Math.sin(p*Math.PI)*.25);
 // Keep the glass intact and the drink level. Only ingredients float out for the craft chapter.
 glassBody.position.y=0;liquid.position.y=0;surface.position.y=.789;
 garnish.position.set(.8+assembly*.65,1.01+assembly*.9,.17);garnish.rotation.z=-.4-assembly*.25;
 lemon.visible=assembly>.035;lemon.position.set(1.25+assembly*.6,.7+assembly*.6,-.25);lemon.scale.setScalar(Math.min(1,assembly*3));lemon.rotation.y=p*1.8;
 cubes.forEach((a,i)=>{const angle=i*2.1+p*.5;a.position.set(Math.cos(angle)*(.32+assembly*.85),.66+assembly*(.65+i*.26),Math.sin(angle)*(.32+assembly*.85));a.rotation.y=p*.8+i});
 camera.position.set(Math.sin(p*Math.PI*2)*.7,1.4+Math.sin(p*Math.PI)*1.4,9.3-Math.sin(p*Math.PI)*2);camera.lookAt(0,.2,0);dust.rotation.y=time*.000014;renderer.render(scene,camera);
 });onReady(true);
 dispose=()=>{renderer.setAnimationLoop(null);ro.disconnect();observer.disconnect();window.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(o=>{const m=o as Three.Mesh;if(m.geometry)m.geometry.dispose();if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(x=>x.dispose())});textures.forEach(t=>t.dispose());env.dispose();renderer.dispose();renderer.domElement.remove();};
 }catch{onReady(false)}})();return()=>{cancelled=true;dispose()};
 },[progress,onReady]);
 return <div className="cocktail-canvas" ref={host} aria-hidden="true"/>;
}
