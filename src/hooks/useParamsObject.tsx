import {type URLSearchParamsInit, useSearchParams } from "react-router-dom";

interface ParamsType {
  currentPage?: number | string | undefined;
  perPage?: number | string | undefined;
  // Add other parameter types as needed
}

export const useParamsObject = (
  defaultInit: URLSearchParamsInit | undefined,
): [ParamsType, (params: ParamsType, overwrite?: boolean) => void] => {
  const [params, setSearchParams] = useSearchParams(defaultInit);

  const setParams = (newParams: ParamsType = {}, overwrite = false) => {
    const formattedParams: Record<string, string> = Object.entries(
      newParams,
    ).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = String(value); // Convert numbers to strings
        }
        return acc;
      },
      {} as Record<string, string>,
    );

    setSearchParams((prevParams) => {
      if (overwrite) {
        return new URLSearchParams(formattedParams);
      }
      return new URLSearchParams({
        ...Object.fromEntries(prevParams),
        ...formattedParams,
      });
    });
  };

  return [Object.fromEntries(params) as ParamsType, setParams];
};
