import { FormControl, FormLabel, Heading, Stack } from "@chakra-ui/react";
import {
  AsyncSelect,
  GroupBase,
  OptionsOrGroups,
  PropsValue,
} from "chakra-react-select";
import { useId } from "react";
import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";

interface Props<T extends FieldValues, U> {
  id?: string;
  label: string;
  placeholder: string;
  readonly?: boolean;
  error?: FieldError;
  control: Control<T>;
  name: Path<T>;
  defaultOptions?:
    | boolean
    | OptionsOrGroups<
        {
          label: string;
          value: U;
        },
        GroupBase<{
          label: string;
          value: U;
        }>
      >;
  defaultValue?: PropsValue<
    | {
        label: string;
        value: U;
      }
    | GroupBase<{
        label: string;
        value: U;
      }>
  >;
  loadOptions: (
    inputValue: string,
    callback: (
      options: OptionsOrGroups<
        {
          label: string;
          value: U;
        },
        GroupBase<{
          label: string;
          value: U;
        }>
      >,
    ) => void,
  ) => Promise<
    OptionsOrGroups<
      {
        label: string;
        value: U;
      },
      GroupBase<{
        label: string;
        value: U;
      }>
    >
  >;
}

export const FormSelect = <T extends FieldValues, U>({
  label,
  placeholder,
  readonly = false,
  error,
  control,
  defaultValue,
  defaultOptions = true,
  name,
  loadOptions,
}: Props<T, U>) => {
  const id = useId();

  return (
    <FormControl isInvalid={error ? true : false}>
      <Stack direction={{ base: "column", md: "row" }}>
        <Heading
          w={{ base: "", md: "30%" }}
          as={FormLabel}
          pt={2}
          size="sm"
          noOfLines={1}
        >
          {label}
        </Heading>
        <Controller
          control={control}
          name={name}
          render={({ field: { onChange, value } }) => (
            <AsyncSelect
              instanceId={id}
              cacheOptions={false}
              placeholder={placeholder}
              defaultOptions={defaultOptions}
              loadOptions={loadOptions}
              defaultValue={defaultValue}
              chakraStyles={{
                container: (provided) => ({
                  ...provided,
                  width: "full",
                }),
                control: (provided) => ({
                  ...provided,
                  backgroundColor: readonly ? "" : "gray.200",
                }),
              }}
              size="md"
              required
              isReadOnly={readonly}
              onChange={(newValue) => {
                onChange(!newValue ? null : newValue.value);
              }}
              isClearable
            />
          )}
        />
      </Stack>
    </FormControl>
  );
};
