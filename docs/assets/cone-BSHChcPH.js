import"./modulepreload-polyfill-B5Qt9EMX.js";import{i as z,j as p,V as s,k as h,Q as k,l as M,W as A,S as N,P as Z,m as L,n as S,o as R,c as U}from"./three.module-BBdjkFqP.js";import{r as x}from"./resizeViewport-CrUKsUJy.js";const v={type:"change"},w={type:"start"},P={type:"end"},C=1e-6,o={NONE:-1,ROTATE:0,ZOOM:1,PAN:2,TOUCH_ROTATE:3,TOUCH_ZOOM_PAN:4},_=new h,a=new h,I=new s,u=new s,E=new s,c=new k,O=new s,y=new s,b=new s,g=new s;class X extends z{constructor(t,i=null){super(t,i),this.screen={left:0,top:0,width:0,height:0},this.rotateSpeed=1,this.zoomSpeed=1.2,this.panSpeed=.3,this.noRotate=!1,this.noZoom=!1,this.noPan=!1,this.staticMoving=!1,this.dynamicDampingFactor=.2,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.keys=["KeyA","KeyS","KeyD"],this.mouseButtons={LEFT:p.ROTATE,MIDDLE:p.DOLLY,RIGHT:p.PAN},this.target=new s,this.state=o.NONE,this.keyState=o.NONE,this._lastPosition=new s,this._lastZoom=1,this._touchZoomDistanceStart=0,this._touchZoomDistanceEnd=0,this._lastAngle=0,this._eye=new s,this._movePrev=new h,this._moveCurr=new h,this._lastAxis=new s,this._zoomStart=new h,this._zoomEnd=new h,this._panStart=new h,this._panEnd=new h,this._pointers=[],this._pointerPositions={},this._onPointerMove=H.bind(this),this._onPointerDown=Y.bind(this),this._onPointerUp=V.bind(this),this._onPointerCancel=q.bind(this),this._onContextMenu=J.bind(this),this._onMouseWheel=G.bind(this),this._onKeyDown=F.bind(this),this._onKeyUp=W.bind(this),this._onTouchStart=$.bind(this),this._onTouchMove=tt.bind(this),this._onTouchEnd=et.bind(this),this._onMouseDown=K.bind(this),this._onMouseMove=B.bind(this),this._onMouseUp=Q.bind(this),this._target0=this.target.clone(),this._position0=this.object.position.clone(),this._up0=this.object.up.clone(),this._zoom0=this.object.zoom,i!==null&&(this.connect(i),this.handleResize()),this.update()}connect(t){super.connect(t),window.addEventListener("keydown",this._onKeyDown),window.addEventListener("keyup",this._onKeyUp),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerCancel),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.style.touchAction="none"}disconnect(){window.removeEventListener("keydown",this._onKeyDown),window.removeEventListener("keyup",this._onKeyUp),this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerCancel),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}handleResize(){const t=this.domElement.getBoundingClientRect(),i=this.domElement.ownerDocument.documentElement;this.screen.left=t.left+window.pageXOffset-i.clientLeft,this.screen.top=t.top+window.pageYOffset-i.clientTop,this.screen.width=t.width,this.screen.height=t.height}update(){this._eye.subVectors(this.object.position,this.target),this.noRotate||this._rotateCamera(),this.noZoom||this._zoomCamera(),this.noPan||this._panCamera(),this.object.position.addVectors(this.target,this._eye),this.object.isPerspectiveCamera?(this._checkDistances(),this.object.lookAt(this.target),this._lastPosition.distanceToSquared(this.object.position)>C&&(this.dispatchEvent(v),this._lastPosition.copy(this.object.position))):this.object.isOrthographicCamera?(this.object.lookAt(this.target),(this._lastPosition.distanceToSquared(this.object.position)>C||this._lastZoom!==this.object.zoom)&&(this.dispatchEvent(v),this._lastPosition.copy(this.object.position),this._lastZoom=this.object.zoom)):console.warn("THREE.TrackballControls: Unsupported camera type.")}reset(){this.state=o.NONE,this.keyState=o.NONE,this.target.copy(this._target0),this.object.position.copy(this._position0),this.object.up.copy(this._up0),this.object.zoom=this._zoom0,this.object.updateProjectionMatrix(),this._eye.subVectors(this.object.position,this.target),this.object.lookAt(this.target),this.dispatchEvent(v),this._lastPosition.copy(this.object.position),this._lastZoom=this.object.zoom}_panCamera(){if(a.copy(this._panEnd).sub(this._panStart),a.lengthSq()){if(this.object.isOrthographicCamera){const t=(this.object.right-this.object.left)/this.object.zoom/this.domElement.clientWidth,i=(this.object.top-this.object.bottom)/this.object.zoom/this.domElement.clientWidth;a.x*=t,a.y*=i}a.multiplyScalar(this._eye.length()*this.panSpeed),u.copy(this._eye).cross(this.object.up).setLength(a.x),u.add(I.copy(this.object.up).setLength(a.y)),this.object.position.add(u),this.target.add(u),this.staticMoving?this._panStart.copy(this._panEnd):this._panStart.add(a.subVectors(this._panEnd,this._panStart).multiplyScalar(this.dynamicDampingFactor))}}_rotateCamera(){g.set(this._moveCurr.x-this._movePrev.x,this._moveCurr.y-this._movePrev.y,0);let t=g.length();t?(this._eye.copy(this.object.position).sub(this.target),O.copy(this._eye).normalize(),y.copy(this.object.up).normalize(),b.crossVectors(y,O).normalize(),y.setLength(this._moveCurr.y-this._movePrev.y),b.setLength(this._moveCurr.x-this._movePrev.x),g.copy(y.add(b)),E.crossVectors(g,this._eye).normalize(),t*=this.rotateSpeed,c.setFromAxisAngle(E,t),this._eye.applyQuaternion(c),this.object.up.applyQuaternion(c),this._lastAxis.copy(E),this._lastAngle=t):!this.staticMoving&&this._lastAngle&&(this._lastAngle*=Math.sqrt(1-this.dynamicDampingFactor),this._eye.copy(this.object.position).sub(this.target),c.setFromAxisAngle(this._lastAxis,this._lastAngle),this._eye.applyQuaternion(c),this.object.up.applyQuaternion(c)),this._movePrev.copy(this._moveCurr)}_zoomCamera(){let t;this.state===o.TOUCH_ZOOM_PAN?(t=this._touchZoomDistanceStart/this._touchZoomDistanceEnd,this._touchZoomDistanceStart=this._touchZoomDistanceEnd,this.object.isPerspectiveCamera?this._eye.multiplyScalar(t):this.object.isOrthographicCamera?(this.object.zoom=M.clamp(this.object.zoom/t,this.minZoom,this.maxZoom),this._lastZoom!==this.object.zoom&&this.object.updateProjectionMatrix()):console.warn("THREE.TrackballControls: Unsupported camera type")):(t=1+(this._zoomEnd.y-this._zoomStart.y)*this.zoomSpeed,t!==1&&t>0&&(this.object.isPerspectiveCamera?this._eye.multiplyScalar(t):this.object.isOrthographicCamera?(this.object.zoom=M.clamp(this.object.zoom/t,this.minZoom,this.maxZoom),this._lastZoom!==this.object.zoom&&this.object.updateProjectionMatrix()):console.warn("THREE.TrackballControls: Unsupported camera type")),this.staticMoving?this._zoomStart.copy(this._zoomEnd):this._zoomStart.y+=(this._zoomEnd.y-this._zoomStart.y)*this.dynamicDampingFactor)}_getMouseOnScreen(t,i){return _.set((t-this.screen.left)/this.screen.width,(i-this.screen.top)/this.screen.height),_}_getMouseOnCircle(t,i){return _.set((t-this.screen.width*.5-this.screen.left)/(this.screen.width*.5),(this.screen.height+2*(this.screen.top-i))/this.screen.width),_}_addPointer(t){this._pointers.push(t)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let i=0;i<this._pointers.length;i++)if(this._pointers[i].pointerId==t.pointerId){this._pointers.splice(i,1);return}}_trackPointer(t){let i=this._pointerPositions[t.pointerId];i===void 0&&(i=new h,this._pointerPositions[t.pointerId]=i),i.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const i=t.pointerId===this._pointers[0].pointerId?this._pointers[1]:this._pointers[0];return this._pointerPositions[i.pointerId]}_checkDistances(){(!this.noZoom||!this.noPan)&&(this._eye.lengthSq()>this.maxDistance*this.maxDistance&&(this.object.position.addVectors(this.target,this._eye.setLength(this.maxDistance)),this._zoomStart.copy(this._zoomEnd)),this._eye.lengthSq()<this.minDistance*this.minDistance&&(this.object.position.addVectors(this.target,this._eye.setLength(this.minDistance)),this._zoomStart.copy(this._zoomEnd)))}}function Y(e){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(e.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),this._addPointer(e),e.pointerType==="touch"?this._onTouchStart(e):this._onMouseDown(e))}function H(e){this.enabled!==!1&&(e.pointerType==="touch"?this._onTouchMove(e):this._onMouseMove(e))}function V(e){this.enabled!==!1&&(e.pointerType==="touch"?this._onTouchEnd(e):this._onMouseUp(),this._removePointer(e),this._pointers.length===0&&(this.domElement.releasePointerCapture(e.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp)))}function q(e){this._removePointer(e)}function W(){this.enabled!==!1&&(this.keyState=o.NONE,window.addEventListener("keydown",this._onKeyDown))}function F(e){this.enabled!==!1&&(window.removeEventListener("keydown",this._onKeyDown),this.keyState===o.NONE&&(e.code===this.keys[o.ROTATE]&&!this.noRotate?this.keyState=o.ROTATE:e.code===this.keys[o.ZOOM]&&!this.noZoom?this.keyState=o.ZOOM:e.code===this.keys[o.PAN]&&!this.noPan&&(this.keyState=o.PAN)))}function K(e){let t;switch(e.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case p.DOLLY:this.state=o.ZOOM;break;case p.ROTATE:this.state=o.ROTATE;break;case p.PAN:this.state=o.PAN;break;default:this.state=o.NONE}const i=this.keyState!==o.NONE?this.keyState:this.state;i===o.ROTATE&&!this.noRotate?(this._moveCurr.copy(this._getMouseOnCircle(e.pageX,e.pageY)),this._movePrev.copy(this._moveCurr)):i===o.ZOOM&&!this.noZoom?(this._zoomStart.copy(this._getMouseOnScreen(e.pageX,e.pageY)),this._zoomEnd.copy(this._zoomStart)):i===o.PAN&&!this.noPan&&(this._panStart.copy(this._getMouseOnScreen(e.pageX,e.pageY)),this._panEnd.copy(this._panStart)),this.dispatchEvent(w)}function B(e){const t=this.keyState!==o.NONE?this.keyState:this.state;t===o.ROTATE&&!this.noRotate?(this._movePrev.copy(this._moveCurr),this._moveCurr.copy(this._getMouseOnCircle(e.pageX,e.pageY))):t===o.ZOOM&&!this.noZoom?this._zoomEnd.copy(this._getMouseOnScreen(e.pageX,e.pageY)):t===o.PAN&&!this.noPan&&this._panEnd.copy(this._getMouseOnScreen(e.pageX,e.pageY))}function Q(){this.state=o.NONE,this.dispatchEvent(P)}function G(e){if(this.enabled!==!1&&this.noZoom!==!0){switch(e.preventDefault(),e.deltaMode){case 2:this._zoomStart.y-=e.deltaY*.025;break;case 1:this._zoomStart.y-=e.deltaY*.01;break;default:this._zoomStart.y-=e.deltaY*25e-5;break}this.dispatchEvent(w),this.dispatchEvent(P)}}function J(e){this.enabled!==!1&&e.preventDefault()}function $(e){switch(this._trackPointer(e),this._pointers.length){case 1:this.state=o.TOUCH_ROTATE,this._moveCurr.copy(this._getMouseOnCircle(this._pointers[0].pageX,this._pointers[0].pageY)),this._movePrev.copy(this._moveCurr);break;default:this.state=o.TOUCH_ZOOM_PAN;const t=this._pointers[0].pageX-this._pointers[1].pageX,i=this._pointers[0].pageY-this._pointers[1].pageY;this._touchZoomDistanceEnd=this._touchZoomDistanceStart=Math.sqrt(t*t+i*i);const l=(this._pointers[0].pageX+this._pointers[1].pageX)/2,f=(this._pointers[0].pageY+this._pointers[1].pageY)/2;this._panStart.copy(this._getMouseOnScreen(l,f)),this._panEnd.copy(this._panStart);break}this.dispatchEvent(w)}function tt(e){switch(this._trackPointer(e),this._pointers.length){case 1:this._movePrev.copy(this._moveCurr),this._moveCurr.copy(this._getMouseOnCircle(e.pageX,e.pageY));break;default:const t=this._getSecondPointerPosition(e),i=e.pageX-t.x,l=e.pageY-t.y;this._touchZoomDistanceEnd=Math.sqrt(i*i+l*l);const f=(e.pageX+t.x)/2,D=(e.pageY+t.y)/2;this._panEnd.copy(this._getMouseOnScreen(f,D));break}}function et(e){switch(this._pointers.length){case 0:this.state=o.NONE;break;case 1:this.state=o.TOUCH_ROTATE,this._moveCurr.copy(this._getMouseOnCircle(e.pageX,e.pageY)),this._movePrev.copy(this._moveCurr);break;case 2:this.state=o.TOUCH_ZOOM_PAN;for(let t=0;t<this._pointers.length;t++)if(this._pointers[t].pointerId!==e.pointerId){const i=this._pointerPositions[this._pointers[t].pointerId];this._moveCurr.copy(this._getMouseOnCircle(i.x,i.y)),this._movePrev.copy(this._moveCurr);break}break}this.dispatchEvent(P)}const n=new A;document.body.style.margin="0";document.body.appendChild(n.domElement);n.setSize(window.innerWidth,window.innerHeight);const T=new N,r=new Z(75,window.innerWidth/window.innerHeight,.1,100);r.position.set(3,1.5,4);const m=new X(r,n.domElement);m.target.set(0,1.5,0);m.noPan=!0;m.staticMoving=!0;m.update();const it=new L(2,2),d={iResolution:{value:new h(window.innerWidth,window.innerHeight)},iCameraPosition:{value:new s},iViewMatrix:{value:new S},iProjectionMatrix:{value:new S}},ot=`
void main() {
  gl_Position = vec4(position, 1.0);
}`,st=`
precision highp float;
uniform vec2 iResolution;
uniform vec3 iCameraPosition;
uniform mat4 iViewMatrix;
uniform mat4 iProjectionMatrix;

#define MAX_STEPS 200
#define MAX_DIST 1000.0
#define SURF_DIST 0.001

float sdCone(vec3 p, float h, float r) {
  p.y += h / 2.0;
  float tanTheta = r / h;
  float q = length(p.xz);
  float side = dot(vec2(tanTheta, -1.0), vec2(q, p.y));
  float base = -p.y;
  return max(side / sqrt(tanTheta * tanTheta + 1.0), base);
}

float map(vec3 p) {
  return sdCone(p, 1.5, 1.0);
}

float raymarch(vec3 ro, vec3 rd) {
  float d = 0.0;
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * d;
    float dist = map(p);
    if (dist < SURF_DIST) return d;
    d += dist;
    if (d > MAX_DIST) break;
  }
  return -1.0;
}

vec3 getNormal(vec3 p) {
  float eps = 0.001;
  vec2 e = vec2(1.0, -1.0) * 0.5773 * eps;
  return normalize(
    e.xyy * map(p + e.xyy) +
    e.yyx * map(p + e.yyx) +
    e.yxy * map(p + e.yxy) +
    e.xxx * map(p + e.xxx)
  );
}

vec3 getRayDir(vec2 uv) {
  vec4 rayClip = vec4(uv, -1.0, 1.0);
  vec4 rayEye = inverse(iProjectionMatrix) * rayClip;
  rayEye.z = -1.0;
  rayEye.w = 0.0;
  vec4 rayWorld = inverse(iViewMatrix) * rayEye;
  return normalize(rayWorld.xyz);
}

void main() {
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) * 2.0 - 1.0;
  uv.x *= iResolution.x / iResolution.y;

  vec3 ro = iCameraPosition;
  vec3 rd = getRayDir(uv);

  float dist = raymarch(ro, rd);
  vec3 col = vec3(1.0); // weißer Hintergrund

  if (dist > 0.0 && dist < MAX_DIST) {
    vec3 p = ro + rd * dist;
    vec3 n = getNormal(p);
    float lighting = -dot(rd, n);
    if (abs(n.y - 1.0) < 0.1) {
      col = vec3(0.0, 0.3, 1.0); // blauer Boden
    } else {
      col = vec3(lighting);
    }
  }

  gl_FragColor = vec4(col, 1.0);
}`,nt=new R({vertexShader:ot,fragmentShader:st,uniforms:d}),ht=new U(it,nt);T.add(ht);x(n,r,n.domElement);d.iResolution.value.set(n.domElement.width,n.domElement.height);window.addEventListener("resize",()=>{x(n,r,n.domElement),d.iResolution.value.set(n.domElement.width,n.domElement.height)});function j(){requestAnimationFrame(j),m.update(),d.iCameraPosition.value.copy(r.position),d.iViewMatrix.value.copy(r.matrixWorldInverse),d.iProjectionMatrix.value.copy(r.projectionMatrix),n.render(T,r)}j();
