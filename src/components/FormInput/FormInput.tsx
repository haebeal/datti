import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import { HTMLInputTypeAttribute } from "react";
import { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface Props {
  label: string;
  placeholder: string;
  type?: HTMLInputTypeAttribute;
  readonly?: boolean;
  error?: FieldError;
  register: UseFormRegisterReturn;
}

export const FormInput = ({
  label,
  placeholder,
  type,
  readonly = false,
  register,
  error,
}: Props) => {
  const isError = error ? true : false;

  return (
    <FormControl isInvalid={isError}>
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
        <Input
          placeholder={placeholder}
          {...register}
          noOfLines={1}
          size="md"
          bg={readonly ? "" : "gray.200"}
          border="none"
          type={type}
          readOnly={readonly}
        />
      </Stack>
      {isError && <FormErrorMessage>{error?.message}</FormErrorMessage>}
    </FormControl>
  );
};
