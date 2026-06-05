// COLOR LITE CARD
// Simple custom card for displaying lights on a picture elements floor plan

class ColorLite extends HTMLElement {
  set hass(hass) {
    const entityId = this.config.entity;
    const state = hass.states[entityId];

    if (!this.content) {
      const card = document.createElement('ha-card');
      card.style.background = 'none'; card.style.border = 'none'; card.style.boxShadow = 'none';
      this.content = document.createElement('div');
      this.content.style.width = '100%'; this.content.style.height = '100%';
      this.img = document.createElement('img');
      this.img.style.width = '100%'; this.img.style.height = '100%';
      this.img.style.display = 'block'; this.img.style.pointerEvents = 'none';
      this.img.style.transition = 'opacity 0.7s ease-in-out';
      this.content.appendChild(this.img);
      card.appendChild(this.content);
      this.appendChild(card);
      this._prevState = {};
      this._lastFilterStr = "none";
    }

    if (state) {
      const isUnavailable = state.state === 'unavailable' || state.state === 'unknown';
      const bright = state.attributes.brightness || 0;
      const isOn = state.state === 'on';
      
      const targetURL = this.config.image;
      let targetOpacity = 0;
      let filterStr = "";

      if (isUnavailable) {
        targetOpacity = 0;
        filterStr = "none";
      } else {
        targetOpacity = isOn ? (bright / 255) * 0.7 : 0;

        if (isOn) {
          const hs = state.attributes.hs_color || [0, 0];
          const rgb = state.attributes.rgb_color || [255, 255, 255];
          const CTKelvin = state.attributes.color_temp_kelvin;
          const colorMode = state.attributes.color_mode; 
          
          let shadowColor = `${rgb[0]},${rgb[1]},${rgb[2]}`; 

          if (colorMode === 'color_temp' || CTKelvin || !state.attributes.rgb_color) {
            
            shadowColor = (CTKelvin && CTKelvin < 4000) ? "255,210,150" : "240,248,255";

            if (CTKelvin) {
              if (CTKelvin < 4000) {
                let hueShift = Math.max(-20, Math.min(0, -((4000 - CTKelvin) / 100)));
                filterStr = `brightness(1.1) sepia(1) saturate(350%) hue-rotate(${hueShift}deg)`;
              } else {
                filterStr = `brightness(1.25) contrast(1.1) saturate(95%)`;
              }
            } else {
              filterStr = `brightness(1.2)`;	
            }
          } else {
            if (hs[0] <= 15 || hs[0] >= 345) {
              filterStr = `brightness(0.80) sepia(0.6) saturate(750%) hue-rotate(${hs[0] - 38}deg)`;
            } else {
              filterStr = `brightness(0.80) sepia(0.6) saturate(750%) hue-rotate(${hs[0] - 20}deg)`;
            }
          }
          
          filterStr += ` drop-shadow(0 0 5px rgba(${shadowColor},0.2))`;
          
          this._lastFilterStr = filterStr;
        } else {
          filterStr = this._lastFilterStr;
        }
      }

      if (this._prevState.src !== targetURL) {
        this.img.src = targetURL;
        this._prevState.src = targetURL;
      }
      
      if (this._prevState.filter !== filterStr) {
        this.img.style.filter = filterStr;
        this._prevState.filter = filterStr;
      }

      if (this._prevState.opacity !== targetOpacity) {
        this.img.style.opacity = targetOpacity;
        this._prevState.opacity = targetOpacity;
      }
    }
  }

  setConfig(config) { this.config = config; }
  getCardSize() { return 3; }
}
customElements.define('color-lite-card', ColorLite);
