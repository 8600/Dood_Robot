/**
 * Created by PuGe on 2016/7/24.
 */
function cut_string(Original,Before) {return Original.substring(Original.indexOf(Before) + Before.toString().length)}
function cut_string(Original,Before,After){if(Before!=null){var e=Original.indexOf(Before);var f=Original.indexOf(After,e+1);if(f>-1){return Original.substring(e+Before.toString().length,f)}else{return null}}else{return Original.substring(0,Original.indexOf(After))}}
function cut_string(Original,Before,After,Index){var e=Original.indexOf(Before,Index);if(e>-1){if(After!=null){var f=Original.indexOf(After,e+1);if(f>-1){return Original.substring(e+Before.toString().length,f)}else{return null}}else{return Original.substring(e+Before.toString().length)}}else{return null}}
function cut_string_array(e,f,g,h){var aa=[];var ab=0;while(e.indexOf(f,h)>0){aa[ab]=cut_string(e,f,g,h);h=e.indexOf(f,h)+1;ab++};return aa};
function insert_tag_after(Object,Target){var parent=Target.parentNode;if(parent.lastChild==Target){parent.appendChild(Object)}else{parent.insertBefore(Object,Target.nextSibling)}};
function append_element(a,b,c){if(c==0){return(a.concat(b))}else if(c==1){if(a.indexOf(b)<0){return(a.concat(b))}else{return a}}else{if(a.indexOf(b)<0){return(a.concat(b))}else{Array.prototype.remove=function(e){var d=this.indexOf(e);if(d>-1){this.splice(d,1)}};a.remove(b);return a}}}
function string_to_DOM(str) {var a = document.createElement("div");a.innerHTML = str;return a.childNodes;}
function hide_element(Dom) {if(Dom.style.display == "none"){Dom.style.display = "";} else {Dom.style.display = "none";}}
function array_sort(array) {return(array.sort(function(a,b){return a-b;}));}