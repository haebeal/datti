import {
  FormControl,
  Stack,
  Heading,
  FormLabel,
  Input,
  FormErrorMessage,
} from "@chakra-ui/react";
import { forwardRef } from "react";

import type { ComponentPropsWithoutRef } from "react";

type Props = ComponentPropsWithoutRef<typeof Input> & {
  /**
   * ラベル
   */
  label: string;
  /**
   * エラーメッセージ
   */
  error?: string;
};

/**
 * フォームで使用するテキストinput要素
 */
export const FormInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, ...props }, ref) => {
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
            ref={ref}
            {...props}
            noOfLines={1}
            size="md"
            border="none"
            bg={props.readOnly ? "" : "gray.200"}
          />
        </Stack>
        {isError ? <FormErrorMessage>{error}</FormErrorMessage> : null}
      </FormControl>
    );
  }
);

FormInput.displayName = "FormInput";
