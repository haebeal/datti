import {
  FormControl,
  Stack,
  Heading,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/react";
import { forwardRef, type HTMLInputTypeAttribute } from "react";

interface Props {
  /**
   * ラベル
   */
  label: string;
  /**
   * input要素のplaceholder属性
   */
  placeholder: string;
  /**
   * input要素のtype属性
   */
  type?: HTMLInputTypeAttribute;
  /**
   * 読み取り専用
   */
  readonly?: boolean;
  /**
   * 非活性
   */
  disabled?: boolean;
  /**
   * エラーメッセージ
   */
  error?: string;
}

/**
 * フォームで使用するテキストinput要素
 */
export const FormInput = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      placeholder,
      type = "text",
      readonly = false,
      disabled = false,
      error,
    },
    ref
  ) => {
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
            ref={ref}
            noOfLines={1}
            readOnly={readonly}
            disabled={disabled}
            size="md"
            bg={readonly ? "" : "gray.200"}
            border="none"
            type={type}
          />
        </Stack>
        {isError ? <FormErrorMessage>{error}</FormErrorMessage> : null}
      </FormControl>
    );
  }
);

FormInput.displayName = "FormInput";
