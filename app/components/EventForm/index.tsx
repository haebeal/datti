import {
  SubmissionResult,
  getFormProps,
  getInputProps,
  useForm,
  useInputControl,
} from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { CalendarIcon } from "@radix-ui/react-icons";
import { Form, useNavigation } from "@remix-run/react";
import { format } from "date-fns";
import { useId } from "react";
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
import { eventSchema } from "~/schema/event";

interface Props {
  defaultValue?: EventCreateRequest | EventUpdateRequest;
  lastResult?: SubmissionResult<string[] | null>;
  method: "post" | "put";
}

export function EventForm({ defaultValue, lastResult, method }: Props) {
  const [form, { name, evented_at }] = useForm({
    defaultValue: defaultValue,
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: eventSchema });
    },
  });
  const { change } = useInputControl(evented_at);

  const { state } = useNavigation();

  const nameId = useId();
  const eventedAtId = useId();

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
