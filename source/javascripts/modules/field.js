var Reasons_MatrixConfigurator = require('./matrix');

module.exports = class {

    constructor ($el, conditionals)
    {
        this.$el = $el;
        this.conditionals = conditionals;
        this.init();
    }

    init ()
    {
        this.type = this.$el.find('select#type').val();
        this.$el.on('change', 'select#type', $.proxy(this.onTypeSelectChange, this));
        this.createConfigurator();   
    }

    createConfigurator ()
    {
        if (this.configurator) {
            this.configurator.destroy();
            delete this.configurator;
        }
        switch (this.type) {
            case 'Matrix' :
                this.configurator = new Reasons_MatrixConfigurator(this.$el, this.conditionals);
                break;
        }
    }

    destroy ()
    {
    	this.$el.off('change', 'select#type', $.proxy(this.onTypeSelectChange, this));
    }

    onTypeSelectChange (e)
    {
        var type = $(e.currentTarget).val();
        if (type !== this.type) {
            this.conditionals = null;
            this.type = type;
            this.createConfigurator();
        }
    }

}