import $ from 'jquery';
import _ from 'underscore';

import gConfig from './MT3Config';
import Dom from './MT3Dom';

export default {
    init,
    setZoomLevel,
    applyZoomToElement
};


// selector for Zoom buttons
const zoomBtnSel = [
    gConfig.sels.zoomIn,
    gConfig.sels.zoomOut
].join(',');

const regex = {
    in: /in/,
    out: /out/
};

// localStorage item key
const storageKey = 'zoomLevel';

// current zoom level index
let zoomLevel = gConfig.zoomDef;


/** Bind event listeners and apply any previous setting */
function init() {
    if (localStorage) {
        zoomLevel = localStorage.getItem(storageKey);
        if (!_.isNumber(zoomLevel)) {
            zoomLevel = gConfig.zoomDef;
        }
    }
    bindEvents();
    applyZoomToElement();
}

/** Bind zoom button event listener */
function bindEvents() {
    $(zoomBtnSel).on('click', handleZoom);
}

/** Handle zoom events */
function handleZoom(event) {
    const mode = _.result(event.target, 'id', '');
    setZoomLevel(mode);
    applyZoomToElement();
}

/**
 * Set the current zoom level, within limits
 * @param {string} mode
 */
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

/**
 * Apply a CSS transform to the meta board element
 */
function applyZoomToElement() {
    const scale = _.chain(gConfig.zoom)
                   .result(zoomLevel, gConfig.zoomDef)
                   .result('scale')
                   .value();

    const xformStr = [
        'scale(' + scale + ')',
        'translate(0px, ' + gConfig.zoom[zoomLevel].offset + ')'
    ].join(' ');

    Dom.findMetaEl().css('transform', xformStr);
}
