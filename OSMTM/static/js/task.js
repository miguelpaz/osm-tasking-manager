var roundd = function(input, decimals) {
    var p = Math.pow(10, decimals);
    return Math.round(input*p)/p;
};
var getLink = function(options) {
    if (options.protocol === 'lbrt') {
        var bounds = options.bounds;
        return options.base + OpenLayers.Util.getParameterString({
            left: roundd(bounds.left,5),
            bottom: roundd(bounds.bottom,5),
            right: roundd(bounds.right,5),
            top: roundd(bounds.top,5)
        });
    } else if (options.protocol === 'llz') {
        var c = options.bounds.getCenterLonLat();
        return options.base + OpenLayers.Util.getParameterString({
            lon: roundd(c.lon,5),
            lat: roundd(c.lat,5),
            zoom: options.zoom || 15
        });
    } else if (options.protocol === 'id') {
        var c = options.bounds.getCenterLonLat();
        return options.base + '#map=' + [options.zoom, c.lat, c.lon].join('/');
    }
};
var exportOpen = function(evt) {

    // if the clicked link has 'disabled' class stop event processing
    if ($(evt.target).hasClass('disabled')) {
        return false;
    };

    var url,
        format = new OpenLayers.Format.GeoJSON(),
        f = format.read(current_tile)[0],
        bounds = f.geometry.getBounds();

    bounds.transform(
        new OpenLayers.Projection("EPSG:900913"),
        new OpenLayers.Projection("EPSG:4326")
    );

    switch (this.id) {
    case "josm":
        url = getLink({
            base: 'http://127.0.0.1:8111/load_and_zoom?',
            bounds: bounds,
            protocol: 'lbrt'
        });
        $.ajax({
            url: url,
            complete: function(t) {
                if (t.status != 200) {
                    alert("JOSM remote control did not respond. Do you have JOSM running and configured to be controlled remotely?");
                }
            }
        });
        break;
    case "potlatch2":
        url = getLink({
            base: 'http://www.openstreetmap.org/edit?editor=potlatch2&',
            bounds: bounds,
            zoom: zoom,
            protocol: 'llz'
        });
        window.open(url);
        break;
    case "wp":
        url = getLink({
            base: 'http://walking-papers.org/?',
            bounds: bounds,
            protocol: 'llz'
        });
        window.open(url);
        break;
    case "id":
        url = getLink({
            base: 'http://www.openstreetmap.org/edit?editor=id',
            bounds: bounds,
            zoom: zoom,
            protocol: 'id'
        });
        url += "&gpx=" + gpx_url;
        if (typeof imagery_url != "undefined") {
            // url is supposed to look like tms[22]:http://hiu...
            u = imagery_url.substring(imagery_url.indexOf('http'));
            u = u.replace('zoom', 'z');
            url += "&background=custom:" + u;
        }
        window.open(url);
        break;
    default:
        break;
    }
};
$('#export a').live('click', exportOpen);
