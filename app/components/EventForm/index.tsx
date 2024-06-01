import {
  SubmissionResult,
  getFormProps,
  getInputProps,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Await, Form, useLoaderData, useNavigation } from "@remix-run/react";
import { format } from "date-fns";
import { Suspense, useId } from "react";
import { GroupEventsLoader } from "~/.server/loaders";
import { EventCreateRequest, EventUpdateRequest } from "~/api/datti/@types";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { cn } from "~/lib/utils";
import { eventFormSchema } from "~/schema/eventFormScheam";

interface Props {
  defaultValue?: Partial<EventCreateRequest | EventUpdateRequest>;
  lastResult?: SubmissionResult<string[]> | null | undefined;
  method: "post" | "put";
}

export function EventForm({ defaultValue, lastResult, method }: Props) {
  const { members } = useLoaderData<GroupEventsLoader>();

  const [form, { name, evented_at, amount, payments }] = useForm({
    defaultValue,
    lastResult,
    constraint: getZodConstraint(eventFormSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: eventFormSchema });
    },
  });
  const paymentFields = payments.getFieldList();

  const { change } = useInputControl(evented_at);
  const { state } = useNavigation();

  const nameId = useId();
  const eventedAtId = useId();
  const amountId = useId();
  const burdenId = useId();

  return (
    <Form
      method={method}
      {...getFormProps(form)}
      className="flex flex-col gap-8 items-center col-span-4"
    >
      <div className="w-full">
        <Label htmlFor={nameId}>イベント名</Label>
        <Input
          {...getInputProps(name, { type: "text" })}
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
                !evented_at.value && "text-muted-foreground"
              )}
              disabled={state !== "idle"}
            >
              {evented_at.value ? (
                format(evented_at.value, "yyyy/MM/dd")
              ) : (
                <span>日付を選択してください</span>
              )}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={
                evented_at.value ? new Date(evented_at.value) : undefined
              }
              onSelect={(value) => change(value?.toISOString())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <p>{evented_at.errors?.toString()}</p>
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
      <Suspense fallback={<p>loading...</p>}>
        <Await resolve={members}>
          {({ members }) => (
            <>
              {paymentFields.map((payment) => (
                <div key={payment.id} className="w-full">
                  <Label>
                    {
                      members.find(
                        ({ uid }) => uid === payment.getFieldset().user.value
                      )?.name
                    }
                  </Label>
                  <input
                    {...getInputProps(payment.getFieldset().user, {
                      type: "hidden",
                    })}
                    key={payment.getFieldset().user.id}
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
            </>
          )}
        </Await>
      </Suspense>
      <Button
        type="submit"
        className="w-full max-w-2xl bg-sky-500 hover:bg-sky-600  font-semibold"
        disabled={state !== "idle"}
      >
        {method === "post" ? "作成" : "更新"}
      </Button>
    </Form>
  );
}
