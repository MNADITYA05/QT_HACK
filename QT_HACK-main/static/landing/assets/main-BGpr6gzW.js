import{n as e,r as t,s as n,t as r}from"./jsx-runtime-CG1mpaQU.js";var i=e(),a=n(t(),1),o=r();function s(e,t,n){let r=e.createShader(n);return r?(e.shaderSource(r,t),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS)?r:(console.error(`Shader error:`,e.getShaderInfoLog(r)),e.deleteShader(r),null)):null}function c({title:e=`Enter the Quantum Toom-Cook Simulator`,subtitle:t=`Master reversible polynomial multiplication by managing ancilla scratchpads and optimizing Toffoli depth limits.`,ctaLabel:n=`Open the puzzle`,ctaHref:r=`/puzzle`}){let i=(0,a.useRef)(null),c=(0,a.useRef)({x:0,y:0,tX:0,tY:0}),l=(0,a.useRef)(null);return(0,a.useEffect)(()=>{let e=i.current;if(!e)return;let t=e.getContext(`webgl`)||e.getContext(`experimental-webgl`);if(!t){console.error(`WebGL not supported`);return}let n=s(t,`
      precision mediump float;
      attribute vec2 a_position;
      varying vec2 vUv;
      void main() {
        vUv = .5 * (a_position + 1.);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `,t.VERTEX_SHADER),r=s(t,`
      precision mediump float;
      varying vec2 vUv;
      uniform float u_time;
      uniform float u_ratio;
      uniform vec2 u_pointer_position;
      uniform float u_scroll_progress;
      
      vec2 rotate(vec2 uv, float th) {
        return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
      }
      
      float neuro_shape(vec2 uv, float t, float p) {
        vec2 sine_acc = vec2(0.);
        vec2 res = vec2(0.);
        float scale = 8.;
        for (int j = 0; j < 15; j++) {
          uv = rotate(uv, 1.);
          sine_acc = rotate(sine_acc, 1.);
          vec2 layer = uv * scale + float(j) + sine_acc - t;
          sine_acc += sin(layer) + 2.4 * p;
          res += (.5 + .5 * cos(layer)) / scale;
          scale *= (1.2);
        }
        return res.x + res.y;
      }
      
      void main() {
        vec2 uv = .5 * vUv;
        uv.x *= u_ratio;
        vec2 pointer = vUv - u_pointer_position;
        pointer.x *= u_ratio;
        float p = clamp(length(pointer), 0., 1.);
        p = .5 * pow(1. - p, 2.);
        float t = .001 * u_time;
        vec3 color = vec3(0.);
        float noise = neuro_shape(uv, t, p);
        noise = 1.2 * pow(noise, 3.);
        noise += pow(noise, 10.);
        noise = max(.0, noise - .5);
        noise *= (1. - length(vUv - .5));
        color = vec3(0.5, 0.15, 0.65);
        color = mix(color, vec3(0.02, 0.7, 0.9), 0.32 + 0.16 * sin(2.0 * u_scroll_progress + 1.2));
        color += vec3(0.15, 0.0, 0.6) * sin(2.0 * u_scroll_progress + 1.5);
        color = color * noise;
        gl_FragColor = vec4(color, noise);
      }
    `,t.FRAGMENT_SHADER);if(!n||!r)return;let a=t.createProgram();if(!a)return;if(t.attachShader(a,n),t.attachShader(a,r),t.linkProgram(a),!t.getProgramParameter(a,t.LINK_STATUS)){console.error(`Program link error:`,t.getProgramInfoLog(a)),t.deleteProgram(a),t.deleteShader(n),t.deleteShader(r);return}t.useProgram(a);let o=new Float32Array([-1,-1,1,-1,-1,1,1,1]),u=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,u),t.bufferData(t.ARRAY_BUFFER,o,t.STATIC_DRAW);let d=t.getAttribLocation(a,`a_position`);t.enableVertexAttribArray(d),t.bindBuffer(t.ARRAY_BUFFER,u),t.vertexAttribPointer(d,2,t.FLOAT,!1,0,0);let f=t.getUniformLocation(a,`u_time`),p=t.getUniformLocation(a,`u_ratio`),m=t.getUniformLocation(a,`u_pointer_position`),h=t.getUniformLocation(a,`u_scroll_progress`),g=()=>{let n=Math.min(window.devicePixelRatio,2);e.width=window.innerWidth*n,e.height=window.innerHeight*n,t.viewport(0,0,e.width,e.height),t.uniform1f(p,e.width/e.height)};g(),window.addEventListener(`resize`,g);let _=()=>{let e=performance.now();c.current.x+=(c.current.tX-c.current.x)*.2,c.current.y+=(c.current.tY-c.current.y)*.2,t.uniform1f(f,e),t.uniform2f(m,c.current.x/window.innerWidth,1-c.current.y/window.innerHeight),t.uniform1f(h,window.scrollY/(2*window.innerHeight)),t.drawArrays(t.TRIANGLE_STRIP,0,4),l.current=requestAnimationFrame(_)};_();let v=e=>{c.current.tX=e.clientX,c.current.tY=e.clientY},y=e=>{let t=e.touches[0];t&&(c.current.tX=t.clientX,c.current.tY=t.clientY)};return window.addEventListener(`pointermove`,v),window.addEventListener(`touchmove`,y,{passive:!0}),()=>{window.removeEventListener(`resize`,g),window.removeEventListener(`pointermove`,v),window.removeEventListener(`touchmove`,y),l.current!==null&&cancelAnimationFrame(l.current),t.deleteProgram(a),t.deleteShader(n),t.deleteShader(r)}},[]),(0,o.jsxs)(`div`,{className:`relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden font-sans`,children:[(0,o.jsx)(`canvas`,{ref:i,id:`neuro`,className:`pointer-events-none fixed inset-0 z-0 h-full w-full opacity-95`,"aria-hidden":!0}),(0,o.jsx)(`section`,{className:`z-10 mt-16 flex w-full flex-1 flex-col items-center justify-center px-6`,children:(0,o.jsxs)(`div`,{className:`vortex-animate-seq vortex-outline max-w-2xl rounded-3xl px-8 py-14 text-center backdrop-blur-md`,children:[(0,o.jsx)(`h1`,{className:`vortex-heading vortex-h1`,children:e}),(0,o.jsx)(`p`,{className:`vortex-heading vortex-h2 mb-9 text-white/60`,children:t}),(0,o.jsx)(`a`,{href:r,className:`vortex-outline-btn inline-block rounded-xl px-8 py-4 font-semibold text-white`,children:n})]})})]})}function l(){return(0,o.jsx)(c,{})}(0,i.createRoot)(document.getElementById(`root`)).render((0,o.jsx)(a.StrictMode,{children:(0,o.jsx)(l,{})}));