// LazyComponent.tsx
import {lazy, Suspense} from 'react';
import React from 'react';
import {Flex, Spin} from "antd";

function FullPageLoader({fullScreen = false}: { fullScreen?: boolean }) {
    const style = fullScreen
        ? {height: '100vh', width: '100vw'}
        : {height: '100%', width: '100%', minHeight: '200px', maxHeight: '100vh'};
    return (
        <Flex
            align="center"
            justify="center"
            style={style}
        >
            <Spin size="large"/>
        </Flex>
        // <Flex
        //     align="center"
        //     justify="center"
        //     style={{height: '100vh', width: '100vw', maxWidth: '100%', maxHeight: '100%'}}
        // >
        //     <Spin size="large"/>
        // </Flex>
    )
}

const LazyLoad = (importFn: () => Promise<{ default: React.ComponentType<any> }>, fullscreen = false) => {
    const Component = lazy(importFn);
    return (
        <Suspense fallback={<FullPageLoader fullScreen={fullscreen}/>}>
            <Component/>
        </Suspense>
    );
};

export default LazyLoad;