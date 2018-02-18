import $ from 'jquery';
import _ from 'underscore';
import gConfig from './MT3Config';

export default {
    init,
    setZoomLevel,
    setMetaBoardEl,
    applyZoomToElement
};


const zoomBtnSel = [
    gConfig.sels.zoomIn,
    gConfig.sels.zoomOut
].join(',');

const regex = {
    in: /in/,
    out: /out/
};

const storageKey = 'zoomLevel';


let zoomLevel = gConfig.zoomDef;
let metaBoardEl = {};


function init(metaEl) {
    if (localStorage) {
        zoomLevel = localStorage.getItem(storageKey);
    }
    if (metaEl) {
        setMetaBoardEl(metaEl);
        applyZoomToElement();
    }
    bindEvents();
}

function bindEvents() {
    $(zoomBtnSel).on('click', handleZoom);
}

function handleZoom(event) {
    const mode = _.result(event.target, 'id', '');
    setZoomLevel(mode);
    applyZoomToElement();
}

function setZoomLevel(mode) {
    let zIdx = zoomLevel;

    if (regex.in.test(mode)) {
        zIdx--;
    } else if (regex.out.test(mode)) {
        zIdx++;
    }

    zIdx = Math.max(zIdx, 0);
    zIdx = Math.min(zIdx, gConfig.zoom.length - 1);

    zoomLevel = zIdx;
    if (localStorage) {
        localStorage.setItem(storageKey, zoomLevel);
    }
}

function setMetaBoardEl(el) {
    metaBoardEl = el;
}

function applyZoomToElement() {
    const scale = gConfig.zoom[zoomLevel].scale;
    const xformStr = [
        'scale(' + scale + ')',
        'translate(0px, ' + gConfig.zoom[zoomLevel].offset + ')'
    ].join(' ');
    if (_.isFunction(metaBoardEl.css)) {
        metaBoardEl.css('transform', xformStr);
    }
}
