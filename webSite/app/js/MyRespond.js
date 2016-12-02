/**
 * Created by 1 on 2015/12/22.
 */
(function(doc,win){
    var docEl=doc.documentElement,
        resizeEvt='orientationchange' in window?'orientationchange':'resize',
        recalc=function(){
            var clientWidth=docEl.clientWidth;
             // var clientWidth=document.body.clientWidth;

           	if(!clientWidth) return;
           	if(clientWidth>=640){clientWidth = 640;}
            
            docEl.style.fontSize=20*(clientWidth/320)+"px";
            win.initFontSize=20*(clientWidth/320);
        }
    if(!doc.addEventListener) return;
    win.addEventListener(resizeEvt,recalc,false);
    doc.addEventListener('DOMContentLoaded',recalc,false);
})(document,window);