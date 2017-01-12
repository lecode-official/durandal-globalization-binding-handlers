
// #region Import Directives

import jquery = require("jquery");
import CultureInfo = require("Globalization/CultureInfo");
import knockout = require("knockout");
import Numeric = require("Globalization/Numeric");

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
    init: (element: any, valueAccessor: () => any, allBindingsAccessor: KnockoutAllBindingsAccessor) => {

        // Creates an interceptor which uses Numeric to format and unformat the number
        var interceptor = knockout.computed({
            read: () => {

                // Retrieves the options from the parameter of the date time binding
                var options: { value: KnockoutObservable<Numeric|null>; format: string|null; culture: CultureInfo|null } = <{ value: KnockoutObservable<Numeric|null>; culture: CultureInfo|null; format: string|null }>knockout.utils.unwrapObservable(valueAccessor());

                // Gets the unwrapped value
                var unwrappedValue = knockout.unwrap(options.value);

                // Registers for the blur event, so that the current value is insert
                if (!jquery(element).data("registeredBlur")) {
                    jquery(element).data("regiteredBlur", true);
                    jquery(element).blur(evt => {

                        // Gets the unwrapped value
                        unwrappedValue = knockout.unwrap(options.value);
                        if (!!unwrappedValue) {
                            jquery(element).val(!options.format ? unwrappedValue.toString() : unwrappedValue.toString(options.format, options.culture || CultureInfo.currentCulture));
                        } else {
                            jquery(element).val("");
                        }
                    });
                } 

                // Gets the current value
                var currentValue: string = element.tagName.toLowerCase() == "input" ? jquery(element).val() : jquery(element).text();

                // Checks if the value is empty
                if (!unwrappedValue && jquery(element).data("updatedByInput")) {
                    jquery(element).data("updatedByInput", false);
                    return currentValue;
                } else if (!unwrappedValue) {
                    return "";
                }

                // Tries to parse the value
                var newNumeric: Numeric|null = null;
                try {
                    newNumeric = !options.format ? Numeric.fromString(currentValue) : Numeric.fromString(currentValue, options.culture || CultureInfo.currentCulture);
                } catch (error) {
                }
                
                // Checks if the current value of the text field is equal to the 
                if (!!newNumeric && unwrappedValue.toNumber() == newNumeric.toNumber()) {
                    return currentValue;
                }

                // Returns the new value
                return !options.format ? unwrappedValue.toString() : unwrappedValue.toString(options.format, options.culture || CultureInfo.currentCulture);
            },
            write: (newValue: string) => {

                // Indicates a change by the user
                jquery(element).data("updatedByInput", true);

                // Retrieves the options from the parameter of the number binding
                var options: { value: KnockoutObservable<Numeric|null>; format: string|null; culture: CultureInfo|null } = <{ value: KnockoutObservable<Numeric|null>; culture: CultureInfo|null; format: string|null }>knockout.utils.unwrapObservable(valueAccessor());

                // Checks if the value is empty
                if (!newValue) {
                    options.value(null);
                } else {

                    // Tries to parse the value
                    var newNumeric: Numeric|null = null;
                    try {
                        newNumeric = !options.format ? Numeric.fromString(newValue) : Numeric.fromString(newValue, options.culture || CultureInfo.currentCulture);
                    } catch (error) {
                    }
                    
                    // Sets the new value
                    options.value(newNumeric);
                }
            }
        }).extend({ notify: "always" });

        // Adds a new binding to the element with a text input or a text binding to the interceptor
        if (element.tagName.toLowerCase() == "input") {
            knockout.applyBindingsToNode(element, { textInput: interceptor });
        } else {
            knockout.applyBindingsToNode(element, { text: interceptor });
        }
    }
};