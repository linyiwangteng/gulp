!function(n,e){var t=n.documentElement,i="orientationchange"in window?"orientationchange":"resize",o=function(){var n=t.clientWidth;n&&(n>=640&&(n=640),t.style.fontSize=20*(n/320)+"px",e.initFontSize=20*(n/320))};n.addEventListener&&(e.addEventListener(i,o,!1),n.addEventListener("DOMContentLoaded",o,!1))}(document,window);