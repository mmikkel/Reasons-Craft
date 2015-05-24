/*
    json2.js
    2015-05-03

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse. This file is provides the ES5 JSON capability to ES3 systems.
    If a project might run on IE8 or earlier, then this file should be included.
    This file does nothing on ES5 systems.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 
                            ? '0' + n 
                            : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date 
                    ? 'Date(' + this[key] + ')' 
                    : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
                            +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' &&
                        value.slice(0, 5) === 'Date(' &&
                        value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });


    This is a reference implementation. You are free to copy, modify, or
    redistribute.
*/

/*jslint 
    eval, for, this 
*/

/*property
    JSON, apply, call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';
    
    var rx_one = /^[\],:{}\s]*$/,
        rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
        rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
        rx_four = /(?:^|:|,)(?:\s*\[)+/g,
        rx_escapable = /[\\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 
            ? '0' + n 
            : n;
    }
    
    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + '-' +
                        f(this.getUTCMonth() + 1) + '-' +
                        f(this.getUTCDate()) + 'T' +
                        f(this.getUTCHours()) + ':' +
                        f(this.getUTCMinutes()) + ':' +
                        f(this.getUTCSeconds()) + 'Z'
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap,
        indent,
        meta,
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string) 
            ? '"' + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string'
                    ? c
                    : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' 
            : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) 
                ? String(value) 
                : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? '[]'
                    : gap
                        ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                        : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                    ? ': ' 
                                    : ':'
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap 
                                    ? ': ' 
                                    : ':'
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? '{}'
                : gap
                    ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                    : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"': '\\"',
            '\\': '\\\\'
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return '\\u' +
                            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, '@')
                        .replace(rx_three, ']')
                        .replace(rx_four, '')
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());

/**
 * Reasons Builder UI
 */
(function($){

if (typeof Reasons == 'undefined'){
    Reasons = {};
}

Reasons.Builder = Garnish.Base.extend({

    $container : null,

    init: function(settings)
    {

        this.setSettings( settings, Reasons.Builder.defaults );

        this.templates = this.settings.templates;
        this.fieldId = this.settings.fieldId;
        
        this.$container = $(this.templates.builderUi());

        this.$builder = this.$container.find('.reasonsBuilder:first');
        
        // Create rule template
        this.$rule = this.$container.find('.reasonsRule:first').clone(true);
        
        // Create statement template
        this.$statement = this.$container.find('.reasonsStatement:first').clone(true);
        this.$statement.find('.reasonsRule').remove();

        this.$message = this.$container.find('.reasonsMessage:first');

        // Add some event listeners
        this.$container
            .on( 'click', '.reasonsAddRule', $.proxy( this.onReasonsAddRuleClick, this ) )
            .on( 'click', '.reasonsRemoveRule', $.proxy( this.onReasonsRemoveRuleClick, this ) )
            .on( 'click', '.reasonsAddStatement', $.proxy( this.onReasonsAddStatementClick, this ) )
            .on( 'change', '.reasonsRuleToggleField select', $.proxy( this.onReasonsRuleToggleFieldChange, this ) )
            .on( 'change', '.reasonsRuleCompare select', $.proxy( this.onReasonsRuleCompareChange, this ) )
            .on( 'change', '.reasonsRuleValue *:input', $.proxy( this.onReasonsRuleValueChange, this ) );

        // Clean out the builder
        this.$builder.html('');

        // Update toggle fields
        this.setToggleFields(this.settings.toggleFields);

        // Render existing rules
        if (this.settings.rules && this.settings.rules.length > 0) {
            for (var i = 0; i < this.settings.rules.length; ++i) {
                this.addStatement({
                    rules : this.settings.rules[i]
                });
            }
        }

        this.refresh();

        Reasons.Builder.instances.push(this);

    },

    get : function()
    {
        return this.$container;
    },

    disable : function()
    {
        this.$container.addClass('disabled');
    },

    enable : function()
    {
        this.$container.removeClass('disabled');
    },

    update : function(settings)
    {
        
        // Set new settings
        this.setSettings( settings, this.settings );
        
        // Set new toggle fields
        this.setToggleFields(this.settings.toggleFields);
        
        // Refresh
        this.refresh();

    },

    setToggleFields : function ( toggleFields )
    {

        this.settings.toggleFields = [];
        this.settings.toggleFieldIds = [];

        for(var i = 0; i < toggleFields.length; ++i){
            if (parseInt(toggleFields[i].id) !== this.fieldId){
                this.settings.toggleFields.push(toggleFields[i]);
                this.settings.toggleFieldIds.push(parseInt(toggleFields[i].id));
            }
        }

        // Update rule template
        var toggleFieldSelectOptions = '';
        for (var i = 0; i < this.settings.toggleFields.length; ++i){
            toggleFieldSelectOptions += this.templates.toggleSelectOption(this.settings.toggleFields[i]);
        }
        this.$rule.find('.reasonsRuleToggleField select').html(toggleFieldSelectOptions);

    },

    refresh : function ()
    {

        this.settings.rules = [];

        var toggleFields = this.settings.toggleFields;

        // If no toggle fields, GTFO
        if (toggleFields.length === 0){
            this.disable();
            this.$message.text(Reasons.settings.noToggleFieldsMessage);
            return false;
        } else {
            this.enable();
            this.$message.text('');
        }

        var self = this,
            statement,
            $statements = this.$container.find('.reasonsStatement'),
            $statement,
            $rules,
            $rule,
            $toggleSelect,
            toggleSelectOpts,
            toggleFieldId;

        $statements.each( function () {

            statement = [];
            $statement = $(this);
            $rules = $statement.find('.reasonsRule');

            $rules.each( function () {

                $rule = $( this );

                $toggleSelect = $rule.find('.reasonsRuleToggleField select'),
                toggleSelectValue = parseInt($toggleSelect.val());

                // Remove rules where the selected toggle field no longer exists
                if(self.settings.toggleFieldIds.indexOf(toggleSelectValue) === -1){
                    $rule.remove();
                    return;
                }

                // Re-render toggle select
                toggleSelectOpts = '';
                for (var i = 0; i < self.settings.toggleFields.length; ++i){
                    toggleSelectOpts += self.templates.toggleSelectOption(toggleFields[i], parseInt(toggleFields[i].id) === toggleSelectValue);
                }
                $toggleSelect.html(toggleSelectOpts);

                // Create the rule
                statement.push( {
                    fieldId : toggleSelectValue,
                    compare : $rule.find('.reasonsRuleCompare select').val(),
                    value : $rule.find('.reasonsRuleValue *:input:first').val()
                } );

            } );

            // Remove empty statements
            if (statement.length === 0) {
                $statement.remove();
                return;
            }

            self.settings.rules.push( statement );

        } );

    },

    getConditionals : function ()
    {
        return this.settings.rules && this.settings.rules.length > 0 ? this.settings.rules : false;
    },

    addStatement : function(settings)
    {

        settings = $.extend({
            rules : false
        },settings);
        
        var $statement = this.$statement.clone(true),
            rules = settings.rules;

        // Append the statement
        this.$builder.append($statement);
        
        if (!rules) {
            
            // This is a new statement. Just add a default rule
            this.addRule({
                target : $statement
            });

        } else {

            for (var i = 0; i < rules.length; ++i){
                this.addRule($.extend({
                    target : $statement
                },rules[i]));
            }

        }

        return $statement;
    },

    addRule : function(settings)
    {

        settings = $.extend({
            fieldId : null,
            compare : null,
            value : null
        },settings);

        var $rule = this.$rule.clone( true ),
            $target = settings.target || this.$builder.find('.reasonsStatement:last'),
            fieldId = settings.fieldId,
            compare = settings.compare,
            value = settings.value,
            toggleField;

        // Build the rule
        if (fieldId) {
            $rule.find('.reasonsRuleToggleField select').val(fieldId);
        }

        // Validate selected value TODO: Buggy/incomplete
        // if(fieldId !== null){
        //     toggleField = Reasons.getToggleFieldById(fieldId);
        //     if (!toggleField){
        //         return false;
        //     }
        //     if(value !== null && toggleField.settings.options){
        //         var possibleValues = [];
        //         for (var i = 0; i < toggleField.settings.options.length; ++i){
        //             possibleValues.push(toggleField.settings.options[i].value);
        //         }
        //         console.log('*****',possibleValues);
        //         if(possibleValues.indexOf(value) === -1){
        //             return false;
        //         }
        //     }
        // }

        // Append the rule
        if ($target.length > 0) {
            $target.find('.reasonsRules:first').append($rule);
        } else {
            return false;
        }

        $rule
            .find('.reasonsRuleToggleField select')
            .trigger('change');

        if (compare) {
            $rule.find('.reasonsRuleCompare select').val(compare);
        }

        if (value) {
            $rule.find('.reasonsRuleValue *:input:first').val(value);
        }

        return $rule;

    },

    onReasonsAddRuleClick : function (e)
    {
        e.preventDefault();
        var $target = $(e.currentTarget).parents('.reasonsStatement');
        this.addRule({
            target : $target
        });
    },

    onReasonsRemoveRuleClick : function ( e )
    {
        e.preventDefault();
        var $target = $( e.currentTarget ),
            $rule = $target.parents('.reasonsRule');
        $rule.remove();
        this.refresh();
    },

    onReasonsAddStatementClick : function ( e ) {
        e.preventDefault();
        this.addStatement();
    },

    onReasonsRuleToggleFieldChange : function ( e ) {

        e.preventDefault();

        // Render toggle value
        var $target = $( e.currentTarget ),
            $rule = $target.parents( '.reasonsRule' ),
            $ruleValue = $rule.find( '.reasonsRuleValue' ),
            toggleFieldId = $target.val(),
            toggleField = Reasons.getToggleFieldById(toggleFieldId),
            toggleFieldType = toggleField.type,
            toggleFieldSettings = toggleField.settings,
            ruleValueContent = '';

        switch ( toggleFieldType ) {

            // Lightswitch - true/false
            case 'Lightswitch' :
                ruleValueContent = this.templates.select( [
                    { true : Craft.t( 'on' ) },
                    { false : Craft.t( 'off' ) }
                ] );
                break;

            // Option based inputs
            case 'Dropdown' : case 'MultiSelect' : case 'Checkboxes' : case 'RadioButtons' :
                var values = toggleFieldSettings.options,
                    options = [],
                    option;
                for (var i = 0; i < values.length; ++i){
                    option = {};
                    option[values[i].value] = values[i].label;
                    options.push(option);
                }
                ruleValueContent = this.templates.select( options );
                break;

            // Number input
            case 'Number' :
                ruleValueContent = this.templates.number(toggleFieldSettings);
                break;

            // // Color input
            // case 'Color' :
            //     toggleFieldSettings = {
            //         placeholder : '#'
            //     };
            //     ruleValueContent = this.templates.input(toggleFieldSettings);
            //     break;

            // Position Select
            case 'PositionSelect' :
                var values = toggleFieldSettings.options,
                    options = [],
                    option;
                for ( var i = 0; i < values.length; ++i ) {
                    option = {};
                    option[values[ i ]] = values[ i ].charAt( 0 ).toUpperCase() + values[ i ].slice( 1 );
                    options.push(option);
                }
                ruleValueContent = this.templates.select( options );
                break;

            // Just render a plain text input for anything else
            default :
                ruleValueContent = this.templates.input(toggleFieldSettings);
        }

        $ruleValue.html(ruleValueContent);

    },

    onReasonsRuleCompareChange : function ( e )
    {
        e.preventDefault();
    },

    onReasonsRuleValueChange : function ( e )
    {
        e.preventDefault();
    }

},
{
    defaults: {
        fieldId : null,
        toggleFields : null,
        rules : null,
        templates : {
            select : function(options)
            {
                var selectOptions = [],
                    option,
                    value,
                    label;
                for (var i = 0; i < options.length; ++i) {
                    option = options[i];
                    value = Object.keys(option)[0];
                    label = option[value];
                    selectOptions.push( '<option value="' + value + '">' + label + '</option>' );
                }
                return '<div class="select"><select>' + selectOptions.join( '' ) + '</select></div>';
            },
            toggleSelectOption : function(toggleField, selected)
            {
                return '<option value="' + toggleField.id + '" data-type="' + toggleField.type + '"' + (selected ? ' selected' : '') + '>' + toggleField.name + '</option>';
            },
            number : function(settings)
            {
                return '<div class="input"><input class="text" type="number" value="0" min="' + settings.min + '" max="' + settings.max + '" autocomplete="off"></div>';
            },
            input : function(settings)
            {
                var input = '';
                settings = $.extend({
                    initialRows : 4,
                    placeholder : '',
                    multiline : false
                },settings);
                if (settings.multiline === '1'){
                    input += '<textarea rows="' + settings.initialRows + '" placeholder="' + settings.placeholder + '" autocomplete="off"></textarea>';
                } else {
                    input += '<input class="text" type="text" size="20" value="" placeholder="' + settings.placeholder + '" autocomplete="off">';
                }
                return '<div class="input">' + input + '</div>';
            },
            builderUi : function()
            {
                return '<div class="reasonsBuilderUi">' +
                            '<div class="wrapper">' +
                                '<div class="heading"><span>' + Craft.t('Show this field if') + '</span></div>' +
                                '<div class="reasonsBuilder">' +
                                    '<div class="reasonsStatement">' +
                                        '<span class="delimiter">' + Craft.t('or') + '</span>' +
                                        '<div class="reasonsRules">' +
                                            '<div class="reasonsRule">' +
                                                '<div class="reasonsRuleParams">' +
                                                    '<div class="select reasonsRuleToggleField"><select /></div>' +
                                                    '<div class="select reasonsRuleCompare">' +
                                                        '<select>' +
                                                            '<option value="==">' + Craft.t('is equal to') + '</option>' +
                                                            '<option value="!=">' + Craft.t('is not equal to') + '</option>' +
                                                        '</select>' +
                                                    '</div>' +
                                                    '<div class="reasonsRuleValue" />' +
                                                '</div>' +
                                                '<div class="reasonsRuleAmend">' +
                                                    '<a class="delete icon reasonsRemoveRule" title="' + Craft.t('Remove rule') + '"></a>' +
                                                    '<a class="add icon reasonsAddRule" title="' + Craft.t('and') + '"></a>' +
                                                '</div>' +
                                                '<span class="reasonsRuleLead">' + Craft.t('and') + '</span>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +
                                '<div class="reasonsAdd">' +
                                    '<a class="btn reasonsAddStatement">' + Craft.t('Add rules') + '</a>' +
                                '</div>' +
                            '</div>' +
                            '<div class="reasonsMessage"></div>' +
                        '</div>';
            }
        }
    },
    instances: []
});

})(jQuery);
/**
 * Reasons Entry Edit Form
 */
(function($){

if (typeof Reasons == 'undefined'){
    Reasons = {};
}

Reasons.EntryEdit = Garnish.Base.extend({

    $container : null,

    init: function($container,settings)
    {
        this.setSettings( settings, Reasons.EntryEdit.defaults );
        this.$container = $container;

        // Get section ID
        this.sectionId = this.$container.find('input[name="sectionId"]').val();

        // Get entry type ID
        this.$entryTypeSelect = $(this.settings.entryTypeSelectSelector);
        if (this.$entryTypeSelect.length === 0){
            // Only one entry type ID, get it from Reasons
            var entryTypeIds = Reasons.getEntryTypeIdsBySectionId(this.sectionId);
            this.entryTypeId = entryTypeIds && entryTypeIds.length > 0 ? entryTypeIds.shift() : false;
        } else {
            // Set entry type ID
            this.entryTypeId = this.$entryTypeSelect.val();
        }

        // Listen for AJAX complete, to handle entry type switching
        this.currentUrl = window.location.href;
        $(document).ajaxComplete($.proxy(this.onAjaxComplete,this));

        // Add some event listeners
        this.$container
            .on('click', this.settings.fieldsSelector + '[data-toggle="1"]', $.proxy(this.onInputWrapperClick,this))
            .on('change keyup', this.settings.fieldsSelector + '[data-toggle="1"] *:input', $.proxy(this.onFieldInputChange,this));

        this.render();
        
    },

    render : function()
    {
        this.initToggleFields();
        this.evaluateConditionals();
    },

    initToggleFields : function()
    {

        var conditionalsData = Reasons.getConditionalsDataByEntryTypeId(this.entryTypeId);

        if (conditionalsData && conditionalsData.sectionId == this.sectionId && conditionalsData.typeId == this.entryTypeId && conditionalsData.conditionals) {
            this.conditionals = conditionalsData.conditionals;
        } else {
            return false;
        }
        
        // Get all current fields
        this.$fieldContainer = $(this.settings.fieldsContainerSelector);
        this.$fields = this.$fieldContainer.find(this.settings.fieldsSelector);

        if (this.$fieldContainer.length === 0 || this.$fields.length === 0){
            return false;
        }

        // Get toggle field IDs
        var toggleFieldIds = [];
        for (fieldId in this.conditionals){
            for (var i = 0; i < this.conditionals[fieldId].length; ++i){
                toggleFieldIds.push(this.conditionals[fieldId][i][0].fieldId);
            }
        }

        // Loop over fields and add data-id attribute
        var self = this,
            $field,
            fieldHandle,
            fieldId;

        this.$fields.each(function(){
            $field = $(this);
            fieldHandle = $field.attr('id').split('-')[1] || false;
            fieldId = Reasons.getFieldIdByHandle(fieldHandle);
            if (fieldId){
                $field.attr('data-id',fieldId);
            }
            // Is this a target field?
            if (self.conditionals[fieldId]){
                $field.attr('data-target',1);
            }
            // Is this a toggle field
            if (toggleFieldIds.indexOf(parseInt(fieldId)) > -1){
                $field.attr('data-toggle',1);
            }
        });

    },

    evaluateConditionals : function(fieldId)
    {

        var self = this,
            $targetFields = this.$fieldContainer.find(this.settings.fieldsSelector+'[data-target="1"]'),
            $targetField,
            statements,
            statementValid,
            rules,
            rule,
            $toggleField,
            $toggleFieldInput,
            toggleFieldValue;

        $targetFields
            .removeClass('reasonsHide')
            .each(function(){
            
                $targetField = $(this);
                statements = self.conditionals[$targetField.data('id')] || false;

                if (!statements) {
                    return;
                }

                var numStatements = statements.length,
                    numValidStatements = numStatements;
                
                for (var i = 0; i < numStatements; ++i) {

                    statementValid = true;
                    rules = statements[i];

                    for ( var j = 0; j < rules.length; ++j) {

                        rule = rules[j];

                        $toggleField = self.$fieldContainer.find(self.settings.fieldsSelector+'[data-id="' + rule.fieldId + '"]');
                        if ($toggleField.length === 0) {
                            continue;
                        }

                        $toggleFieldInput = $toggleField.find('*:input:first');
                        if ($toggleFieldInput.length === 0) {
                            continue;
                        }

                        toggleFieldValue = $toggleFieldInput.val();

                        if($toggleFieldInput.parent().hasClass('lightswitch')){
                            toggleFieldValue = toggleFieldValue === '1' ? 'true' : 'false';
                        }

                        // Compare trigger field value to expected value
                        switch (rule.compare) {
                            case '!=' :
                                if (toggleFieldValue == rule.value){
                                    statementValid = false;
                                }
                                break;
                            case '==' : default :
                                if (toggleFieldValue != rule.value){
                                    statementValid = false;
                                }
                                break;
                        }

                        if (!statementValid) {
                            numValidStatements--;
                            break;
                        }

                    }

                }

                if (numValidStatements <= 0){
                    $targetField.addClass('reasonsHide');
                }

        });
    },

    onAjaxComplete : function(e, status, requestData)
    {
        if (requestData.url.indexOf('switchEntryType') === -1) {
            return false;
        }
        this.entryTypeId = this.$entryTypeSelect.val();
        this.render();
    },

    onInputWrapperClick : function(e)
    {
        $(e.currentTarget).find('input:first').trigger('change');
    },

    onFieldInputChange : function(e)
    {
        this.evaluateConditionals();
    }

},
{
    defaults : {
        fieldsContainerSelector : '#fields',
        fieldsSelector : '.field:not(#title-field)',
        entryTypeSelectSelector : '#entryType',
        lightswitchContainerSelector : '.lightswitch',
        positionSelectContainerSelector : '.btngroup'
    }
});

})(jQuery);
/**
 * Reasons Field Layout Conditional Designer
 */
(function($){

if (typeof Reasons == 'undefined'){
    Reasons = {};
}

Reasons.FieldLayoutConditionalDesigner = Garnish.Base.extend({

    $container : null,
    toggleFieldIds : [],

    init: function($container,settings)
    {

        this.setSettings(settings,Reasons.FieldLayoutConditionalDesigner.defaults);

        this.$container = $container;
        this.$form = this.$container.parents(this.settings.formSelector);

        if(this.$form.length === 0){
            return false;
        }

        this.templates = this.settings.templates;

        // Create some hidden input fields        
        this.$conditionalsInput = $(this.templates.input({
            name : '_reasons',
            type : 'hidden'
        }));

        this.$conditionalsIdInput = $(this.templates.input({
            name : '_reasonsId',
            value : this.settings.id,
            type : 'hidden'
        }));

        this.$form
            .append(this.$conditionalsInput)
            .append(this.$conditionalsIdInput)
            .on('submit', $.proxy(this.onFormSubmit, this));

        // Get toggle field IDs
        var self = this;
        $.map(Reasons.getToggleFields(), function(toggleField){
            self.toggleFieldIds.push(parseInt(toggleField.id));
        });

        // Defer refresh
        setTimeout($.proxy(this.refresh,this),0);

        // Make sure stuff is kept up to date when fields move around
        this.$container.on('mousedown', this.settings.fieldSelector, $.proxy(this.onFieldMouseDown, this));

    },

    refresh : function()
    {

        var self = this,
            conditionals = {},
            $fields,
            $field,
            fieldId,
            toggleFields;

        // Loop over tabs
        this.$container.find(this.settings.tabSelector).each(function(){
            
            // Get all fields for this tab
            $fields = $(this).find(self.settings.fieldSelector);

            // Get all toggle fields for this tab
            toggleFields = [];
            $fields.each(function(){
                $field = $(this);
                fieldId = parseInt($field.data('id'));
                if (self.toggleFieldIds.indexOf(fieldId) > -1){
                    var toggleField = Reasons.getToggleFieldById(fieldId);
                    if (toggleField){
                        toggleFields.push(toggleField);
                    }
                }
            });

            // Loop over fields
            $fields.each(function(){
                
                $field = $(this);
                fieldId = parseInt($field.data('id'));

                if (!$field.data('_reasonsBuilder')){
                    
                    // Create builder
                    $field.data('_reasonsBuilder',new Reasons.Builder({
                        fieldId : fieldId,
                        toggleFields : toggleFields,
                        rules : self.settings.conditionals && self.settings.conditionals.hasOwnProperty(fieldId) ? self.settings.conditionals[fieldId] : null
                    }));
                
                } else {

                    // Refresh builder
                    $field.data('_reasonsBuilder').update({
                        toggleFields : toggleFields
                    });

                }

                // Get rules
                var rules = $field.data('_reasonsBuilder').getConditionals();
                if (rules) {
                    conditionals[fieldId] = rules;
                    $field.addClass('reasonsHasConditionals');
                } else {
                    $field.removeClass('reasonsHasConditionals');
                }

                if (!$field.data('_reasonsSettingsMenuItemInitialized')){
                    
                    // Create settings menu item
                    var $button = $field.find(self.settings.fieldSettingsSelector),
                        menubtn = $button.data('menubtn') || false;

                    if (!menubtn){
                        return;
                    }

                    var $menu = menubtn.menu.$container;
                    $menu
                        .find('ul')
                        .children(':first')
                        .clone(true)
                        .prependTo($menu.find('ul:first'))
                        .find('a:first')
                            .data('_reasonsField', $field)
                            .attr('data-action', 'toggle-conditionals')
                            .text(Craft.t('Manage conditionals'))
                            .on('click', $.proxy(self.onFieldSettingsMenuItemClick, self));

                    $field.data('_reasonsSettingsMenuItemInitialized',true);

                }

            });

        });

        if (Object.keys(conditionals).length === 0){
            this.$conditionalsInput.attr('value','');
        } else {
            this.$conditionalsInput.attr('value',JSON.stringify(conditionals));    
        }

    },

    onFieldMouseDown : function ( e )
    {

        var self = this,
            mouseUpHandler = function(e)
            {
                $('body').off('mouseup', mouseUpHandler);
                self.refresh();
            };

        $('body').on('mouseup', mouseUpHandler);

    },

    onFieldSettingsMenuItemClick : function(e) {

        e.preventDefault();
        e.stopPropagation();

        var $trigger = $(e.target),
            $field = $trigger.data('_reasonsField');

        if (!$trigger.data('_reasonsModal')) {

            // Create modal
            var self = this,
                builder = $field.data('_reasonsBuilder'),
                $modal = $(this.templates.modal()),
                modal = new Garnish.Modal($modal, {
                    resizable : true,
                    autoShow : false,
                    onShow : function()
                    {
                        self.refresh();
                    },
                    onHide : function()
                    {
                        self.refresh();
                    }
                });

            // Add builder to modal
            builder.get().appendTo($modal.find('.body'));

            $modal.on('click', '.close', function (e) {
                modal.hide();
            } );

            $trigger.data('_reasonsModal', modal);

        }

        $trigger.data('_reasonsModal').show();

    },

    onFormSubmit : function()
    {
        this.refresh();
    },

},{
    defaults : {
        id : null,
        conditionals : null,
        formSelector : 'form:first',
        fieldSettingsSelector : 'a.settings',
        fieldSelector : '.fld-field',
        tabSelector : '.fld-tabs .fld-tab',
        templates : {
            input : function(settings)
            {
                return '<input type="' + settings.type + '" name="' + (settings.name || '') + '" value="' + (settings.value || '') + '" />';
            },
            modal : function()
            {
                return '<div class="modal elementselectormodal reasonsModal"><div class="body" /><div class="footer"><div class="buttons rightalign first"><div class="btn close submit">Done</div></div></div></div>';
            }
        }
    }
});

})(jQuery);
/**
 * Reasons
 */
(function($){

if (typeof Reasons == 'undefined'){
	Reasons = {};
}

$.extend(Reasons,{
	
	defaults : {
		fldSelector : '#fieldlayoutform',
		conditionals : {}
	},

	init : function()
	{

		// Get settings
		Reasons.settings = $.extend(Reasons.defaults, (Reasons.settings || {}));

		// Where are we?
		var segments = Craft.path.split('/');
		if (segments[0] === 'settings' && segments[1] === 'sections') {
			
			// Ok, so we're dealing with sections and/or entry types. That's good.
			if (Craft.path.indexOf('entrytypes/') > -1){
				
				// Editing an entry type yeah
				var entryTypeId = parseInt(Craft.path.substring(Craft.path.indexOf('entrytypes/')).split('/')[1]) || 'new',
					$fld = $(Reasons.settings.fldSelector); // Just to make sure we can haz field layout designer
				
				if ($fld.length > 0){
		        
		        	// Initialize the conditional designer
		        	var conditionalsObject = this.getConditionalsDataByEntryTypeId(entryTypeId);
		      		new Reasons.FieldLayoutConditionalDesigner($fld,{
		        		id : conditionalsObject ? conditionalsObject.id : null,
		        		conditionals : conditionalsObject ? conditionalsObject.conditionals : null
		        	});

		        }

			} else {
				return false;
			}

		} else if (segments[0] === 'entries' && segments.length > 2) {
			
			// So we're editing an entry
			var $entryForm = $('#entry-form');
			if ($entryForm.length === 0){
				return false;
			}
			
			new Reasons.EntryEdit($entryForm);

		} else {
			return false;
		}

	},

	getToggleFields : function()
	{
		return this.settings['toggleFields'] || [];
	},

	getToggleFieldById : function(fieldId)
	{
		fieldId = parseInt(fieldId);
		var toggleFields = Reasons.getToggleFields(),
			numToggleFields = toggleFields.length;
		for (var i = 0; i < numToggleFields; ++i) {
			if (parseInt(toggleFields[i].id) === fieldId){
				return toggleFields[i];
			}
		}
		return false;
	},

	getConditionalsDataByEntryTypeId : function(entryTypeId)
	{
		var conditionals;
		for (var i = 0; i < this.settings.conditionals.length; ++i){
			conditionals = this.settings.conditionals[i];
			if (conditionals.typeId == entryTypeId){
				return conditionals;
			}
		}
		return false;
	},

	getEntryTypeIdsBySectionId : function(sectionId)
	{
		return this.settings.entryTypeIds && this.settings.entryTypeIds.hasOwnProperty(sectionId) ? this.settings.entryTypeIds[sectionId] : false;
	},

	getFieldIdByHandle : function(fieldHandle)
	{
		return this.settings.fieldIds && this.settings.fieldIds.hasOwnProperty(fieldHandle) ? this.settings.fieldIds[fieldHandle] : false;
	}

});

})(jQuery);