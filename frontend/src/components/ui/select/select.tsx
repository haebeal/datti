import { cn } from "@/utils/cn";
import { type ComponentPropsWithRef, useEffect, useState } from "react";
import {
  Select as AriaSelect,
  Button,
  ListBox,
  ListBoxItem,
  Popover,
  SelectValue,
} from "react-aria-components";

type Props<T> = Omit<ComponentPropsWithRef<"input">, "defaultValue"> & {
  isError?: boolean;
  options: T[];
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  defaultValue?: string;
  placeholder?: string;
};

export function Select<T>(props: Props<T>) {
  const {
    className,
    defaultValue,
    placeholder = "選択してください",
    isError,
    options,
    getOptionLabel,
    getOptionValue,
    name,
    id,
    required,
    disabled,
    autoComplete,
    form
  } = props;

  const [selectedKey, setSelectedKey] = useState<string | null>(
    defaultValue ?? null,
  );

  useEffect(() => {
    setSelectedKey(defaultValue ?? null);
  }, [defaultValue]);

  const selectedOption = options.find(
    (option) => getOptionValue(option) === selectedKey,
  );

  return (
    <AriaSelect
      className={className}
      selectedKey={selectedKey}
      onSelectionChange={(key) => setSelectedKey(key as string)}
      name={name}
      isRequired={required}
      isDisabled={disabled}
      autoComplete={autoComplete}
      form={form}
    >
      <Button
        id={id}
        className={cn(
          "flex items-center justify-between w-full",
          "px-3 py-2",
          "border rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
          "hover:cursor-pointer",
          isError && "border-red-500",
        )}
      >
        <SelectValue className={cn(!selectedOption && "text-gray-400")}>
          {selectedOption ? getOptionLabel(selectedOption) : placeholder}
        </SelectValue>
        <span aria-hidden="true" className="text-gray-400">
          ▼
        </span>
      </Button>
      <Popover
        className={cn(
          "w-[--trigger-width] min-w-64",
          "mt-1",
          "rounded-md border bg-white shadow-lg",
          "entering:animate-in entering:fade-in entering:zoom-in-95",
          "exiting:animate-out exiting:fade-out exiting:zoom-out-95",
        )}
      >
        <ListBox
          className={cn("max-h-60 overflow-auto", "outline-none", "p-1")}
          items={options.map((option) => ({
            id: getOptionValue(option),
            label: getOptionLabel(option),
          }))}
        >
          {(item) => (
            <ListBoxItem
              className={cn(
                "px-4 py-2",
                "cursor-pointer outline-none rounded-md",
                "transition-colors duration-150",
                "data-[hovered]:bg-gray-100",
                "data-[focused]:outline-none",
                "data-[selected]:bg-primary-base data-[selected]:text-white",
              )}
            >
              {item.label}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}
