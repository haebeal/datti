import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, Link, useLocation } from "@remix-run/react";
import type { EventEndpoints_EventResponse } from "~/api/@types";

import { Button, Dialog, DialogBody } from "~/components";

import { useRef } from "react";
import { deleteEventSchema as schema } from "../schemas";

interface Props {
	event: Pick<EventEndpoints_EventResponse, "eventId" | "name">;
}

export function EventCard({ event }: Props) {
	const { pathname } = useLocation();

	const dialogRef = useRef<HTMLDialogElement>(null);

	const [form, { eventId }] = useForm({
		defaultValue: event,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: schema,
			});
		},
	});

	return (
		<>
			<Link
				to={`${pathname}/${event.eventId}`}
				className="flex flex-row gap-5 items-center justify-between py-5 px-3"
			>
				<span className="text-std-20N-150 pl-3">{event.name}</span>
				<Button
					size="md"
					onClick={(event) => {
						event.preventDefault();
						event.stopPropagation();
						dialogRef.current?.showModal();
					}}
					variant="solid-fill"
					className="bg-red-900 hover:bg-red-1000 active:bg-red-1100"
				>
					削除
				</Button>
			</Link>
			<Dialog
				aria-labelledby="confirm-delete-event"
				className="w-full max-w-[calc(560/16*1rem)]"
				ref={dialogRef}
			>
				<DialogBody>
					<h2 className="text-std-24N-150">イベントを削除しますか?</h2>
					<p>
						イベントを削除すると他のユーザーからも削除されます。
						<br />
						本当によろしいですか?
					</p>
					<Form {...getFormProps(form)} method="delete">
						<input {...getInputProps(eventId, { type: "hidden" })} />
						<Button
							size="md"
							type="submit"
							variant="solid-fill"
							className="bg-red-900 hover:bg-red-1000 active:bg-red-1100"
						>
							削除
						</Button>
					</Form>
					<Button
						size="md"
						onClick={() => dialogRef.current?.close()}
						variant="outline"
					>
						キャンセル
					</Button>
				</DialogBody>
			</Dialog>
		</>
	);
}
