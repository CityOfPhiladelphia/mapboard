(window.webpackJsonpmapboard=window.webpackJsonpmapboard||[]).push([[16],{485:function(s,t,o){"use strict";o.r(t);var i={mixins:[o(26).a],computed:{additionalTags(){return this.$props.slots.additionalTags||[]},message(){let s="";for(let t of this.additionalTags)s=s+"<"+t+">";s+=this.evaluateSlot(this.$props.slots.text,this.$props.slots.transforms);for(let t of this.additionalTags)s=s+"</"+t+">";return s},style(){if(this.$props.options)return this.$props.options.style||""}}},e=o(2),a=Object(e.a)(i,function(){var s=this.$createElement;return(this._self._c||s)("span",{style:this.style,domProps:{innerHTML:this._s(this.message)}})},[],!1,null,"09c039bc",null);t.default=a.exports}}]);