(window.webpackJsonpmapboard=window.webpackJsonpmapboard||[]).push([[10],{435:function(t,n,e){var i=e(455);"string"==typeof i&&(i=[[t.i,i,""]]);var a={hmr:!0,transform:void 0,insertInto:void 0};e(5)(i,a);i.locals&&(t.exports=i.locals)},454:function(t,n,e){"use strict";var i=e(435);e.n(i).a},455:function(t,n,e){(t.exports=e(4)(!1)).push([t.i,"\n.external-link[data-v-bdae5724] {\r\n  padding-top: 5px;\n}\r\n\r\n",""])},478:function(t,n,e){"use strict";e.r(n);var i={mixins:[e(26).a],props:["count","limit","type"],computed:{externalLinkCount(){return this.count-this.limit},externalLinkAction(){const t=this.options.action;if(t)return t(this.externalLinkCount)||"See more at "},externalLinkDataFromState(){const t=this.options.data;return this.evaluateSlot(t)},externalLinkText(){if(this.options){const t=this.options.name||"";return"vertical-table"===this.type?t?`${this.externalLinkAction} at ${t}`:`${this.externalLinkAction}`:"horizontal-table"===this.type?`${this.externalLinkAction}`:`${this.externalLinkDataFromState}`}return null},externalLinkHref(){return this.options?this.evaluateSlot(this.options.href):null}}},a=(e(454),e(2)),r=Object(a.a)(i,function(){var t=this.$createElement,n=this._self._c||t;return n("div",{staticClass:"external-link"},[n("a",{attrs:{target:"_blank",href:this.externalLinkHref}},[this._v("\n    "+this._s(this.externalLinkText)+"\n    "),n("font-awesome-icon",{attrs:{icon:"external-link","aria-hidden":"true"}})],1)])},[],!1,null,"bdae5724",null);n.default=r.exports}}]);