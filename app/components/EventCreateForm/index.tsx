import {
  getFormProps,
  getInputProps,
  getSelectProps,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import {
  Await,
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { format } from "date-fns";
import { Suspense, useId } from "react";
import { EventAction } from "~/.server/actions";
import { EventLoader } from "~/.server/loaders";
import { EventEndpoints_EventPostRequest } from "~/api/@types";
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
import { eventCreateFormSchema } from "~/schema/eventFormSchema";

interface Props {
  defaultValue?: Partial<EventEndpoints_EventPostRequest>;
}

export function EventCreateForm({ defaultValue }: Props) {
  const { members } = useLoaderData<EventLoader>();
  const actionData = useActionData<EventAction>();
  const [form, { name, evented_at, amount, payments, paid_by }] = useForm({
    defaultValue,
    lastResult: actionData?.submission,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: eventCreateFormSchema,
      });
    },
  });
  const paymentFields = payments.getFieldList();

  const { change } = useInputControl(evented_at);
  const { state } = useNavigation();

  const nameId = useId();
  const eventedAtId = useId();
  const paidById = useId();
  const amountId = useId();
  const burdenId = useId();

  return (
    <Form
      {...getFormProps(form)}
      method="post"
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
        <Label htmlFor={paidById}>支払った人</Label>
        <Select
          {...getSelectProps(paid_by)}
          defaultValue={paid_by.value}
          disabled={state !== "idle"}
        >
          <SelectTrigger>
            <SelectValue placeholder="ユーザーを選択" />
          </SelectTrigger>
          <SelectContent>
            <Suspense>
              <Await resolve={members}>
                {({ members }) => (
                  <>
                    {members.map((member) => (
                      <SelectItem key={member.uid} value={member.uid}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </>
                )}
              </Await>
            </Suspense>
          </SelectContent>
        </Select>
        <p>{paid_by.errors?.toString()}</p>
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
                        ({ uid }) => uid === payment.getFieldset().paid_to.value
                      )?.name
                    }
                  </Label>
                  <input
                    {...getInputProps(payment.getFieldset().paid_to, {
                      type: "hidden",
                    })}
                    key={payment.getFieldset().paid_to.id}
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
        作成
      </Button>
    </Form>
  );
}
