import {useEffect, useState} from 'react';
import axios from 'axios';

export interface Country {
    id: number;
    iso2: string;
    name: string;
}

export interface State {
    id: number;
    name: string;
}

export interface City {
    id: number;
    name: string;
}

const BASE_URL = 'https://countriesnow.space/api/v0.1';

// Hook to fetch countries
export const useCountry = (): Country[] => {
    const [countries, setCountries] = useState<Country[]>([]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await axios.get(`${BASE_URL}/countries/positions`);
                const data = res.data?.data || [];

                const mapped = data.map((country: any, index: number) => ({
                    id: country.iso2 || index,
                    label: country.name,
                    value: country.name,
                }));

                setCountries(mapped);
            } catch (error) {
                console.error('Error fetching countries:', error);
            }
        };

        fetchCountries();
    }, []);

    return countries;
};

// Hook to fetch states by country name
export const useStateList = (countryName: string): State[] => {
    const [states, setStates] = useState<State[]>([]);

    useEffect(() => {
        if (!countryName) return;

        const fetchStates = async () => {
            try {
                const res = await axios.post(`${BASE_URL}/countries/states`, {
                    country: countryName,
                });

                const stateList = res.data?.data?.states || [];

                const mapped = stateList.map((state: any, index: number) => ({
                    id: state.state_code || index,
                    label: state.name,
                    value: state.name,
                }));

                setStates(mapped);
            } catch (error) {
                console.error(`Error fetching states for ${countryName}:`, error);
            }
        };

        fetchStates();
    }, [countryName]);

    return states;
};

// Hook to fetch cities by country and state name
export const useCityList = (countryName: string, stateName: string): City[] => {
    const [cities, setCities] = useState<City[]>([]);

    useEffect(() => {
        if (!countryName || !stateName) return;

        const fetchCities = async () => {
            try {
                const res = await axios.post(`${BASE_URL}/countries/state/cities`, {
                    country: countryName,
                    state: stateName,
                });

                const cityList = res.data?.data || [];

                const mapped = cityList.map((city: string, index: number) => ({
                    id: index,
                    label: city,
                    value: city,
                }));

                setCities(mapped);
            } catch (error) {
                console.error(`Error fetching cities for ${countryName} - ${stateName}:`, error);
            }
        };

        fetchCities();
    }, [countryName, stateName]);

    return cities;
};
