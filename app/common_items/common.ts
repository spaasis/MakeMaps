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
 * LoadExternalMap - Load a .mmap file from external URL
 *
 * @param  URL      File URL
 * @param  onLoad     function to run on load complete
 */
function LoadExternalMap(URL: string, onLoad: (string) => void) {

    LoadSavedMap(URL, onLoad);
}

/**
 * LoadSavedMap - Loads a specified .mmap-file
 * @param  path      File path
 * @param  onLoad     function to run on load complete
 */
function LoadSavedMap(path: string, onLoad: (string) => void) {
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
                onLoad(JSON.parse(xhr.responseText));
            }
        }
    }
    xhr.onerror = function() { console.log('Embedding error in XHR request') }
    xhr.send();
}



export { DefaultProjections, GetSymbolSize, CalculateLimits, GetItemBetweenLimits, LoadExternalMap, ShowLoading, HideLoading, ShowNotification, HideNotification }
