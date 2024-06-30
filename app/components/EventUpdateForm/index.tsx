import {
  FormProvider,
  getFormProps,
  getInputProps,
  getSelectProps,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { PopoverClose } from "@radix-ui/react-popover";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { format } from "date-fns";
import { useEffect, useId } from "react";
import { EventAction } from "~/.server/actions";
import { EventEndpoints_EventPutRequest, Member } from "~/api/@types";
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
import { eventUpdateFormSchema } from "~/schema/eventFormSchema";

interface Props {
  defaultValue?: Partial<EventEndpoints_EventPutRequest>;
  members: Member[];
}

export function EventUpdateForm({ defaultValue, members }: Props) {
  const actionData = useActionData<EventAction>();
  const [form, { name, eventedAt, amount, payments, paidBy }] = useForm({
    defaultValue,
    lastResult: actionData?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: eventUpdateFormSchema,
      });
    },
  });
  const paymentFields = payments.getFieldList();

  const { change } = useInputControl(eventedAt);
  const { state } = useNavigation();

  useEffect(() => {
    if (paidBy.value) {
      members
        .filter(
          (member) =>
            member.userId !== paidBy.value &&
            paymentFields.every(
              (field) => field.value?.paidTo !== member.userId
            )
        )
        .forEach((member) =>
          form.insert({
            name: payments.name,
            defaultValue: {
              paidTo: member.userId,
              amount: "0",
            },
          })
        );
    }
  }, [members]); // eslint-disable-line react-hooks/exhaustive-deps

  const nameId = useId();
  const eventedAtId = useId();
  const paidById = useId();
  const amountId = useId();
  const burdenId = useId();

  return (
    <FormProvider context={form.context}>
      <Form
        {...getFormProps(form)}
        method="put"
        className="flex flex-col gap-8 items-center col-span-4"
      >
        <div className="w-full">
          <Label htmlFor={nameId}>イベント名</Label>
          <Input
            {...getInputProps(name, { type: "text" })}
            data-1p-ignore
            placeholder="イベント名を入力"
            disabled={state !== "idle"}
            id={nameId}
          />
          <p>{name.errors?.toString()}</p>
        </div>
        <div className="w-full">
          <Label htmlFor={eventedAtId}>イベント日</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                role="combobox"
                variant="outline"
                id={eventedAtId}
                className={cn(
                  "w-full pl-3 text-left font-normal",
                  !eventedAt.value && "text-muted-foreground"
                )}
                disabled={state !== "idle"}
              >
                {eventedAt.value ? (
                  format(eventedAt.value, "yyyy/MM/dd")
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
                  selected={
                    eventedAt.value ? new Date(eventedAt.value) : undefined
                  }
                  onSelect={(value) => change(value?.toISOString())}
                  initialFocus
                />
              </PopoverClose>
            </PopoverContent>
          </Popover>
          <p>{eventedAt.errors?.toString()}</p>
        </div>
        <div className="w-full">
          <Label htmlFor={paidById}>支払った人</Label>
          <Select
            {...getSelectProps(paidBy)}
            defaultValue={paidBy.value}
            onValueChange={(value) => {
              [...Array(members.length - 1)].forEach(() => {
                form.remove({
                  name: payments.name,
                  index: 0,
                });
              });
              window.setTimeout(() => {
                members
                  .filter((member) => member.userId !== value)
                  .forEach((member) => {
                    form.insert({
                      name: payments.name,
                      defaultValue: {
                        paidTo: member.userId,
                        amount: "0",
                      },
                    });
                  });
              }, 250);
            }}
            disabled={state !== "idle"}
          >
            <SelectTrigger>
              <SelectValue placeholder="ユーザーを選択" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.userId} value={member.userId}>
                  {member.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p>{paidBy.errors?.toString()}</p>
        </div>
        <div className="w-full">
          <Label htmlFor={amountId}>支払い額</Label>
          <Input
            {...getInputProps(amount, { type: "number" })}
            placeholder="支払額を入力"
            disabled={state !== "idle"}
            id={amountId}
          />
          <p>{amount.errors?.toString()}</p>
        </div>
        <div className="w-full">
          <Label htmlFor={burdenId}>負担額</Label>
          <Input
            value={
              Number(form.value?.amount ?? 0) -
              (Array.isArray(form.value?.payments)
                ? form.value.payments.reduce(
                    (accumulator, payment) =>
                      (accumulator += Number(payment?.amount ?? 0)),
                    0
                  )
                : 0)
            }
            disabled
            id={burdenId}
          />
        </div>
        {paymentFields.map((payment) => (
          <div key={payment.id} className="w-full">
            <Label>
              {
                members.find(
                  ({ userId }) => userId === payment.getFieldset().paidTo.value
                )?.name
              }
            </Label>
            <input
              {...getInputProps(payment.getFieldset().paidTo, {
                type: "hidden",
              })}
              key={payment.getFieldset().paidTo.id}
            />
            <Input
              {...getInputProps(payment.getFieldset().amount, {
                type: "number",
              })}
              key={payment.getFieldset().amount.id}
              placeholder="立替金額を入力"
              disabled={state !== "idle"}
            />
            <p>{payment.getFieldset().amount.errors?.toString()}</p>
          </div>
        ))}
        <Button
          type="submit"
          className="w-full max-w-2xl bg-sky-500 hover:bg-sky-600  font-semibold"
          disabled={state !== "idle"}
        >
          更新
        </Button>
      </Form>
    </FormProvider>
  );
}
