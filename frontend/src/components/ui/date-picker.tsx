import { ja } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { formatDate } from "@/utils/format";
import { cn } from "@/lib/utils";

type Props = {
	id?: string;
	/** "yyyy-MM-dd" 形式 (JST のカレンダー日) */
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	isError?: boolean;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** "yyyy-MM-dd" → ローカル日付 (TZ ずれ回避のため get-系で構築) */
function parseYmd(value?: string): Date | undefined {
	if (!value) return undefined;
	const [y, m, d] = value.split("-").map(Number);
	if (!y || !m || !d) return undefined;
	return new Date(y, m - 1, d);
}

/** ローカル日付 → "yyyy-MM-dd" */
function toYmd(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * shadcn(Popover + Calendar) ベースの日付ピッカー。
 * 値は "yyyy-MM-dd" 文字列で controlled に入出力する。
 */
export function DatePicker({
	id,
	value,
	onChange,
	placeholder = "日付を選択",
	disabled,
	className,
	isError,
}: Props) {
	const [open, setOpen] = useState(false);
	const selected = parseYmd(value);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type="button"
					variant="outline"
					disabled={disabled}
					className={cn(
						"h-11 w-full justify-start px-3.5 font-normal",
						!selected && "text-muted-foreground",
						isError && "border-destructive",
						className,
					)}
				>
					<CalendarIcon className="size-4 text-muted-foreground" />
					{selected ? formatDate(value as string) : placeholder}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-auto p-0" align="start">
				<Calendar
					mode="single"
					locale={ja}
					selected={selected}
					defaultMonth={selected}
					onSelect={(date) => {
						if (date) onChange?.(toYmd(date));
						setOpen(false);
					}}
					autoFocus
				/>
			</PopoverContent>
		</Popover>
	);
}
