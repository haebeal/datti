import { cn } from "@/utils/cn";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { parseDate } from "@internationalized/date";
import { type ComponentPropsWithRef, useState } from "react";
import {
  DatePicker as AriaDatePicker,
  Button,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Dialog,
  Group,
  Heading,
  Popover,
} from "react-aria-components";

type Props = ComponentPropsWithRef<"input"> & {
  isError?: boolean;
};

export function DatePicker(props: Props) {
  const {
    ref,
    className,
    defaultValue,
    placeholder,
    readOnly,
    isError,
    ...rest
  } = props;

  const isTouchDevice = useIsTouchDevice();

  const [isOpen, setOpen] = useState(false);
  const [value, setValue] = useState(
    typeof defaultValue === "string"
      ? parseDate(defaultValue.split("T")[0])
      : null,
  );

  // モバイル: ネイティブのdate inputを使用
  if (isTouchDevice) {
    return (
      <input
        {...rest}
        ref={ref}
        type="date"
        defaultValue={
          typeof defaultValue === "string"
            ? defaultValue.split("T")[0]
            : undefined
        }
        placeholder={placeholder}
        className={cn(
          "w-full",
          "px-3 py-2",
          "border rounded-md",
          "focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
          isError && "border-red-500",
          className,
        )}
      />
    );
  }

  // PC: カスタムUIを使用
  return (
    <AriaDatePicker
      className={className}
      value={value}
      aria-labelledby={props.id}
      onChange={(value) => {
        setValue(value);
        setOpen(false);
      }}
    >
      <Group>
        <button
          type="button"
          onClick={(e) => {
            setOpen(true);
            e.currentTarget.blur();
          }}
          onTouchStart={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.code === "Space") setOpen(true);
            else if (e.code === "Escape") e.currentTarget.blur();
          }}
          className={cn(
            "flex items-center justify-between w-full text-left",
            "px-3 py-2",
            "border rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-primary-base",
            "hover:cursor-text",
            isError && "border-red-500",
          )}
        >
          {value ? (
            <p>{value.toString()}</p>
          ) : (
            <p className="text-gray-400">{placeholder}</p>
          )}
        </button>
        <input
          {...rest}
          ref={ref}
          value={value?.toString() ?? ""}
          type="hidden"
        />
      </Group>
      <Popover isOpen={isOpen} onOpenChange={setOpen}>
        <Dialog
          className={cn(
            "min-w-80 max-w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-oln-17B-100 text-solid-gray-800",
            "aria-disabled:border-solid-gray-300 aria-disabled:bg-solid-gray-50 aria-disabled:text-solid-gray-420 aria-disabled:pointer-events-none aria-disabled:forced-colors:text-[GrayText] aria-disabled:forced-colors:border-[GrayText]",
          )}
        >
          <Calendar>
            <header className="flex items-center justify-between px-4 py-3">
              <Button slot="previous" className="hover:cursor-pointer">
                ◀︎
              </Button>
              <Heading />
              <Button slot="next" className="hover:cursor-pointer">
                ▶︎
              </Button>
            </header>
            <CalendarGrid className="">
              <CalendarGridHeader>
                {(day) => (
                  <CalendarHeaderCell
                    className={`
												p-3 rounded text-center
											`}
                  >
                    {day}
                  </CalendarHeaderCell>
                )}
              </CalendarGridHeader>
              <CalendarGridBody>
                {(date) => (
                  <CalendarCell
                    date={date}
                    className={cn(
                      "p-3 rounded text-center hover:cursor-pointer",
                      "data-[outside-month]:text-gray-400 data-[outside-month]:cursor-default",
                      "data-[selected]:bg-primary-base data-[selected]:text-white",
                    )}
                  />
                )}
              </CalendarGridBody>
            </CalendarGrid>
          </Calendar>
        </Dialog>
      </Popover>
    </AriaDatePicker>
  );
}
