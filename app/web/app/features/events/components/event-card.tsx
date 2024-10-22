import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Form, Link, useLocation, useNavigation } from "@remix-run/react";
import type { EventEndpoints_EventResponse } from "~/api/@types";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTrigger,
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";

import { deleteEventSchema as schema } from "../schemas";

interface Props {
	event: Pick<EventEndpoints_EventResponse, "eventId" | "name">;
}

export function EventCard({ event }: Props) {
	const { pathname } = useLocation();
	const { state } = useNavigation();

	const [form, { eventId }] = useForm({
		defaultValue: event,
		onValidate({ formData }) {
			return parseWithZod(formData, {
				schema: schema,
			});
		},
	});

	return (
		<div className="flex flex-row  w-full bg-white hover:bg-slate-50 items-center rounded-md border border-gray-200 px-6">
			<Link
				className="flex-1 hover:cursor-pointer py-5 gap-5 "
				to={`${pathname}/${event.eventId}`}
			>
				<h1 className="text-lg font-bold mr-auto">{event.name}</h1>
			</Link>

			<AlertDialog>
				<AlertDialogTrigger
					asChild
					onClick={(event) => event.stopPropagation()}
				>
					<Button
						disabled={state === "submitting"}
						className="bg-red-500 hover:bg-red-600 font-semibold"
					>
						削除
					</Button>
				</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>イベントを削除しますか?</AlertDialogHeader>
					<AlertDialogDescription>
						イベントを削除すると他のユーザーからも削除されます。
						<br />
						本当によろしいですか？
					</AlertDialogDescription>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={(event) => event.stopPropagation()}>
							キャンセル
						</AlertDialogCancel>
						<Form {...getFormProps(form)} method="delete">
							<input {...getInputProps(eventId, { type: "hidden" })} />
							<AlertDialogAction
								disabled={state === "submitting"}
								onClick={(event) => event.stopPropagation()}
								className="font-semibold bg-red-500 hover:bg-red-600"
								type="submit"
							>
								削除
							</AlertDialogAction>
						</Form>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
