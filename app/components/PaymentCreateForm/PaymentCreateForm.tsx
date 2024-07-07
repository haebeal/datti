import {
  getFormProps,
  getInputProps,
  getSelectProps,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { PopoverClose } from "@radix-ui/react-popover";
import { Form, useNavigation } from "@remix-run/react";
import { format } from "date-fns";
import { useId } from "react";
import { PaymentUser } from "~/api/@types";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { paymentCreateFormSchema } from "~/schema/paymentFormSchema";

interface Props {
  payments: PaymentUser[];
}

export function PaymentCreateForm({ payments }: Props) {
  const [form, { paidTo, paidAt, amount }] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: paymentCreateFormSchema,
      });
    },
  });

  const { change } = useInputControl(paidAt);
  const { state } = useNavigation();

  const paidToId = useId();
  const paidAtId = useId();
  const amountId = useId();

  return (
    <Form
      {...getFormProps(form)}
      method="post"
      className="flex flex-col gap-8 items-center col-span-4"
    >
      <div className="w-full">
        <Label htmlFor={paidToId}>返済日</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              role="combobox"
              variant="outline"
              id={paidAtId}
              className={cn(
                "w-full pl-3 text-left font-normal",
                !paidAt.value && "text-muted-foreground"
              )}
              disabled={state !== "idle"}
            >
              {paidAt.value ? (
                format(paidAt.value, "yyyy/MM/dd")
              ) : (
                <span>日付を選択してください</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <PopoverClose>
              <Calendar
                mode="single"
                selected={paidAt.value ? new Date(paidAt.value) : undefined}
                onSelect={(value) => change(value?.toISOString())}
                initialFocus
              />
            </PopoverClose>
          </PopoverContent>
        </Popover>
        <p>{paidAt.errors?.toString()}</p>
      </div>
      <div className="w-full">
        <Label htmlFor={paidToId}>返済対象ユーザー</Label>
        <Select
          {...getSelectProps(paidTo)}
          defaultValue={paidTo.value}
          disabled={state !== "idle"}
        >
          <SelectTrigger>
            <SelectValue placeholder="ユーザーを選択" />
          </SelectTrigger>
          <SelectContent>
            {payments.map((payment) => (
              <SelectItem key={payment.user.userId} value={payment.user.userId}>
                {payment.user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p>{paidTo.errors?.toString()}</p>
      </div>
      <div className="w-full">
        <Label htmlFor={amountId}>返済額</Label>
        <Input
          {...getInputProps(amount, { type: "number" })}
          placeholder="支払額を入力"
          disabled={state !== "idle"}
          id={amountId}
        />
        <p>{amount.errors?.toString()}</p>
      </div>
      <Button
        type="submit"
        className="w-full max-w-2xl bg-sky-500 hover:bg-sky-600  font-semibold"
        disabled={state !== "idle"}
      >
        作成
      </Button>
    </Form>
  );
}
