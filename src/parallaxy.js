/**
 * Parallaxy.js
 * Create beautiful parallax with attributes or in javascript
 * v1.0.0
 * https://github.com/yoannchb-pro/Parallaxy
 */

//For each for IE
if(window.NodeList && !NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
}

if(window.HTMLCollection && !HTMLCollection.prototype.forEach) {
    HTMLCollection.prototype.forEach = Array.prototype.forEach;
}

//ALL PARALLAXY ATTRIBUTES
const ParallaxyAttributes = [
    "parallaxy-y",
    "parallaxy-x",
    "parallaxy-scale",
    "parallaxy-axes",
    "parallaxy-adaptative",
    "parallaxy-breakpoint",
    "parallaxy-speed-x",
    "parallaxy-speed-y",
    "parallaxy-overflow-x",
    "parallaxy-overflow-y",
    "parallaxy-inverted-x",
    "parallaxy-inverted-y",
];

//DEFAULT CONFIG
const ParallaxyDefaultconfig = {
    speed: 0.5,
    scale: 1.5,
    adaptative: 1
}

//PARALLAXY MAIN CLASS
class Parallaxy{
    constructor(config){
        config = this.verfiyConfiguration(config);

        this.config = config;

        this.$el = this.config.element[0] ? this.config.element : [this.config.element];
        this.$el.forEach(function(el){ el.style.willChange = "transform"});

        this.start();
    }

    verfiyConfiguration(config){
        if(!config.element) throw "[Parallaxy] 'element' must be specified when you create a new Parallaxy object";

        if(!config.x && !config.y) config.y = {speed: ParallaxyDefaultconfig.speed};

        if(config.x && !config.x.speed) config.x.speed = ParallaxyDefaultconfig.speed;
        if(config.y && !config.y.speed) config.y.speed = ParallaxyDefaultconfig.speed;

        if(config.x && config.x.speed <= 0) throw "[Parallaxy] 'speed' need to be bigger than 0";
        if(config.y && config.y.speed <= 0) throw "[Parallaxy] 'speed' need to be bigger than 0";
        if(config.x && config.x.speed > 0.65) throw "[Parallaxy] 'speed' need to be smaller than 0.65";
        if(config.y && config.y.speed > 0.65) throw "[Parallaxy] 'speed' need to be smaller than 0.65";

        if(config.scale < 1) throw "[Parallaxy] 'scale' need to be bigger than 1 (or equal but with overflow)";
        if(!config.scale) config.scale = ParallaxyDefaultconfig.scale;

        if(!config.axes) config.axes = window.innerHeight/2;

        if(config.adaptative) {
            const nb = parseInt(config.adaptative);
            if(nb){
                if(nb <= 0) throw "[Parallaxy] parallaxy adaptative number must be > 0";

                config.adaptative = {type: "number", value: nb};
            } else {
                config.adaptative = {type: "query", value: config.adaptative};
            }
        }

        return config;
    }

    start(){
        document.addEventListener("scroll", this.updatePosition.bind(this));

        const obj = this;
        this.$el.forEach(function(el){
            el.addEventListener('load', obj.updatePosition.bind(obj));
        });

        if(this.config.adaptative) this.adaptativeImageHandler();

        this.updatePosition();
    }

    stop(){
        document.removeEventListener("scroll", this.updatePosition.bind(this));
    }

    removeElement(el){
        this.$el.splice(this.$el.indexOf(el),1);
        if(this.$el.length == 0){
            this.stop();
        }
    }

    adddElement(el){
        this.$el.push(el);

        this.stop();
        this.start();
    }

    reset(){
        this.$el.forEach(function(el){
            el.style.transform = "";
        });
    }

    adaptativeImageHandler(){
        const config = this.config.adaptative;
        const type = config.type;
        const value = config.value;

        function getParent(element){
            let parent = element;

            //SETING UP PARENT OF ELEMENT
            if(type == "query"){
                parent = document.querySelector(value);
            } else {
                for(let i=0; i<value; ++i){
                    parent = parent.parentNode;
                }
            }

            return parent;
        }

        function adaptation({parent, element}){
            function setWidth(){
                element.style.width = "100%";
                element.style.height = "auto";
            }
    
            function setHeight(){
                element.style.height = "100%";
                element.style.width = "auto";
            }

            const imageAspectRatio = element.clientWidth / element.clientHeight,
                  parentAspectRatio = parent.clientWidth / parent.clientHeight
                      
            if(imageAspectRatio > parentAspectRatio) setHeight(); else setWidth();
        }

        this.$el.forEach(function(element){
            const parent = getParent(element);
            const fn = adaptation.bind(this, {parent: parent, element: element});
            new ResizeObserver(fn).observe(parent);

            //INITIALISING SIZE
            fn();
        });
    }

    verifyParallaxy(el){
        if(el.getAttribute('parallaxy-x') == null && el.getAttribute('parallaxy-y') == null){
            this.removeElement(el);
            return false;
        }
        return true;
    }

    isIntersectingObserver(element, translation = {x: 0, y: 0}){
        const height = window.innerHeight;
        const additionalHeight = height/2;
    
        const rec = element.getBoundingClientRect();

        //Because rec is only in read mode
        const pos = {
            top: rec.top,
            bottom: rec.bottom,
        }

        pos.top = pos.top + translation.y;
        pos.bottom = pos.bottom + translation.y;
    
        let vIntersect = false;
    
        let topCondition = pos.top >= -additionalHeight && pos.top <= height + additionalHeight;
        let bottomCondition = pos.bottom >= -additionalHeight && pos.bottom <= height + additionalHeight;
    
        if(topCondition || bottomCondition || (pos.top < 0 && pos.bottom > height)) vIntersect = true;
    
        if(vIntersect) return true;
    
        return false;
    }

    matchingBreakingPoint(){
        const breakingPoint = this.config.breakPoint;

        if(!breakingPoint) return false;

        if(window.matchMedia(breakingPoint).matches){
            this.reset();
            return true;
        }

        return false;
    }

    updatePosition(){
        const breaking = this.matchingBreakingPoint();

        const obj = this;
        
        if(!breaking) this.$el.forEach(function(el){
            const valid = obj.verifyParallaxy.bind(obj, el)();
            const intersecting = obj.isIntersectingObserver(el);

            if(valid && intersecting){
                const transform = [];

                transform.push(obj.scale());

                let translation = {x: 0, y: 0};

                if(obj.config.y) {
                    const transY = obj.translateY(el);
                    translation.y = transY;
                    transform.push(`translateY(${transY}px)`);
                }

                if(obj.config.x) {
                    const transX = obj.translateX(el);
                    translation.x = transX;
                    transform.push(`translateX(${transX}px)`);
                }
        
                el.style.transform = transform.join(' ');
            };
        });
    }

    originalRect(el){
        const rec = el.getBoundingClientRect();
        const scale = this.config.scale;

        const top = rec.top;
        const left = rec.left;
        const right = rec.right;
        const bottom = rec.bottom;

        const width = rec.width / scale;
        const height = rec.height / scale;

        const additionalHeight = rec.height - height;
        const additionalWidth = rec.width - width;

        return {
            width,
            height,
            top,
            left,
            right,
            bottom,
            additionalHeight,
            additionalWidth
        }
    }

    scaledRect(el){
        const rec = el.getBoundingClientRect();
        return rec;
    }

    scale(){
        return `scale(${this.config.scale})`;
    }

    translateY(el){
        const speed = this.config.y.speed;
        const isInverted = this.config.y.inverted;

        const scaledRect = this.scaledRect(el);
        const originalRect = this.originalRect(el);

        const scaleSize = originalRect.additionalHeight/2;
        const elementCenterPosition = scaledRect.top + scaledRect.height/2;
        const screenMiddleSize = this.config.axes;
        const elementPositionFromTop =  screenMiddleSize - elementCenterPosition;

        let translation = elementPositionFromTop * speed;
        if(isInverted) translation = -translation; //*(speed/4)

        const newPosition = scaleSize/this.config.scale;
        if(!this.config.y.overflow && Math.abs(translation) >= newPosition) {
            translation = translation < 0 ? -newPosition : newPosition;
        }

        return translation;
    }

    translateX(el){
        const speed = this.config.x.speed;
        const isInverted = this.config.x.inverted;

        const scaledRect = this.scaledRect(el);
        const originalRect = this.originalRect(el);

        const scaleSize = originalRect.additionalWidth/2;
        const elementCenterPosition = scaledRect.top + scaledRect.height/2;
        const screenMiddleSize = this.config.axes;
        const elementPositionFromTop =  screenMiddleSize - elementCenterPosition;

        let translation = elementPositionFromTop * speed;
        if(isInverted) translation = -translation; //*(speed/4)

        const newPosition = scaleSize/this.config.scale;
        if(!this.config.x.overflow && Math.abs(translation) >= newPosition) {
            translation = translation < 0 ? -newPosition : newPosition;
        }

        return translation;
    }
}

//HANDLER ATTRIBUTE
function ParallaxyAttributesHandler(elements){
    elements.forEach(function(el){
        if(!el.getAttribute) return;

        const x = el.getAttribute("parallaxy-x") != null;
        const y = el.getAttribute("parallaxy-y") != null;

        if(x || y){
            const config = {
                element: el,
            }

            if(x){
                const confX = {};

                //speed x
                const speed = el.getAttribute("parallaxy-speed-x");
                confX.speed = parseFloat(speed) || ParallaxyDefaultconfig.speed;

                //invert x
                const invert = el.getAttribute("parallaxy-inverted-x") != null;
                confX.inverted = invert;

                //overflow x
                const overflow = el.getAttribute("parallaxy-overflow-x") != null;
                confX.overflow = overflow;

                config.x = confX;
            }

            if(y){
                const confY = {};

                //speed y
                const speed = el.getAttribute("parallaxy-speed-y");
                confY.speed = parseFloat(speed) || ParallaxyDefaultconfig.speed;

                //invert y
                const invert = el.getAttribute("parallaxy-inverted-y") != null;
                confY.inverted = invert;

                //overflow y
                const overflow = el.getAttribute("parallaxy-overflow-y") != null;
                confY.overflow = overflow;

                config.y = confY;
            }

            //scale
            const scale = el.getAttribute('parallaxy-scale');
            if(scale != null) config.scale = parseFloat(scale);

            //break point
            const breakPoint = el.getAttribute('parallaxy-breakpoint');
            if(breakPoint != null) config.breakPoint = breakPoint;

            //axes
            const axes = el.getAttribute('parallaxy-axes');
            if(axes != null) config.axes = parseFloat(axes);

            //adaptative
            const adaptative = el.getAttribute('parallaxy-adaptative');
            if(adaptative != null) config.adaptative = adaptative.trim() == "" ? ParallaxyDefaultconfig.adaptative : adaptative;

            new Parallaxy(config);
        }
    });
}

//OBSERVER
function ParallaxyObserver(){
    function getMutationObserver() {
        return (
          window.MutationObserver ||
          window.WebKitMutationObserver ||
          window.MozMutationObserver
        );
    }

    const MutationObserver = getMutationObserver();

    const observerDOM = new MutationObserver(function(mutations){
        if (!mutations) return;

        mutations.forEach(function(mutation){ 
            const addedNodes = Array.prototype.slice.call(mutation.addedNodes);
            const removedNodes = Array.prototype.slice.call(mutation.removedNodes);

            const attr = mutation.attributeName;
            if(attr && attr.indexOf('parallaxy') != -1) {
                const el = mutation.target;
                if(el.getAttribute('parallaxy-x') != null || el.getAttribute('parallaxy-y') != null){
                    addedNodes.push(el);
                } else {
                    removedNodes.push(el);
                }
            }

            if(addedNodes && addedNodes.length > 0) ParallaxyAttributesHandler(addedNodes);
        })
    });

    observerDOM.observe(window.document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        removedNodes: true
    });
}

//DOM LOADED
document.addEventListener('DOMContentLoaded', function(){
    ParallaxyObserver();

    ParallaxyAttributesHandler(document.querySelectorAll('[parallaxy-y], [parallaxy-x]'));
});

//EXPORT
if (typeof exports == "object") module.exports = {ParallaxyAttributes, Parallaxy, ParallaxyDefaultconfig};