// #region Import Directives
define(["require", "exports", "jquery", "Globalization/CultureInfo", "knockout", "Globalization/DateTime"], function (require, exports, jquery, CultureInfo, knockout, DateTime) {
    "use strict";
    // #endregion
    /**
     * Represents a binding handler for a text input that is used for a date.
     */
    knockout.bindingHandlers["dateInput"] = {
        /**
         * Initializes the interceptor for the date binding.
         * @param {any} element The DOM element involved in this binding.
         * @param {() => any} valueAccessor A JavaScript function that you can call to get the current model property that is involved in this binding.
         * @param {KnockoutAllBindingsAccessor} allBindingsAccessor A JavaScript object that you can use to access all the model values bound to this DOM element.
         */
        init: function (element, valueAccessor, allBindingsAccessor) {
            // Creates an interceptor which uses DateTime to format and unformat the number
            var interceptor = knockout.computed({
                read: function () {
                    // Retrieves the options from the parameter of the date binding
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
                    // Returns the new value
                    return !options.format ? unwrappedValue.toString() : unwrappedValue.toString(options.format, options.culture || CultureInfo.currentCulture);
                },
                write: function (newValue) {
                    // Indicates a change by the user
                    jquery(element).data("updatedByInput", true);
                    // Retrieves the options from the parameter of the date binding
                    var options = knockout.utils.unwrapObservable(valueAccessor());
                    // Checks if the value is empty
                    if (!newValue) {
                        options.value(null);
                    }
                    else {
                        // Tries to parse the value
                        var newDateTime = null;
                        try {
                            newDateTime = !options.format ? DateTime.fromString(newValue) : DateTime.fromString(newValue, options.format, options.culture || CultureInfo.currentCulture);
                        }
                        catch (error) {
                        }
                        // Sets the new value
                        options.value(newDateTime);
                    }
                }
            }).extend({ notify: "always" });
            // Adds a new binding to the element with a text input or a text binding to the interceptor
            if (element.tagName.toLowerCase() == "input") {
                knockout.applyBindingsToNode(element, { textInput: interceptor });
                // Prevents input of invalid characters
                jquery(element).keydown(function (e) {
                    // Allos backspace, delete, tab, escape, enter, dash, period and slashes
                    if (jquery.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 189, 190, 191, 220]) !== -1 ||
                        // Allows Ctrl+A
                        (e.keyCode == 65 && e.ctrlKey === true) ||
                        // Allows Ctrl+C
                        (e.keyCode == 67 && e.ctrlKey === true) ||
                        // Allows Ctrl+X
                        (e.keyCode == 88 && e.ctrlKey === true) ||
                        // Allows home, end, left, right
                        (e.keyCode >= 35 && e.keyCode <= 39) ||
                        //Allows numbers and numbers + shift key
                        ((e.shiftKey && (e.keyCode >= 48 && e.keyCode <= 57)) || (e.keyCode >= 96 && e.keyCode <= 105))) {
                        // Returns as this input is valid
                        return;
                    }
                    // Ensures that it is a number and stops the key down event
                    if ((!e.shiftKey && (e.keyCode < 48 || e.keyCode > 57)) || (e.shiftKey && (e.keyCode < 96 || e.keyCode > 105))) {
                        e.preventDefault();
                    }
                });
            }
            else {
                knockout.applyBindingsToNode(element, { text: interceptor });
            }
        }
    };
});
