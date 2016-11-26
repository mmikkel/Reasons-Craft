import Builder from 'modules/Builder'

export default class BuilderModal {

  static template = '<div class="modal elementselectormodal reasonsModal">'+
                      '<div class="body" />'+
                      '<div class="footer">'+
                        '<div class="buttons rightalign first">'+
                          '<div class="btn close submit">Done</div>'+
                        '</div>'+
                      '</div>'+
                    '</div>'

  constructor (builder, settings) {
    this.$el = $(BuilderModal.template);
    this.$builder = builder.get().appendTo(this.$el.find('.body'));
    this.settings = $.extend({}, settings);
    this.modal = new Garnish.Modal(this.$el, {
      resizable: true,
      onHide: this.settings.onHide.bind(this)
    });
    this.$el.on('click', '.close', this.hide.bind(this));
  }

  hide (e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    this.modal.hide();
  }

  destroy () {
    this.modal.destroy();
    delete this.modal;
    this.$builder.remove();
    delete this.$builder;
    delete this.settings;
    delete this.$el;
  }

  onHide () {
    if (this.settings.onHide) this.settings.onHide()
    this.destroy();
  }

}
