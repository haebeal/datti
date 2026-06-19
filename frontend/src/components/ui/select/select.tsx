import { type ComponentPropsWithRef, useEffect, useState } from "react";
import {
	Select as AriaSelect,
	Button,
	ListBox,
	ListBoxItem,
	Popover,
	SelectValue,
} from "react-aria-components";
import { useIsTouchDevice } from "@/hooks/useIsTouchDevice";
import { cn } from "@/lib/utils";

type Props<T> = Omit<ComponentPropsWithRef<"input">, "defaultValue"> & {
	isError?: boolean;
	options: T[];
	getOptionLabel: (option: T) => string;
	getOptionValue: (option: T) => string;
	defaultValue?: string;
	placeholder?: string;
};

export function Select<T>(props: Props<T>) {
	const {
		className,
		defaultValue,
		placeholder = "選択してください",
		isError,
		options,
		getOptionLabel,
		getOptionValue,
		name,
		id,
		required,
		disabled,
		autoComplete,
		form,
	} = props;

	const isTouchDevice = useIsTouchDevice();

	const [selectedKey, setSelectedKey] = useState<string | null>(
		defaultValue ?? null,
	);

	useEffect(() => {
		setSelectedKey(defaultValue ?? null);
	}, [defaultValue]);

	const selectedOption = options.find(
		(option) => getOptionValue(option) === selectedKey,
	);

	if (isTouchDevice) {
		return (
			<select
				id={id}
				name={name}
				required={required}
				disabled={disabled}
				autoComplete={autoComplete}
				form={form}
				defaultValue={defaultValue ?? ""}
				className={cn(
					"w-full",
					"px-3 py-2",
					"rounded-lg border border-input bg-card",
					"outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
					"disabled:opacity-50 disabled:cursor-not-allowed",
					isError && "border-destructive",
					className,
				)}
			>
				<option value="" disabled>
					{placeholder}
				</option>
				{options.map((option) => (
					<option key={getOptionValue(option)} value={getOptionValue(option)}>
						{getOptionLabel(option)}
					</option>
				))}
			</select>
		);
	}

	return (
		<AriaSelect
			className={className}
			selectedKey={selectedKey}
			onSelectionChange={(key) => setSelectedKey(key as string)}
			name={name}
			isRequired={required}
			isDisabled={disabled}
			autoComplete={autoComplete}
			form={form}
		>
			<Button
				id={id}
				className={cn(
					"flex items-center justify-between w-full",
					"px-3 py-2",
					"rounded-lg border border-input bg-card",
					"outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30",
					"hover:cursor-pointer",
					isError && "border-destructive",
				)}
			>
				<SelectValue className={cn(!selectedOption && "text-muted-foreground")}>
					{selectedOption ? getOptionLabel(selectedOption) : placeholder}
				</SelectValue>
				<span aria-hidden="true" className="text-muted-foreground">
					▼
				</span>
			</Button>
			<Popover
				className={cn(
					"w-[--trigger-width] min-w-64",
					"mt-1",
					"rounded-lg border border-border bg-popover shadow-lg",
					"entering:animate-in entering:fade-in entering:zoom-in-95",
					"exiting:animate-out exiting:fade-out exiting:zoom-out-95",
				)}
			>
				<ListBox
					className={cn("max-h-60 overflow-auto", "outline-none", "p-1")}
					items={options.map((option) => ({
						id: getOptionValue(option),
						label: getOptionLabel(option),
					}))}
				>
					{(item) => (
						<ListBoxItem
							className={cn(
								"px-4 py-2",
								"cursor-pointer outline-none rounded-md",
								"transition-colors duration-150",
								"data-[hovered]:bg-secondary",
								"data-[focused]:outline-none",
								"data-[selected]:bg-primary data-[selected]:text-primary-foreground",
							)}
						>
							{item.label}
						</ListBoxItem>
					)}
				</ListBox>
			</Popover>
		</AriaSelect>
	);
}
