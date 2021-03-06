# Parallaxy

Create beautiful images parallax with attributes or in javascript for your website

<img src="./assets/Animation.gif" alt="GIF ANIMATION"></img>

## Update
v1.0.8
- Improvement
- Remove event listener fixed

v1.0.7
- Correctly stop observing
- No more working for IE

v1.0.6
- Fixed observer
- Fixed parallaxy-adaptative on window resize

v1.0.5
- Added `adaptative` parameter (parallaxy-adaptative)

v1.0.4
- Fixed bug for intersecting ellement on y
- Added `axes` parameter (parallaxy-axes)
- Added speed limit (0 < speed < 0.66)

v1.0.3
- Fixed bug for parallaxy x when the element go out of the screen

v1.0.2
- Added `breakPoint` parameter (parallaxy-breakpoint)
- Speed bug correction
- Fixed method reset()
- Object exported
- Improvement

v1.0.1
- Support for IE

## NPM
```
npm i parallaxy-img
```
```js
const {Parallaxy, ParallaxyAttributes, ParallaxyDefaultconfig} = require("parallaxy-img");


//Vue.js
import parallaxy from "parallaxy-img/dist/parallaxy.js";
Vue.use(parallaxy);
```

## CDN
```html
<script type="text/javascript" src="https://cdn.jsdelivr.net/gh/yoannchb-pro/Parallaxy/dist/parallaxy.min.js"></script>
```

## GITHUB
```html
<script type="text/javascript" src="./dist/parallaxy.js"></script>
```

## Documentation

- [Documentation on the github page](https://yoannchb-pro.github.io/Parallaxy/index.html)