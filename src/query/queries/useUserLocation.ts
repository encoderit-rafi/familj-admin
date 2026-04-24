import {useEffect, useState} from 'react';

const useUserLocation = () => {
    const [location, setLocation] = useState<null | any>(null);

    // get User Location ...
    useEffect(() => {
        fetch('https://ipwho.is/')
            .then(res => res.json())
            .then(data => setLocation(data))
            .catch(err => {
                console.error('Failed to fetch IP-based location:', err);
            });
    }, []);

    // useEffect(() => {
    //     fetch('https://ipapi.co/json/')
    //         .then(res => res.json())
    //         .then(data => {
    //             setLocation(data);
    //         })
    //         .catch(err => {
    //             console.error('Failed to fetch IP-based location:', err);
    //         });
    // }, []);

    return location;
};

export default useUserLocation;
