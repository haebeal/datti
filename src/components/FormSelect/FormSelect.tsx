import { FormControl, FormLabel, Heading, Stack } from "@chakra-ui/react";
import {
  ActionMeta,
  AsyncProps,
  AsyncSelect,
  GroupBase,
  SingleValue,
} from "chakra-react-select";
import { useId } from "react";
import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";

type Props<T extends FieldValues, U> = AsyncProps<U, true, GroupBase<U>> & {
  id?: string;
  label: string;
  placeholder: string;
  readonly?: boolean;
  error?: FieldError;
  control: Control<T>;
  name: Path<T>;
  onChangeSelect?: (
    newValue: SingleValue<U>,
    actionMeta: ActionMeta<U>,
  ) => void;
};

export const FormSelect = <T extends FieldValues, U>({
  label,
  placeholder,
  readonly = false,
  error,
  control,
  name,
  loadOptions,
  getOptionLabel,
  getOptionValue,
  value,
  onChangeSelect,
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
            <AsyncSelect<U, false>
              {...field}
              instanceId={id}
              placeholder={placeholder}
              getOptionLabel={getOptionLabel}
              getOptionValue={getOptionValue}
              value={value}
              onChange={onChangeSelect}
              loadOptions={loadOptions}
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
