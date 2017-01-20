// #region Import Directives
define(["require", "exports", "jquery", "Globalization/CultureInfo", "knockout", "Globalization/Numeric"], function (require, exports, jquery, CultureInfo, knockout, Numeric) {
    "use strict";
    // #endregion
    /**
     * Represents a binding handler for a text input that is used for a number.
     */
    knockout.bindingHandlers["numericInput"] = {
        /**
         * Initializes the interceptor for the numeric binding.
         * @param {any} element The DOM element involved in this binding.
         * @param {() => any} valueAccessor A JavaScript function that you can call to get the current model property that is involved in this binding.
         * @param {KnockoutAllBindingsAccessor} allBindingsAccessor A JavaScript object that you can use to access all the model values bound to this DOM element.
         */
        init: function (element, valueAccessor, allBindingsAccessor) {
            // Creates an interceptor which uses Numeric to format and unformat the number
            var interceptor = knockout.computed({
                read: function () {
                    // Retrieves the options from the parameter of the date time binding
                    var options = knockout.utils.unwrapObservable(valueAccessor());
                    // Gets the unwrapped value
                    var unwrappedValue = knockout.unwrap(options.value);
                    // Registers for the blur event, so that the current value is insert
                    if (!jquery(element).data("registeredBlur")) {
                        jquery(element).data("regiteredBlur", true);
                        jquery(element).blur(function (evt) {
                            // Gets the unwrapped value
                            unwrappedValue = knockout.unwrap(options.value);
                            if (!!unwrappedValue) {
                                jquery(element).val(!options.format ? unwrappedValue.toString() : unwrappedValue.toString(options.format, options.culture || CultureInfo.currentCulture));
                            }
                            else {
                                jquery(element).val("");
                            }
                        });
                    }
                    // Gets the current value
                    var currentValue = element.tagName.toLowerCase() == "input" ? jquery(element).val() : jquery(element).text();
                    // Checks if the value is empty
                    if (!unwrappedValue && jquery(element).data("updatedByInput")) {
                        jquery(element).data("updatedByInput", false);
                        return currentValue;
                    }
                    else if (!unwrappedValue) {
                        return "";
                    }
                    // Tries to parse the value
                    var newNumeric = null;
                    try {
                        newNumeric = !options.format ? Numeric.fromString(currentValue) : Numeric.fromString(currentValue, options.culture || CultureInfo.currentCulture);
                    }
                    catch (error) {
                    }
                    // Checks if the current value of the text field is equal to the 
                    if (!!newNumeric && unwrappedValue.toNumber() == newNumeric.toNumber()) {
                        return currentValue;
                    }
                    // Returns the new value
                    return !options.format ? unwrappedValue.toString() : unwrappedValue.toString(options.format, options.culture || CultureInfo.currentCulture);
                },
                write: function (newValue) {
                    // Indicates a change by the user
                    jquery(element).data("updatedByInput", true);
                    // Retrieves the options from the parameter of the number binding
                    var options = knockout.utils.unwrapObservable(valueAccessor());
                    // Checks if the value is empty
                    if (!newValue) {
                        options.value(null);
                    }
                    else {
                        // Tries to parse the value
                        var newNumeric = null;
                        try {
                            newNumeric = !options.format ? Numeric.fromString(newValue) : Numeric.fromString(newValue, options.culture || CultureInfo.currentCulture);
                        }
                        catch (error) {
                        }
                        // Sets the new value
                        options.value(newNumeric);
                    }
                }
            }).extend({ notify: "always" });
            // Adds a new binding to the element with a text input or a text binding to the interceptor
            if (element.tagName.toLowerCase() == "input") {
                knockout.applyBindingsToNode(element, { textInput: interceptor });
                // Prevents input of invalid characters
                jquery(element).keydown(function (e) {
                    // Allows backspace, delete, tab, escape, and enter
                    if (jquery.inArray(e.keyCode, [46, 8, 9, 27, 13]) !== -1 ||
                        // Allows Ctrl+A
                        (e.keyCode == 65 && e.ctrlKey === true) ||
                        // Allows Ctrl+C
                        (e.keyCode == 67 && e.ctrlKey === true) ||
                        // Allows Ctrl+X
                        (e.keyCode == 88 && e.ctrlKey === true) ||
                        // Allows home, end, left, right
                        (e.keyCode >= 35 && e.keyCode <= 39)) {
                        // Returns as this input is valid
                        return;
                    }
                    // Allows comma, dash and period
                    if ((jquery.inArray(e.keyCode, [188, 189, 190]) !== -1) ||
                        //Allows numbers
                        (!e.shiftKey && !e.ctrlKey && !e.altKey && (e.keyCode >= 48 && e.keyCode <= 57)) ||
                        // Allows numpad numbers
                        (e.keyCode >= 96 && e.keyCode <= 105)) {
                        // Returns as this input is valid
                        return;
                    }
                    // Prevents the default input
                    e.preventDefault();
                });
            }
            else {
                knockout.applyBindingsToNode(element, { text: interceptor });
            }
        }
    };
});
