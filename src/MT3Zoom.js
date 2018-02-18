import $ from 'jquery';

import gConfig from './MT3Config';

let zoomLevel = gConfig.zoomDef;
let metaBoardEl = null;

export default {
    init,
    setZoomLevel,
    setMetaBoardEl,
    applyZoomToElement
};

function init() {
    if (localStorage) {
        zoomLevel = localStorage.getItem('zoomLevel');
    }
    bindEvents();
}

function bindEvents() {
    $(gConfig.sels.zoomIn).on('click', handleZoom);
    $(gConfig.sels.zoomOut).on('click', handleZoom);
}

function handleZoom(event) {
    let mode;

    mode = $(event.target).attr('id');
    setZoomLevel(mode);

    applyZoomToElement();
}

function setZoomLevel(mode) {
    let zIdx = zoomLevel;

    if (mode === 'zoom-in') {
        zIdx--;
    } else if (mode === 'zoom-out') {
        zIdx++;
    }

    zIdx = Math.max(zIdx, 0);
    zIdx = Math.min(zIdx, gConfig.zoom.length - 1);

    zoomLevel = zIdx;
    if (localStorage) {
        localStorage.setItem('zoomLevel', zoomLevel);
    }
}

function setMetaBoardEl(el) {
    metaBoardEl = el;
}

function applyZoomToElement() {
    const scale = gConfig.zoom[zoomLevel].scale;
    metaBoardEl.css({
        transform: 'scale(' + scale + ') ' +
        'translate(0px, ' + gConfig.zoom[zoomLevel].offset + ')'
    });
}
