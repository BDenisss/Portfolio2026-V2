/** Pose `html.js` (états initiaux des révélations) et `data-refract="on"` sur Chromium uniquement. */
const FLAG_SCRIPT = `(function(){try{var d=document.documentElement;d.classList.add('js');var ua=navigator.userAgent;if(/Chrome\\//.test(ua)&&!/CriOS|FxiOS/.test(ua)&&window.CSS&&CSS.supports('backdrop-filter','url(#lg-refract) blur(1px)')){d.setAttribute('data-refract','on')}}catch(e){}})()`

export function RefractionFlag() {
  return <script dangerouslySetInnerHTML={{ __html: FLAG_SCRIPT }} />
}
