import type {RuleObject} from 'antd/es/form';
import {parsePhoneNumberFromString, type CountryCode} from 'libphonenumber-js';

export const Rule = {
    pattern: (attribute: string, regex: RegExp, message?: string): RuleObject => ({
        pattern: regex,
        message: message || `${attribute} format is invalid`,
    }),

    phone: (countryCode: CountryCode = 'US', message = 'Invalid phone number for selected country'): RuleObject => ({
        validator(_, value) {
            if (!value) return Promise.resolve();
            const phone = parsePhoneNumberFromString(value, countryCode);
            if (!phone || !phone.isValid()) return Promise.reject(new Error(message));
            return Promise.resolve();
        },
    }),
};
