import { AppState, SaveState } from '../stores/States';
import { Filter } from '../stores/Filter';
import { Layer, Header, LayerTypes } from '../stores/Layer';
import { Legend } from '../stores/Legend';

declare var XDomainRequest;

/** Projection names to show in import wizard */
let DefaultProjections: Array<string> = ['WGS84', 'EPSG:4269', 'EPSG:3857', 'ETRS-GK25FIN'];

function GetSymbolSize(val: number, sizeMultiplier: number, minSize: number, maxSize: number) {
    let r = Math.sqrt(val * sizeMultiplier / Math.PI) * 2;
    if (r < minSize)
        return minSize;
    else if (r > maxSize)
        return maxSize;
    return r;

}

function ShowLoading() {
    document.getElementById('loading').style.display = 'flex';
}

function HideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function ShowNotification(text: string) {
    document.getElementById('notificationText').innerText = text;
    document.getElementById('notification').style.display = 'block';
}

function HideNotification() {
    document.getElementById('notification').style.display = 'none';
}

/** Calculate a set of limits between a minimum and maximum values*/
function CalculateLimits(min: number, max: number, count: number, accuracy: number) {
    let limits: number[] = [];
    for (let i = +min; i < max; i += (max - min) / count) {
        let val = +i.toFixed(accuracy);
        if (limits.indexOf(val) === -1)
            limits.push(val);
    }
    // if (limits.indexOf(+max.toFixed(accuracy)) === -1)
    //     limits.push(+max.toFixed(accuracy))
    return limits;
}

function GetItemBetweenLimits(limits: any[], items: any[], value: number) {
    if (!isNaN(value)) {
        if (limits.length > 0)
            for (let i = 0; i < limits.length; i++) {
                if (i < limits.length - 1) {
                    let lowerLimit = limits[i];
                    let upperLimit = limits[i + 1];
                    if (lowerLimit <= value && value < upperLimit) {
                        return items[i];
                    }
                }
                else {
                    return items[items.length - 1]
                }
            }
        else {
            return items[0];
        }
    }
}


/**
 * LoadSavedMap - Loads a specified .mmap-file
 * @param  path      File path
 * @param  onLoad     function to run on load complete
 */
function FetchSavedMap(path: string, appState: AppState) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open('GET', path, true);
    }
    else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open('GET', path);
    } else {
        xhr = null;
    }
    xhr.onload = function() {
        if (xhr.readyState === 4) {
            if (xhr.status === 200 || xhr.status == 0) {
                LoadSavedMap(JSON.parse(xhr.responseText), appState);
            }
        }
    }
    xhr.onerror = function() { console.log('Embedding error in XHR request') }
    xhr.send();
}

function LoadSavedMap(saved: SaveState, appState: AppState) {
    window.location.hash = 'edit';
    console.time("LoadSavedMap")
    let headers: Header[];
    if (saved.baseLayerId) {
        let oldBase = appState.activeBaseLayer;

        if (saved.baseLayerId !== oldBase.id) {
            let newBase = { id: saved.baseLayerId, layer: appState.baseLayers.filter(l => l.id === saved.baseLayerId)[0].layer };
            if (newBase) {
                appState.map.removeLayer(oldBase.layer);
                appState.map.addLayer(newBase.layer);
                appState.activeBaseLayer = newBase;
            }
        }
    }

    for (let lyr of saved.layers) {
        let newLayer = new Layer(appState, lyr);
        newLayer.headers = [];
        for (let j of lyr.headers) {
            newLayer.headers.push(new Header(j));
        }
        newLayer.colorOptions.colorField = newLayer.getHeaderById(lyr.colorOptions['colorHeaderId']);
        newLayer.symbolOptions.iconField = newLayer.getHeaderById(lyr.symbolOptions['iconHeaderId']);
        newLayer.symbolOptions.blockSizeVar = newLayer.getHeaderById(lyr.symbolOptions['blockHeaderId']);
        newLayer.symbolOptions.sizeXVar = newLayer.getHeaderById(lyr.symbolOptions['xHeaderId']);
        newLayer.symbolOptions.sizeYVar = newLayer.getHeaderById(lyr.symbolOptions['yHeaderId']);
        appState.layers.push(newLayer);
        if (newLayer.layerType === LayerTypes.HeatMap)
            appState.heatLayerOrder.push({ id: newLayer.id });
        else
            appState.standardLayerOrder.push({ id: newLayer.id });
        appState.currentLayerId = Math.max(appState.currentLayerId, lyr.id);
    }
    appState.currentLayerId++;
    let layers = appState.layers;
    saved.filters.map(function(f) {
        appState.filters.push(new Filter(appState, f));
    })
    for (let i in appState.layers.slice()) {
        let lyr = appState.layers[i];
        lyr.init();
    }
    appState.legend = new Legend(saved.legend);

    appState.welcomeShown = false;
    appState.editingLayer = appState.layers[0];
    appState.menuShown = !appState.embed;
    console.timeEnd("LoadSavedMap")
}


function IsNumber(val: string) {
    return val == '' || !isNaN(+val)
}

export { DefaultProjections, GetSymbolSize, CalculateLimits, GetItemBetweenLimits, FetchSavedMap, LoadSavedMap, ShowLoading, HideLoading, ShowNotification, HideNotification, IsNumber }
