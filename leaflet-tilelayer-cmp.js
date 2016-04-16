(function(window) {

  L.TileLayer.CMP = L.TileLayer.extend({
    _containerBounds: function() {
      return L.bounds([
        L.point(0, 0),
        L.point(this._width, this._map.getSize().y)
      ]);
    },
    _layerBounds: function() {
      var cb = this._containerBounds();
      return L.bounds([
        this._map.containerPointToLayerPoint(cb.min),
        this._map.containerPointToLayerPoint(cb.max)
      ]);
    },
    _latLngBounds: function() {
      var cb = this._containerBounds();
      return L.latLngBounds([
        this._map.containerPointToLatLng(cb.min),
        this._map.containerPointToLatLng(cb.max)
      ]);
    },
    _clip: function() {
      if (!this._map)
        return;

      var lb = this._layerBounds();
      var e = this.getContainer();
      e.style["overflow"] = "hidden";
      e.style["background"] = "rgba(0,0,0,0.25)";
      e.style["border-right"] = "1px solid #0078A8";
      e.style["left"] = lb.min.x + "px";
      e.style["top"] = lb.min.y + "px";
      e.style["width"] = lb.getSize().x + "px";
      e.style["height"] = lb.getSize().y + "px";
      for (var f = e.firstChild; f; f = f.nextSibling) {
        if (f.style) {
          f.style["margin-top"] = (-lb.min.y) + "px";
          f.style["margin-left"] = (-lb.min.x) + "px";
        }
      }

      this._marker.setLatLng(this._latLngBounds().getSouthEast());
      return this;
    },
    onRemove: function(map) {
      map.off("move", this._clip, this);
      map.removeLayer(this._marker);
      this._marker = null;
      this._width = null;
      L.TileLayer.prototype.onRemove.call(this, map);
    },
    onAdd: function(map) {
      L.TileLayer.prototype.onAdd.call(this, map);
      this._width = Math.round(map.getSize().x / 2);
      this._marker = L.marker(this._latLngBounds().getSouthEast(), {
        draggable: true
      }).on("drag", this.onMarkerDrag, this).addTo(map);
      map.on("move", this._clip, this);
      this._clip();
    },
    onMarkerDrag: function() {
      this._width = this._map.latLngToContainerPoint(this._marker.getLatLng()).x;
      this._clip();
    }
  });
  L.tileLayer.cmp = function(url, options) {
    return new L.TileLayer.CMP(url, options);
  };
})(window);