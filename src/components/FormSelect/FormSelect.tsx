import { FormControl, FormLabel, Heading, Stack } from "@chakra-ui/react";
import { AsyncProps, AsyncSelect, GroupBase } from "chakra-react-select";
import { useId } from "react";
import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";

type Props<T extends FieldValues, U> = AsyncProps<
  {
    label: string;
    value: string;
  },
  true,
  GroupBase<{
    label: string;
    value: string;
  }>
> & {
  id?: string;
  label: string;
  placeholder: string;
  readonly?: boolean;
  error?: FieldError;
  control: Control<T>;
  name: Path<T>;
};

export const FormSelect = <T extends FieldValues, U>({
  label,
  placeholder,
  readonly = false,
  error,
  control,
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
          render={({ field }) => (
            <AsyncSelect<
              {
                label: string;
                value: string;
              },
              false
            >
              {...field}
              instanceId={id}
              placeholder={placeholder}
              loadOptions={loadOptions}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
              onChange={(newValue) => {
                field.onChange(newValue?.value ?? null);
              }}
              defaultOptions
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
              isClearable
            />
          )}
        />
      </Stack>
    </FormControl>
  );
};
