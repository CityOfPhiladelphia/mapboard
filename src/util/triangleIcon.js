L.DivIcon.SVGIcon.noCircleIcon = L.DivIcon.SVGIcon.extend({
    initialize: function(options) {
        options = L.Util.setOptions(this, options)
        options.circleAnchor = L.point(Number(options.iconSize.x)/2, Number(options.iconSize.y)/2)
        options.circleRatio = 0;
        L.DivIcon.SVGIcon.prototype.initialize.call(this, options)

        return options
    },
    /*_createPathDescription: function() {
        var height = Number(this.options.iconSize.y)
        var width = Number(this.options.iconSize.x)
        var weight = Number(this.options.weight)
        var margin = weight

        var startPoint = "M " + margin + " " + (height/2) + " "
        var bottomLeftLine = "L " + (width/2) + " " + (height - margin) + " "
        var bottomRightLine = "L " + (width - margin) + " " + (height/2) + " "
        var topLeftLine = "L " + (width/2) + " " + margin + " Z"

        var d = startPoint + bottomLeftLine + bottomRightLine + topLeftLine

        return d
    }*/
})

L.divIcon.svgIcon.noCircleIcon = function(options) {
    return new L.DivIcon.SVGIcon.NoCircleIcon(options)
}

L.Marker.SVGMarker.NoCircleMarker = L.Marker.SVGMarker.extend({
    options: {
        "iconFactory": L.divIcon.svgIcon.NoCircleIcon
    }
})

L.marker.svgMarker.noCircleMarker = function(latlng, options) {
    return new L.Marker.SVGMarker.noCircleMarker(latlng, options)
}



L.DivIcon.SVGIcon.TriangleIcon = L.DivIcon.SVGIcon.extend({
    initialize: function(options) {
        options = L.Util.setOptions(this, options);
        options.circleAnchor = L.point(Number(options.iconSize.x)/2, Number(options.iconSize.y)/2);
        options.circleRatio = 0;
        options.className = options.className + "-noClick"
        //options.iconSize = L.point(1,1);
        L.DivIcon.SVGIcon.prototype.initialize.call(this, options)
        return options
    },
    _createPathDescription: function() {
        var height = Number(this.options.iconSize.y)
        var width = Number(this.options.iconSize.x)
        var weight = Number(this.options.weight)
        var margin = weight

        /*var startPoint = "M " + margin + " " + (height/2) + " "
        var bottomLeftLine = "L " + (width/2) + " " + (height - margin) + " "
        var bottomRightLine = "L " + (width - margin) + " " + (height/2) + " "
        var topLeftLine = "L " + (width/2) + " " + margin + " Z"
*/
        var startPoint = "M " + margin + " " + (0) + " "
        var leftLine = "L " + (width/2) + " " + (height - margin) + " "
        var rightLine = "L " + (width - margin) + " " + (0) + " Z"
        //var topLeftLine = "L " + (width/2) + " " + margin + " Z"
        //var d = startPoint + bottomLeftLine + bottomRightLine + topLeftLine
        var d = startPoint + leftLine + rightLine

        return d
    }
})

L.divIcon.svgIcon.triangleIcon = function(options) {
    return new L.DivIcon.SVGIcon.TriangleIcon(options)
}

L.Marker.SVGMarker.TriangleMarker = L.Marker.SVGMarker.extend({
    options: {
        "iconFactory": L.divIcon.svgIcon.triangleIcon
    }
})

L.marker.svgMarker.triangleMarker = function(latlng, options) {
    return new L.Marker.SVGMarker.TriangleMarker(latlng, options)
}
