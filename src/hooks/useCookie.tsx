import { useState } from "react";
import Cookies from "js-cookie";

type UseCookieReturnType = [
        string | undefined, // The cookie value
    (value: string, options?: Cookies.CookieAttributes) => void, // Function to set cookie
    () => void, // Function to remove cookie
];

const useCookie = (cookieName: string): UseCookieReturnType => {
    // Get the cookie from the browser (if available)
    const getCookie = (): string | undefined => Cookies.get(cookieName);

    // Initialize state with the cookie value
    const [cookieValue, setCookieValue] = useState<string | undefined>(
        getCookie(),
    );

    // Set a new cookie value
    const setCookie = (value: string, options: Cookies.CookieAttributes = {}) => {
        Cookies.set(cookieName, value, options);
        setCookieValue(value); // Update state
    };

    // Remove the cookie
    const removeCookie = () => {
        Cookies.remove(cookieName);
        setCookieValue(undefined); // Clear state
    };

    return [cookieValue, setCookie, removeCookie];
};

export default useCookie;
