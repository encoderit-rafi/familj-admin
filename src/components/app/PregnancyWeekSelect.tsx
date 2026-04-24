import React from "react";
import { Select } from "antd";
import type { SelectProps } from "antd";

interface PregnancyWeekSelectProps extends Omit<SelectProps, "options"> {
  maxWeek?: number;
  minWeek?: number;
  mode?: "multiple" | "tags" | undefined;
  omittedWeeks?: number[];
}

// Generate pregnancy weeks options
const generateWeekOptions = (minWeek: number = 1, maxWeek: number = 42) => {
  return Array.from({ length: maxWeek - minWeek + 1 }, (_, i) => ({
    value: minWeek + i,
    label: `Week ${minWeek + i}`,
  }));
};

const PregnancyWeekSelect: React.FC<PregnancyWeekSelectProps> = ({
  maxWeek = 42,
  minWeek = 1,
  omittedWeeks = [],
  placeholder = "Select pregnancy week",
  style = { minWidth: 200 },
  mode,
  allowClear = true,
  showSearch = true,
  maxTagCount = "responsive",
  ...rest
}) => {
  const weekOptions = generateWeekOptions(minWeek, maxWeek).filter(
    (option) => !omittedWeeks.includes(option.value)
  );

  return (
    <Select
      mode={mode}
      placeholder={placeholder}
      allowClear={allowClear}
      showSearch={showSearch}
      maxTagCount={maxTagCount}
      style={style}
      options={weekOptions}
      {...rest}
    />
  );
};

export default PregnancyWeekSelect;
