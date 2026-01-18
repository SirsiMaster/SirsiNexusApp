// Sirsi UI web components (vanilla)
(function(){
  class SirsiButton extends HTMLElement {
    static get observedAttributes(){ return ['variant','size','disabled']; }
    constructor(){ super(); this.attachShadow({mode:'open'}); }
    connectedCallback(){ this.render(); }
    attributeChangedCallback(){ this.render(); }
    render(){
      const variant = this.getAttribute('variant') || 'primary';
      const size = this.getAttribute('size') || 'md';
      const disabled = this.hasAttribute('disabled');
      const label = this.textContent?.trim() || '';
      this.shadowRoot.innerHTML = `
        <style>
          @import url('https://cdn.jsdelivr.net/gh/SirsiMaster/sirsi-ui@v0.1.0/dist/sirsi-ui.css');
        </style>
        <button class="sirsi-btn sirsi-btn--${variant} sirsi-btn--${size}" ${disabled? 'disabled':''}>
          <slot>${label}</slot>
        </button>
      `;
    }
  }

  class SirsiCard extends HTMLElement {
    static get observedAttributes(){ return ['elevated']; }
    constructor(){ super(); this.attachShadow({mode:'open'}); }
    connectedCallback(){ this.render(); }
    attributeChangedCallback(){ this.render(); }
    render(){
      const elevated = this.hasAttribute('elevated');
      this.shadowRoot.innerHTML = `
        <style>
          @import url('https://cdn.jsdelivr.net/gh/SirsiMaster/sirsi-ui@v0.1.0/dist/sirsi-ui.css');
          :host{display:block}
        </style>
        <div class="sirsi-card ${elevated? 'sirsi-card--elevated':''}">
          <slot></slot>
        </div>
      `;
    }
  }

  customElements.define('sirsi-button', SirsiButton);
  customElements.define('sirsi-card', SirsiCard);

  class SirsiModal extends HTMLElement {
    constructor(){ super(); this.attachShadow({mode:'open'}); }
    connectedCallback(){ this.render(); }
    render(){
      this.shadowRoot.innerHTML = `
        <style>@import url('https://cdn.jsdelivr.net/gh/SirsiMaster/sirsi-ui@v0.1.1/dist/sirsi-ui.css');:host{display:block}</style>
        <div class="sirsi-modal-backdrop" part="backdrop">
          <div class="sirsi-modal" part="modal">
            <div class="sirsi-modal__header">
              <div class="sirsi-modal__title"><slot name="title">Modal</slot></div>
              <button class="sirsi-modal__close" aria-label="Close">×</button>
            </div>
            <div class="sirsi-modal__content"><slot></slot></div>
          </div>
        </div>`;
      const backdrop=this.shadowRoot.querySelector('.sirsi-modal-backdrop');
      const close=this.shadowRoot.querySelector('.sirsi-modal__close');
      const open = () => backdrop.classList.add('active');
      const hide = () => backdrop.classList.remove('active');
      this.show = open; this.hide = hide;
      close.addEventListener('click', hide);
      backdrop.addEventListener('click', (e)=>{ if(e.target===backdrop) hide(); });
      if(this.hasAttribute('open')) open();
    }
  }
  customElements.define('sirsi-modal', SirsiModal);

  class SirsiTabs extends HTMLElement {
    constructor(){ super(); this.attachShadow({mode:'open'}); }
    connectedCallback(){ this.render(); }
    render(){
      const tabs = Array.from(this.querySelectorAll('[slot="tab"]')).map(el=>el.textContent.trim());
      const panels = Array.from(this.querySelectorAll('[slot="panel"]')).map(el=>el.innerHTML);
      this.shadowRoot.innerHTML = `
        <style>@import url('https://cdn.jsdelivr.net/gh/SirsiMaster/sirsi-ui@v0.1.1/dist/sirsi-ui.css');:host{display:block}</style>
        <div class="sirsi-tabs" part="tabs">
          ${tabs.map((t,i)=>`<button class="sirsi-tab ${i===0?'active':''}" data-i="${i}">${t}</button>`).join('')}
        </div>
        ${panels.map((p,i)=>`<div class="sirsi-tabpanel ${i===0?'active':''}" data-i="${i}">${p}</div>`).join('')}
      `;
      const tabEls = this.shadowRoot.querySelectorAll('.sirsi-tab');
      const panelEls = this.shadowRoot.querySelectorAll('.sirsi-tabpanel');
      tabEls.forEach(btn=>btn.addEventListener('click',()=>{
        const i=btn.getAttribute('data-i');
        tabEls.forEach(b=>b.classList.toggle('active', b===btn));
        panelEls.forEach(p=>p.classList.toggle('active', p.getAttribute('data-i')===i));
      }));
    }
  }
  customElements.define('sirsi-tabs', SirsiTabs);

})();
