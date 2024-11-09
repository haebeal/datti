import { parseDate } from "@internationalized/date";
import { type ComponentProps, forwardRef, useState } from "react";
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

export type InputBlockSize = "lg" | "md" | "sm";

export const InputBlockSizeStyle: { [key in InputBlockSize]: string } = {
	// NOTE:
	// Tailwind CSS (v3.4.4) does not have any utility classes for logical properties of sizing.
	// Once it　is officially released, we will replace them with classes like `bs-14`.
	lg: "h-14",
	md: "h-12",
	sm: "h-10",
};

export type DatePickerProps = ComponentProps<"input"> & {
	isError?: boolean;
	blockSize?: InputBlockSize;
};

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
	(props) => {
		const {
			className,
			defaultValue,
			placeholder,
			readOnly,
			isError,
			blockSize = "lg",
			...rest
		} = props;

		const [isOpen, setOpen] = useState(false);
		const [value, setValue] = useState(
			typeof defaultValue === "string"
				? parseDate(new Date(defaultValue).toLocaleDateString("sv-SE"))
				: undefined,
		);

		return (
			<AriaDatePicker
				value={value}
				aria-labelledby={props["aria-labelledby"]}
				onChange={(value) => {
					setValue(value);
					setOpen(false);
				}}
			>
				<Group
					className={`
						flex items-center justify-between p-1
						min-w-80 max-w-full rounded-lg border bg-white px-4 py-3 text-oln-16N-100 text-solid-gray-800
						aria-disabled:border-solid-gray-300 aria-disabled:bg-solid-gray-50 aria-disabled:text-solid-gray-420 aria-disabled:pointer-events-none aria-disabled:forced-colors:text-[GrayText] aria-disabled:forced-colors:border-[GrayText]
						${InputBlockSizeStyle[blockSize]}
						${isError ? "border-error-1" : "border-solid-gray-900"}
						focus:outline focus:outline-4 focus:outline-black focus:outline-offset-[calc(2/16*1rem)] focus:ring-[calc(2/16*1rem)] focus:ring-yellow-300
						${className ?? ""}
					`}
					onClick={() => setOpen(true)}
					onTouchStart={() => setOpen(true)}
				>
					{value ? (
						<p>{value.toString()}</p>
					) : (
						<p className="text-gray-400">{placeholder}</p>
					)}
					<input
						{...rest}
						value={value?.toDate("Asia/Tokyo").toISOString()}
						type="hidden"
					/>
				</Group>
				<Popover isOpen={isOpen} onOpenChange={setOpen}>
					<Dialog
						className={`
							min-w-80 max-w-full rounded-lg border bg-white px-4 py-3 text-oln-17B-100 text-solid-gray-800
						aria-disabled:border-solid-gray-300 aria-disabled:bg-solid-gray-50 aria-disabled:text-solid-gray-420 aria-disabled:pointer-events-none aria-disabled:forced-colors:text-[GrayText] aria-disabled:forced-colors:border-[GrayText]
						`}
					>
						<Calendar>
							<header className="flex items-center justify-between px-4 py-3">
								<Button slot="previous">◀︎</Button>
								<Heading />
								<Button slot="next">▶︎</Button>
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
											className={`
												p-3 rounded text-center
												data-[outside-month]:text-gray-400 data-[outside-month]:cursor-default
												data-[selected]:bg-blue-900 data-[selected]:text-white
										`}
										/>
									)}
								</CalendarGridBody>
							</CalendarGrid>
						</Calendar>
					</Dialog>
				</Popover>
			</AriaDatePicker>
		);
	},
);
