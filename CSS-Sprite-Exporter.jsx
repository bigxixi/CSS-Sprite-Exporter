//by bigxixi, contact at xixi@bigxixi.com
//中文版
(function ALL(thisObj)
{
	var drawUI = UI(thisObj);
	if(drawUI instanceof Window){
			drawUI.center();
			drawUI.show();
	}else{
		drawUI.layout.layout(true);
	};
    	function UI(thisObj){
            var version = "1.0";
            var scriptName = "CSS Sprite Exporter";
            var Description = "AE合成直接导出CSS精灵图动画   " + version;
            var HelpText = "本脚本可以将AE合成直接导出为CSS精灵图动画\n" + 
                            "使用步骤:\n" + 
                            "1.在AE中打开要导出的合成.\n" + 
                            "2.运行脚本.\n" + 
                            "3.在界面上根据需要做些设置.\n" + 
                            "4.点击导出.\n" + 
                            "将会生成一个文件夹，其中的 \"image\" 文件夹中保存着 \n" + 
                            "导出的雪碧图(png格式)， 另外还有一个html文件用于预览动画和复制代码.\n\n" + 
                            "有问题联系我 - xixi@bigxixi.com";
            //draw UI
            var win = (thisObj instanceof Panel) ? thisObj : new Window("palette",scriptName,undefined,{resizeable:false,});

            var dsp = win.add("statictext",undefined,Description);
                dsp.alignment = ["center","center"];

            var group0 = win.add("group");
                group0.orientation = "row"; 
            
            var group1 = group0.add("group");
                group1.orientation = "column";
                group1.alignChildren = "fill";

            var pal1 = group1.add("panel");
                pal1.text = "最大宽度(单位：px):";
                pal1.alignChildren = "fill";
            var maxWidth = pal1.add("edittext",undefined,5000);

            var pal3 = group1.add("panel");
                pal3.text = "Web兼容性";
                pal3.orientation = "column";
                pal3.alignChildren = "fill";
            var prefixALL = pal3.add("checkbox",undefined,"添加所有前缀");
            var prefix1 = pal3.add("checkbox",undefined,"添加 '-webkit-' 前缀");
            var prefix2 = pal3.add("checkbox",undefined,"添加 '-moz-' 前缀");
            var prefix3 = pal3.add("checkbox",undefined,"添加 '-ms-' 前缀");
            var prefix4 = pal3.add("checkbox",undefined,"添加 '-o-' 前缀");
            

            var group2 = group0.add("group");
                group2.orientation = "column";
                group2.alignChildren = "fill";
                group2.alignment = ["right","top"];


            var pal2 = group2.add("panel");
                pal2.text = "CSS样式设置";
                pal2.orientation = "column";
                pal2.alignChildren = "fill";
            var txt3 = pal2.add("statictext",undefined,"ID名:");
            var idName = pal2.add("edittext",undefined,"mySprite");
            var txt4 = pal2.add("statictext",undefined,"动画名:");
            var animationName = pal2.add("edittext",undefined,"myAnimation");
            var txt5 = pal2.add("statictext",undefined,"跳帧:");
            var skipFrame = pal2.add("edittext",undefined,0);

            var btnGroup = group2.add("group");
                btnGroup.orientation = "row";
            var btn1 = btnGroup.add("button",undefined,"生成");
            var btn2 = btnGroup.add("button",undefined,"帮助");
            
            //functions
            prefixALL.onClick = function(){
                if(prefixALL.value == true){
                    prefix1.value = true;
                    prefix2.value = true;
                    prefix3.value = true;
                    prefix4.value = true;
                }
            }

            btn1.onClick = function(){
                if(!app.preferences.getPrefAsLong("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY")){
                    alert("请勾选 ‘首选项’->'常规'->'允许脚本写入文件和访问网络'。");
                    app.executeCommand(2359);
                    alert("请重新运行脚本。");
                    return;
                }
                if(checkInput(maxWidth.text)[0] == false){
                    alert("最大宽度输入，请检查。");
                    return;
                }
                if(skipFrame.text != 0 && checkInput(skipFrame.text)[0] == false){
                    alert("跳帧输入错误，请检查");
                    return;
                }
                if(checkInput(idName.text)[1] == false){
                    alert("id名输入错误，请检查");
                    return;
                }
                if(checkInput(animationName.text)[1] == false){
                    alert("动画名输入错误，请检查");
                    return;
                }
                GenerateSprite();
            }

            btn2.onClick = function(){
                alert(HelpText);
            }

            function GenerateSprite(){
                var RQerr = "渲染错误！";
                var endmsg = "导出完成！资源存放在：";
                var savetip = "保存到...";
                var osSlash;
                if($.os.toLowerCase().indexOf("mac") == 0){
                    osSlash = "/";
                }else{
                    osSlash = "\\";
                }
                var oriComp = app.project.activeItem;
                var oriW = oriComp.width;
                var oriH = oriComp.height;
                var oriL = Number(oriComp.workAreaDuration).toFixed(2);
                var oriR = oriComp.frameRate;
                var theLocation = File.saveDialog(savetip);
                if(theLocation != null){
                    var aniFolder = new Folder(theLocation.path+osSlash+theLocation.name);
                        aniFolder.create();
                    var imgFolder = new Folder(aniFolder.fsName+osSlash+"images");
                        imgFolder.create();
                    var htmlName = decodeURIComponent("预览_"+theLocation.name+".html")
                    var imgPath = decodeURIComponent("images/"+theLocation.name+".png");
                        theLocation = decodeURIComponent(imgFolder.fsName+osSlash+theLocation.name+".png");
                    var htmlPath = decodeURIComponent(aniFolder.fsName+osSlash+"index.html");
                    var cssCodeAni = "";
                    var cssCodeKeys = "";
                    var htmlCode;
                    var framePosX=[],framePosY=[];
                    var skip = Number(skipFrame.text);
                    var rows,columns = 1;
                    var limitW = limitH = maxWidth.text;
                    var imgIdName = idName.text;
                    var aniName = animationName.text;
                    var compR = Number(oriR/(skip+1)).toFixed(3);
                    var compW = oriW*Math.ceil(oriL*compR);
                    var compH = oriH;
                    var posExp = "[thisLayer.width/2+(index-1)*thisLayer.width,value[1]]";
                    //keep resolution
                    var res = [1,1];
                    if(oriComp.resolutionFactor != "1,1"){
                        res = oriComp.resolutionFactor;
                        oriComp.resolutionFactor = [1,1];
                        }
                    //calculate the size of the final img asset.
                    if((oriW<limitW) && (compW > limitW)){
                        var alertWH = "根据最大宽度限制，图片已做折行处理";
                        for(var j=0;j<compR*oriL;j++){
                            if((j+1)*oriW>limitW){
                                columns = j;
                                rows = Math.ceil(Math.ceil(oriL*compR)/j);
                                if(oriH*rows>limitH){
                                    alertWH = "导出的精灵图尺寸会很大哦。";
                                }
                                alert(alertWH);
                                break;
                            }
                        }
                        compW = oriW*columns;
                        compH = oriH*rows;
                        posExp ='var columns =' + columns +';\n' +
                                'var rows =' + rows +';\n' +
                                'var x,y;\n' +
                                'if(index%columns == 0){\n' +
                                '    x = thisLayer.width*(columns-0.5);\n' +
                                '}else{\n' +
                                '    x = thisLayer.width*(index%columns-0.5);\n' +
                                '}\n' +
                                'y = thisLayer.height*(Math.ceil(index/columns)-0.5);\n' +
                                '[x,y]\n'; 
                    }

                    var tempComp = app.project.items.addComp('TempComp',compW,compH,1,oriL,compR);
                    tempComp.openInViewer();
                    app.project.activeItem.layers.add(oriComp);
                    app.project.activeItem.layer(1).startTime = -Number(oriComp.workAreaStart).toFixed(2);
                    app.project.activeItem.layer(1).position.expression = posExp;
                    for(var i=1;i<compR*oriL;i++){
                        app.project.activeItem.layers[i].duplicate();
                        app.project.activeItem.layers[i+1].startTime=-(skip+i)/compR - Number(oriComp.workAreaStart).toFixed(2);
                    }
                    var picCount = app.project.activeItem.layers.length;
                    for(var m=1;m<=picCount;m++){
                        framePosX[m-1] = -(app.project.activeItem.layers[m].position.valueAtTime(0,false)[0]-oriW/2);
                        framePosY[m-1] = -(app.project.activeItem.layers[m].position.valueAtTime(0,false)[1]-oriH/2);
                    }

                    //write css。
                    cssCodeAni = "#"+imgIdName+" {\n"+
                                "   background-image: url('"+imgPath+"');\n" +
                                "   width: "+oriW+"px;\n" +
                                "   height: "+oriH+ "px;\n";
                    if(prefix1.value == true){
                        cssCodeAni += "   -webkit-animation: "+aniName+" "+oriL+"s " +"steps(1) infinite;\n";
                    }
                    if(prefix2.value == true){
                        cssCodeAni += "   -moz-animation: "+aniName+" "+oriL+"s " +"steps(1) infinite;\n";
                    }
                    if(prefix3.value == true){
                        cssCodeAni += "   -ms-animation: "+aniName+" "+oriL+"s " +"steps(1) infinite;\n";
                    }
                    if(prefix4.value == true){
                        cssCodeAni += "   -o-animation: "+aniName+" "+oriL+"s " +"steps(1) infinite;\n";
                    }
                    cssCodeAni += "   animation: "+aniName+" "+oriL+"s " +"steps(1) infinite;\n" +
                                "}\n";

                    if(prefix1.value == true){
                        cssCodeKeys += "@-webkit-keyframes "+aniName+" {\n" + 
                                    "\t0% { -webkit-background-position: 0px 0px; }\n";
                        for(var n=1;n<picCount;n++){
                            cssCodeKeys += "\t" + Number(n/(picCount-1)*100).toFixed(2) + "% { -webkit-background-position: " + framePosX[n] + "px " + framePosY[n] +"px; }\n";
                        }
                        cssCodeKeys += "}\n";
                    }
                    if(prefix2.value == true){
                        cssCodeKeys += "@-moz-keyframes "+aniName+" {\n" + 
                                    "\t0% { -moz-background-position: 0px 0px; }\n";
                        for(var n=1;n<picCount;n++){
                            cssCodeKeys += "\t" + Number(n/(picCount-1)*100).toFixed(2) + "% { -moz-background-position: " + framePosX[n] + "px " + framePosY[n] +"px; }\n";
                        }
                        cssCodeKeys += "}\n";
                    }
                    if(prefix3.value == true){
                        cssCodeKeys += "@-ms-keyframes "+aniName+" {\n" + 
                                    "\t0% { -ms-background-position: 0px 0px; }\n";
                        for(var n=1;n<picCount;n++){
                            cssCodeKeys += "\t" + Number(n/(picCount-1)*100).toFixed(2) + "% { -ms-background-position: " + framePosX[n] + "px " + framePosY[n] +"px; }\n";
                        }
                        cssCodeKeys += "}\n";
                    }
                    if(prefix4.value == true){
                        cssCodeKeys += "@-o-keyframes "+aniName+" {\n" + 
                                    "\t0% { -o-background-position: 0px 0px; }\n";
                        for(var n=1;n<picCount;n++){
                            cssCodeKeys += "\t" + Number(n/(picCount-1)*100).toFixed(2) + "% { -o-background-position: " + framePosX[n] + "px " + framePosY[n] +"px; }\n";
                        }
                        cssCodeKeys += "}\n";
                    }          
                    cssCodeKeys += "@keyframes "+aniName+" {\n" + 
                                "\t0% { background-position: 0px 0px; }\n";
                    for(var n=1;n<picCount;n++){
                        cssCodeKeys += "\t" + Number(n/(picCount-1)*100).toFixed(2) + "% { background-position: " + framePosX[n] + "px " + framePosY[n] +"px; }\n";
                    }
                    cssCodeKeys += "}\n";

                    //encode clipboard.js v1.6.1 by Zeno Rocha, see https://zenorocha.github.io/clipboard.js
                    var clipboardjs = 
                    "/*!\n" + 
                    " * clipboard.js v1.6.1\n" + 
                    " * https://zenorocha.github.io/clipboard.js\n" + 
                    " *\n" + 
                    " * Licensed MIT © Zeno Rocha\n" + 
                    " */\n" +
                    "!function(e){if(\"object\"==typeof exports&&\"undefined\"!=typeof module)module.exports=e();else if(\"function\"==typeof define&&define.amd)define([],e);else{var t;t=\"undefined\"!=typeof window?window:\"undefined\"!=typeof global?global:\"undefined\"!=typeof self?self:this,t.Clipboard=e()}}(function(){var e,t,n;return function e(t,n,o){function i(a,c){if(!n[a]){if(!t[a]){var l=\"function\"==typeof require&&require;if(!c&&l)return l(a,!0);if(r)return r(a,!0);var u=new Error(\"Cannot find module '\"+a+\"'\");throw u.code=\"MODULE_NOT_FOUND\",u}var s=n[a]={exports:{}};t[a][0].call(s.exports,function(e){var n=t[a][1][e];return i(n?n:e)},s,s.exports,e,t,n,o)}return n[a].exports}for(var r=\"function\"==typeof require&&require,a=0;a<o.length;a++)i(o[a]);return i}({1:[function(e,t,n){function o(e,t){for(;e&&e.nodeType!==i;){if(e.matches(t))return e;e=e.parentNode}}var i=9;if(\"undefined\"!=typeof Element&&!Element.prototype.matches){var r=Element.prototype;r.matches=r.matchesSelector||r.mozMatchesSelector||r.msMatchesSelector||r.oMatchesSelector||r.webkitMatchesSelector}t.exports=o},{}],2:[function(e,t,n){function o(e,t,n,o,r){var a=i.apply(this,arguments);return e.addEventListener(n,a,r),{destroy:function(){e.removeEventListener(n,a,r)}}}function i(e,t,n,o){return function(n){n.delegateTarget=r(n.target,t),n.delegateTarget&&o.call(e,n)}}var r=e(\"./closest\");t.exports=o},{\"./closest\":1}],3:[function(e,t,n){n.node=function(e){return void 0!==e&&e instanceof HTMLElement&&1===e.nodeType},n.nodeList=function(e){var t=Object.prototype.toString.call(e);return void 0!==e&&(\"[object NodeList]\"===t||\"[object HTMLCollection]\"===t)&&\"length\"in e&&(0===e.length||n.node(e[0]))},n.string=function(e){return\"string\"==typeof e||e instanceof String},n.fn=function(e){var t=Object.prototype.toString.call(e);return\"[object Function]\"===t}},{}],4:[function(e,t,n){function o(e,t,n){if(!e&&!t&&!n)throw new Error(\"Missing required arguments\");if(!c.string(t))throw new TypeError(\"Second argument must be a String\");if(!c.fn(n))throw new TypeError(\"Third argument must be a Function\");if(c.node(e))return i(e,t,n);if(c.nodeList(e))return r(e,t,n);if(c.string(e))return a(e,t,n);throw new TypeError(\"First argument must be a String, HTMLElement, HTMLCollection, or NodeList\")}function i(e,t,n){return e.addEventListener(t,n),{destroy:function(){e.removeEventListener(t,n)}}}function r(e,t,n){return Array.prototype.forEach.call(e,function(e){e.addEventListener(t,n)}),{destroy:function(){Array.prototype.forEach.call(e,function(e){e.removeEventListener(t,n)})}}}function a(e,t,n){return l(document.body,e,t,n)}var c=e(\"./is\"),l=e(\"delegate\");t.exports=o},{\"./is\":3,delegate:2}],5:[function(e,t,n){function o(e){var t;if(\"SELECT\"===e.nodeName)e.focus(),t=e.value;else if(\"INPUT\"===e.nodeName||\"TEXTAREA\"===e.nodeName){var n=e.hasAttribute(\"readonly\");n||e.setAttribute(\"readonly\",\"\"),e.select(),e.setSelectionRange(0,e.value.length),n||e.removeAttribute(\"readonly\"),t=e.value}else{e.hasAttribute(\"contenteditable\")&&e.focus();var o=window.getSelection(),i=document.createRange();i.selectNodeContents(e),o.removeAllRanges(),o.addRange(i),t=o.toString()}return t}t.exports=o},{}],6:[function(e,t,n){function o(){}o.prototype={on:function(e,t,n){var o=this.e||(this.e={});return(o[e]||(o[e]=[])).push({fn:t,ctx:n}),this},once:function(e,t,n){function o(){i.off(e,o),t.apply(n,arguments)}var i=this;return o._=t,this.on(e,o,n)},emit:function(e){var t=[].slice.call(arguments,1),n=((this.e||(this.e={}))[e]||[]).slice(),o=0,i=n.length;for(o;o<i;o++)n[o].fn.apply(n[o].ctx,t);return this},off:function(e,t){var n=this.e||(this.e={}),o=n[e],i=[];if(o&&t)for(var r=0,a=o.length;r<a;r++)o[r].fn!==t&&o[r].fn._!==t&&i.push(o[r]);return i.length?n[e]=i:delete n[e],this}},t.exports=o},{}],7:[function(t,n,o){!function(i,r){if(\"function\"==typeof e&&e.amd)e([\"module\",\"select\"],r);else if(\"undefined\"!=typeof o)r(n,t(\"select\"));else{var a={exports:{}};r(a,i.select),i.clipboardAction=a.exports}}(this,function(e,t){\"use strict\";function n(e){return e&&e.__esModule?e:{default:e}}function o(e,t){if(!(e instanceof t))throw new TypeError(\"Cannot call a class as a function\")}var i=n(t),r=\"function\"==typeof Symbol&&\"symbol\"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&\"function\"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?\"symbol\":typeof e},a=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,\"value\"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),c=function(){function e(t){o(this,e),this.resolveOptions(t),this.initSelection()}return a(e,[{key:\"resolveOptions\",value:function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action=t.action,this.emitter=t.emitter,this.target=t.target,this.text=t.text,this.trigger=t.trigger,this.selectedText=\"\"}},{key:\"initSelection\",value:function e(){this.text?this.selectFake():this.target&&this.selectTarget()}},{key:\"selectFake\",value:function e(){var t=this,n=\"rtl\"==document.documentElement.getAttribute(\"dir\");this.removeFake(),this.fakeHandlerCallback=function(){return t.removeFake()},this.fakeHandler=document.body.addEventListener(\"click\",this.fakeHandlerCallback)||!0,this.fakeElem=document.createElement(\"textarea\"),this.fakeElem.style.fontSize=\"12pt\",this.fakeElem.style.border=\"0\",this.fakeElem.style.padding=\"0\",this.fakeElem.style.margin=\"0\",this.fakeElem.style.position=\"absolute\",this.fakeElem.style[n?\"right\":\"left\"]=\"-9999px\";var o=window.pageYOffset||document.documentElement.scrollTop;this.fakeElem.style.top=o+\"px\",this.fakeElem.setAttribute(\"readonly\",\"\"),this.fakeElem.value=this.text,document.body.appendChild(this.fakeElem),this.selectedText=(0,i.default)(this.fakeElem),this.copyText()}},{key:\"removeFake\",value:function e(){this.fakeHandler&&(document.body.removeEventListener(\"click\",this.fakeHandlerCallback),this.fakeHandler=null,this.fakeHandlerCallback=null),this.fakeElem&&(document.body.removeChild(this.fakeElem),this.fakeElem=null)}},{key:\"selectTarget\",value:function e(){this.selectedText=(0,i.default)(this.target),this.copyText()}},{key:\"copyText\",value:function e(){var t=void 0;try{t=document.execCommand(this.action)}catch(e){t=!1}this.handleResult(t)}},{key:\"handleResult\",value:function e(t){this.emitter.emit(t?\"success\":\"error\",{action:this.action,text:this.selectedText,trigger:this.trigger,clearSelection:this.clearSelection.bind(this)})}},{key:\"clearSelection\",value:function e(){this.target&&this.target.blur(),window.getSelection().removeAllRanges()}},{key:\"destroy\",value:function e(){this.removeFake()}},{key:\"action\",set:function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:\"copy\";if(this._action=t,\"copy\"!==this._action&&\"cut\"!==this._action)throw new Error('Invalid \"action\" value, use either \"copy\" or \"cut\"')},get:function e(){return this._action}},{key:\"target\",set:function e(t){if(void 0!==t){if(!t||\"object\"!==(\"undefined\"==typeof t?\"undefined\":r(t))||1!==t.nodeType)throw new Error('Invalid \"target\" value, use a valid Element');if(\"copy\"===this.action&&t.hasAttribute(\"disabled\"))throw new Error('Invalid \"target\" attribute. Please use \"readonly\" instead of \"disabled\" attribute');if(\"cut\"===this.action&&(t.hasAttribute(\"readonly\")||t.hasAttribute(\"disabled\")))throw new Error('Invalid \"target\" attribute. You cant cut text from elements with \"readonly\" or \"disabled\" attributes');this._target=t}},get:function e(){return this._target}}]),e}();e.exports=c})},{select:5}],8:[function(t,n,o){!function(i,r){if(\"function\"==typeof e&&e.amd)e([\"module\",\"./clipboard-action\",\"tiny-emitter\",\"good-listener\"],r);else if(\"undefined\"!=typeof o)r(n,t(\"./clipboard-action\"),t(\"tiny-emitter\"),t(\"good-listener\"));else{var a={exports:{}};r(a,i.clipboardAction,i.tinyEmitter,i.goodListener),i.clipboard=a.exports}}(this,function(e,t,n,o){\"use strict\";function i(e){return e&&e.__esModule?e:{default:e}}function r(e,t){if(!(e instanceof t))throw new TypeError(\"Cannot call a class as a function\")}function a(e,t){if(!e)throw new ReferenceError(\"this hasn't been initialised - super() hasn't been called\");return!t||\"object\"!=typeof t&&\"function\"!=typeof t?e:t}function c(e,t){if(\"function\"!=typeof t&&null!==t)throw new TypeError(\"Super expression must either be null or a function, not \"+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function l(e,t){var n=\"data-clipboard-\"+e;if(t.hasAttribute(n))return t.getAttribute(n)}var u=i(t),s=i(n),f=i(o),d=function(){function e(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,\"value\"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,n,o){return n&&e(t.prototype,n),o&&e(t,o),t}}(),h=function(e){function t(e,n){r(this,t);var o=a(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return o.resolveOptions(n),o.listenClick(e),o}return c(t,e),d(t,[{key:\"resolveOptions\",value:function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.action=\"function\"==typeof t.action?t.action:this.defaultAction,this.target=\"function\"==typeof t.target?t.target:this.defaultTarget,this.text=\"function\"==typeof t.text?t.text:this.defaultText}},{key:\"listenClick\",value:function e(t){var n=this;this.listener=(0,f.default)(t,\"click\",function(e){return n.onClick(e)})}},{key:\"onClick\",value:function e(t){var n=t.delegateTarget||t.currentTarget;this.clipboardAction&&(this.clipboardAction=null),this.clipboardAction=new u.default({action:this.action(n),target:this.target(n),text:this.text(n),trigger:n,emitter:this})}},{key:\"defaultAction\",value:function e(t){return l(\"action\",t)}},{key:\"defaultTarget\",value:function e(t){var n=l(\"target\",t);if(n)return document.querySelector(n)}},{key:\"defaultText\",value:function e(t){return l(\"text\",t)}},{key:\"destroy\",value:function e(){this.listener.destroy(),this.clipboardAction&&(this.clipboardAction.destroy(),this.clipboardAction=null)}}],[{key:\"isSupported\",value:function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[\"copy\",\"cut\"],n=\"string\"==typeof t?[t]:t,o=!!document.queryCommandSupported;return n.forEach(function(e){o=o&&!!document.queryCommandSupported(e)}),o}}]),t}(s.default);e.exports=h})},{\"./clipboard-action\":7,\"good-listener\":4,\"tiny-emitter\":6}]},{},[8])(8)});\n";
                    
                    //write html
                    htmlCode = "<!DOCTYPE html>\n" + 
                                "<html>\n" + 
                                "<head>\n" + 
				"<title>"+imgIdName+"动画预览页面 by AE CSS Exporter</title>\n" + 
                                "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\" />\n" + 
                                "<meta http-equiv=\"X-UA-Compatible\" content=\"chrome=1,IE=edge\" />\n" + 
                                "<style>\n" + 
                                ".playground{\n" + 
                                "	position: absolute;\n" + 
                                "	top: 50%;\n" + 
                                "	left: 30%;\n" + 
                                "	transform: translate(-50%, -50%) scale(1,1);\n" + 
                                "}\n"+
                                cssCodeAni + 
                                cssCodeKeys +
                                "html{\n" + 
                                "	position: relative;\n" + 
                                "	height:100%;	\n" + 
                                "}\n" + 
                                "\n" + 
                                "body{\n" + 
                                "	width:100%;\n" + 
                                "	height:100%;\n" + 
                                "	position: relative;\n" + 
                                "}\n" + 
                                "p{\n" + 
                                "	width: 250px;\n" + 
                                "	margin: 5px 0px 5px 10px;\n" + 
                                "}\n" + 
                                ".changeBG{\n" + 
                                "    border-radius: 4px;\n" + 
                                "    display: inline-block;\n" + 
                                "    cursor: pointer;\n" + 
                                "	 width: 50px;\n" + 
                                "	 height: 30px;\n" + 
                                "	 margin: 0px 0px 5px 10px;\n" + 
                                "}\n" + 
                                ".controlPad{\n" + 
                                "	position: absolute;\n" + 
                                "	border-radius: 4px;\n" + 
                                "	left: 65%;\n" + 
                                "   transform: scale(0.85,0.85);\n" +
                                "	bottom:5%;\n" + 
                                "}\n" + 
                                "#css-animtate{\n" + 
                                "	display: block;\n" + 
                                "	font-family: sans-serif;\n" + 
                                "    width: 480px;\n" + 
                                "    min-height: 100px;\n" + 
                                "    font-size: 13px;\n" + 
                                "    line-height: 1.3;\n" + 
                                "    resize: none;\n" + 
                                "    box-shadow: 0px 0px 8px 2px darkgray;\n" + 
                                "    border: none;\n" + 
                                "    border-radius: 4px;\n" + 
                                "    margin: 10px;\n" + 
                                "    padding: 10px;\n" + 
                                "    overflow: auto;\n" + 
                                "    box-sizing: border-box;\n" + 
                                "	background-color: white;\n" + 
                                "}\n" + 
                                "#css-keyframes{\n" + 
                                "	display: block;\n" + 
                                "	font-family: sans-serif;\n" + 
                                "    width: 480px;\n" + 
                                "    min-height: 400px;\n" + 
                                "    font-size: 13px;\n" + 
                                "    line-height: 1.3;\n" + 
                                "    resize: none;\n" + 
                                "    box-shadow: 0px 0px 8px 2px darkgray;\n" + 
                                "    border: none;\n" + 
                                "    border-radius: 4px;\n" + 
                                "    margin: 10px;\n" + 
                                "    padding: 10px;\n" + 
                                "    overflow: auto;\n" + 
                                "    box-sizing: border-box;\n" + 
                                "	background-color: white;\n" + 
                                "}\n" + 
                                "#BGColorControlBG{\n" + 
                                "	background-color: white;\n" + 
                                "}\n" + 
                                "#BGblack{\n" + 
                                "    background: linear-gradient(rgb(10, 10, 10) 5%, rgb(100, 100, 100) 100%) rgb(237, 237, 237);\n" + 
                                "}\n" + 
                                "#BGwhite{\n" + 
                                "	background: linear-gradient(rgb(255, 255, 255) 5%, rgb(223, 223, 223) 100%) rgb(237, 237, 237);\n" + 
                                "}\n" + 
                                "#BGtransparent{\n" + 
                                "	box-shadow: rgb(150, 150, 150) 0px 0px 10px 3px inset;\n" + 
                                "}\n" + 
                                "#BGcustom{\n" + 
                                "	background: linear-gradient(rgb(237, 237, 237) 5%, rgb(223, 223, 223) 100%) rgb(237, 237, 237);\n" + 
                                "    font-family: Arial;\n" + 
                                "    text-decoration: none;\n" + 
                                "    text-shadow: rgb(255, 255, 255) 0px 1px 0px;	\n" + 
                                "}\n" + 
                                "#colorInput{\n" + 
                                "    width: 215px;\n" + 
                                "	height: 22px;\n" + 
                                "	text-align: left;\n" + 
                                "    font-size: 13px;\n" + 
                                "	line-height: 1.6em;\n" + 
                                "    resize: none;\n" + 
                                "	margin-bottom: 0px;\n" + 
                                "    border: none;\n" + 
                                "    border-radius: 4px;\n" + 
                                "	background-color: white;\n" + 
                                "}\n" + 
                                ".btn{\n" + 
                                "	background: linear-gradient(rgb(237, 237, 237) 5%, rgb(223, 223, 223) 100%) rgb(237, 237, 237);\n" + 
                                "    border-radius: 8px;\n" + 
                                "    display: inline-block;\n" + 
                                "	position: relative;\n" + 
                                "    cursor: pointer;\n" + 
                                "    color: rgb(119, 119, 119);\n" + 
                                "    font-family: Arial;\n" + 
                                "	width: 150px;\n" + 
                                "	text-align: center;\n" + 
                                "    font-size: 15px;\n" + 
                                "	float:right;\n" + 
                                "	margin: 10px;\n" + 
                                "    text-decoration: none;\n" + 
                                "    text-shadow: rgb(255, 255, 255) 0px 1px 0px;\n" + 
                                "}\n" + 
                                "button{\n" + 
                                "	border: none;\n" + 
                                "}\n" + 
                                "#matt{\n" + 
                                "	position: fixed;\n" + 
                                "	margin: 0;\n" + 
                                "	padding: 0;\n" + 
                                "	width: 100%;\n" + 
                                "	height: 100%;\n" + 
                                "	background-color: black;\n" + 
                                "	opacity: 0.8;\n" + 
                                "	display: none;\n" + 
                                "	transform: scale(2,2);\n" + 
                                "}\n" + 
                                "#rawIMG{\n" + 
                                "	position: fixed;\n" + 
                                "	cursor: zoom-in;\n" + 
                                "	top: 50%;\n" + 
                                "	left: 50%;\n" + 
                                "	transform: translate(-50%, -50%);\n" + 
                                "	margin: 0;\n" + 
                                "	padding: 0;\n" + 
                                "	display: none;\n" + 
                                "}\n" + 
                                "#dsp{\n" + 
                                "	position: fixed;\n" + 
                                "	top: 95%;\n" + 
                                "	left: 50%;\n" + 
                                "   width: 50%;\n" +
                                "	text-align: center;\n" + 
                                "	transform: translate(-50%, -50%);\n" + 
                                "	margin: 0;\n" + 
                                "	padding: 0;\n" + 
                                "	display: none;\n" + 
                                "}\n" + 
                                "#setColor{\n" + 
                                "	vertical-align: middle;\n" + 
                                "	line-height: 1.6em;\n" + 
                                "	text-align: center;\n" + 
                                "    font-size: 15px;\n" + 
                                "    text-decoration: none;\n" + 
                                "    text-shadow: rgb(255, 255, 255) 0px 1px 3px;\n" + 
                                "	margin-bottom: 20px;\n" + 
                                "}\n" + 
                                "</style>\n" + 
                                "<script>\n" + 
                                "	function transparentBG(){\n" + 
                                "		var imgcode = 'iVBORw0KGgoAAAANSUhEUgAAAA8AAAAPAQMAAAABGAcJAAAABlBMVEXMzMz////TjRV2AAAAEElEQVQI12P4x4AdMf7DRABP5Q7qGwTjpwAAAABJRU5ErkJggg==';\n" + 
                                "		var img = \"url('data:img/jpg;base64,\"+imgcode+\"')\";\n" + 
                                "		document.body.style.backgroundColor = \"transparent\";\n" + 
                                "		document.body.style.backgroundImage = img;\n" + 
                                "		document.getElementById('BGtransparent').style.backgroundColor = \"transparent\";\n" + 
                                "		document.getElementById('BGtransparent').style.backgroundImage = img;\n" + 
                                "		var w=document.getElementById('rawIMG').width;\n" + 
                                "		var h=document.getElementById('rawIMG').height;\n" + 
                                "		var text=\"图片尺寸: \"+w+\"(w) X \"+h+\"(h)px.\"+\"  点击蒙层返回。\";\n" + 
                                "		document.getElementById('dsp').innerHTML = text;\n" + 
                                "		if(w>=h){\n" + 
                                "			document.getElementById('rawIMG').style.width=\"80%\";\n" + 
                                "		}else{\n" + 
                                "			document.getElementById('rawIMG').style.height=\"80%\";\n" + 
                                "		}\n" + 
                                "	}\n" + 
                                "	window.onload = transparentBG;\n" + 
                                "	function changeStyle(btn){\n" + 
                                "		if(btn.id == \"BGblack\"){\n" + 
                                "			document.body.style.backgroundImage = \"none\";\n" + 
                                "			document.body.style.backgroundColor = \"#000000\";\n" + 
                                "		}else if(btn.id == \"BGwhite\"){\n" + 
                                "			document.body.style.backgroundImage = \"none\";\n" + 
                                "			document.body.style.backgroundColor = \"#FFFFFF\";		\n" + 
                                "		}else if(btn.id == \"BGtransparent\"){\n" + 
                                "			transparentBG();\n" + 
                                "		}else if(btn.id == \"setColor\"){\n" + 
                                "			var theColor = document.getElementById('colorInput').value;\n" + 
                                "			document.body.style.backgroundImage = \"none\";\n" + 
                                "			document.body.style.backgroundColor = theColor;\n" + 
                                "		}else{\n" + 
                                "			alert(\"背景设置错误。\");\n" + 
                                "		}\n" + 
                                "	}\n" + 
                                "	function showRawImg(){\n" + 
                                "		document.getElementById('matt').style.display = \"block\";\n" + 
                                "		document.getElementById('rawIMG').style.display = \"block\";\n" + 
                                "		document.getElementById('dsp').style.display = \"block\";\n" + 
                                "	}\n" + 
                                "	function closeRaw(){\n" + 
                                "		document.getElementById('matt').style.display = \"none\";\n" + 
                                "		document.getElementById('rawIMG').style.display = \"none\";\n" + 
                                "		document.getElementById('dsp').style.display = \"none\";\n" + 
                                "	}\n" + 
                                "	function getColor(color){\n" + 
                                "		var colorcode = color.value;\n" + 
                                "		if(colorcode != \"\"){\n" + 
                                "			document.getElementById('setColor').style.backgroundColor = colorcode;\n" + 
                                "		}else{\n" + 
                                "			document.getElementById('setColor').style.backgroundColor = document.body.style.backgroundColor;\n" + 
                                "		}\n" + 
                                "	}\n" + 
                                "</script>\n" + 
                                "</head>\n" + 
                                "<body>\n" + 
                                "<div>\n" + 
                                "	<div class=\"playground\" id='"+imgIdName+"' onClick=\"showRawImg()\" style=\"cursor: pointer;\" title=\"点击查看精灵图\"></div>\n" + 
                                "	<div class=\"controlPad\" style=\"background-color: lightgrey;width: 500px;\">\n" + 
                                "		<div style=\"height: 10px;\"></div>\n" + 
                                "		<p style=\"display: inline;\">CSS样式代码:</p>\n" + 
                                "		<button class=\"btn\" data-clipboard-action=\"copy\" data-clipboard-target=\"#css-animtate\" style=\"margin-top:0;\">\n" + 
                                "			一键复制到剪贴板\n" + 
                                "		</button>\n" + 
                                "		<textarea id=\"css-animtate\" spellcheck=\"false\">\n"+cssCodeAni+"\n</textarea>\n" + 
                                "		<p style=\"display: inline;\">keyframe动画代码:</p>\n" + 
                                "		<button class=\"btn\" data-clipboard-action=\"copy\" data-clipboard-target=\"#css-keyframes\" style=\"margin-top:0;\">\n" + 
                                "			一键复制到剪贴板\n" + 
                                "		</button>\n" + 
                                "		<textarea id=\"css-keyframes\" spellcheck=\"false\">\n"+cssCodeKeys+"\n</textarea>\n" + 
                                "		<p>预览背景颜色:</p>\n" + 
                                "		<div id=\"BGColoerControlBG\">\n" + 
                                "		<button class=\"changeBG\" id=\"BGblack\" onclick=\"changeStyle(this)\"></button>\n" + 
                                "		<button class=\"changeBG\" id=\"BGwhite\" onclick=\"changeStyle(this)\"></button>\n" + 
                                "		<button class=\"changeBG\" id=\"BGtransparent\" onclick=\"changeStyle(this)\"></button>\n" + 
                                "		<textarea spellcheck=\"false\" class=\"changeBG\" id=\"colorInput\" placeholder=\"或者输入色值，格式： #FFFFFF\" onkeyup=\"getColor(this)\"></textarea>\n" + 
                                "		<button class=\"changeBG\" id=\"setColor\" onclick=\"changeStyle(this)\">设置</button>\n" + 
                                "		</div>\n" + 
                                "	</div>\n" + 
                                "</div>\n" + 
                                "<div id=\"matt\" onclick=\"closeRaw()\"></div>\n" + 
                                "<p id=\"dsp\" style=\"color:white;\"></p>\n" + 
                                "<img src='"+imgPath+"' id=\"rawIMG\" onclick=\"window.open('"+imgPath+"')\"></img>\n" + 
                                "<script>\n" + 
                                clipboardjs +
                                "new Clipboard('.btn');\n" + 
                                "</script>\n" + 
                                "</body>\n" + 
                                "</html>\n" + 
                                "";
                    //close the renderQueue panel
                    app.project.renderQueue.showWindow(false);
                    //show the correct charactar in the path
                    //theLocation = decodeURIComponent(theLocation);
                    //backup the render queue status, then uncheck the queued items
                    var RQbackup = storeRenderQueue();
                    if(RQbackup[RQbackup.length-1] == "rendering"){
                        alert(RQerr);
                    }else{
                        //call command "save frame as" to add current frame to render queue
                        app.executeCommand(2104);
                        app.project.renderQueue.item(app.project.renderQueue.numItems).render = true;
                        var templateTemp = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).templates;
                        //call hidden template '_HIDDEN X-Factor 16 Premul', which exports png with alpha
                        var setPNG = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).templates[templateTemp.length-1];
                        app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).applyTemplate(setPNG);
                        app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).file = new File(theLocation);
                        //var finalpath = app.project.renderQueue.item(app.project.renderQueue.numItems).outputModule(1).file.fsName;
                        app.project.renderQueue.render();
                        //remove the rendered item and restored the render queue items
                        app.project.renderQueue.item(app.project.renderQueue.numItems).remove();
                        if(RQbackup != null){
                            restoreRenderQueue(RQbackup);					
                        }
                        oriComp.openInViewer();
                        tempComp.remove();
                        app.activeViewer.setActive();
                        app.project.activeItem.resolutionFactor = res;
                        //show alert and open the folder
                        var finalpath = decodeURIComponent(aniFolder.fsName);
                        alert(endmsg + "\n" + finalpath);
                        //finalpath = finalpath.substring(0,finalpath.lastIndexOf('/')+1);
                        var openFolder = new Folder(finalpath);
                        openFolder.execute();
                        var runHtml = new File(aniFolder.fsName + osSlash + htmlName);
                            runHtml.open("w");
                            runHtml.encoding = "UTF-8";
                            runHtml.write(htmlCode);
                            runHtml.close();
                            //runHtml.execute();
                    }
                }
                //store the renderQ,return the index of active render items
                function storeRenderQueue(){
                    var checkeds = [];
                    for(var p = 1;p <= app.project.renderQueue.numItems; p++){
                        if (app.project.renderQueue.item(p).status == RQItemStatus.RENDERING){
                            checkeds.push("rendering");
                            break;
                        }else if(app.project.renderQueue.item(p).status == RQItemStatus.QUEUED){
                                checkeds.push(p);
                                app.project.renderQueue.item(p).render = false;
                        }
                    }
                    return checkeds;
                }
                //restore the renderQ
                function restoreRenderQueue(checkedItems){
                    for(var q = 0;q < checkedItems.length; q++){
                        app.project.renderQueue.item(checkedItems[q]).render = true;
                    }
                }
            }
            //check input values
            var checkInput = function(input){
                var isInt = new RegExp("^[0-9]*[1-9][0-9]*$");
                var isHefazifu = new RegExp("^[_a-zA-Z][_a-zA-Z0-9]*$");
                return [isInt.test(input),isHefazifu(input)];
            }
            return win;
	}

})(this);




