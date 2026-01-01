"use client";

import type { GroupMember } from "@/features/group/types";
import type { User } from "@/features/user/types";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorText } from "@/components/ui/error-text";
import { addMember } from "../actions/addMember";
import { searchUsers } from "@/features/user/actions/searchUsers";
import { useActionState, useState, useRef } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { addMemberSchema } from "../schema";

type Props = {
  groupId: string;
  members: GroupMember[];
};

export function GroupMemberManagement({ groupId, members }: Props) {
  // メンバー追加の状態管理
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const [lastResult, action, isAdding] = useActionState(addMember, undefined);
  const [form, { groupId: groupIdField, userId }] = useForm({
    lastResult,
    defaultValue: { groupId },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: addMemberSchema });
    },
    shouldRevalidate: "onInput",
  });

  const formRef = useRef<HTMLFormElement>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    // emailまたはnameで検索（@が含まれていればemail、そうでなければname）
    const searchParams = searchQuery.includes("@")
      ? { email: searchQuery }
      : { name: searchQuery };

    const result = await searchUsers(searchParams);

    if (result.success) {
      const currentMemberIds = members.map((m) => m.id);
      const filteredResults = result.result.filter(
        (user) => !currentMemberIds.includes(user.id),
      );
      setSearchResults(filteredResults);
      if (filteredResults.length === 0) {
        setSearchError("該当するユーザーが見つかりませんでした");
      }
    } else {
      setSearchError(result.error);
    }

    setIsSearching(false);
  };

  const handleAddMember = (selectedUserId: string) => {
    if (formRef.current) {
      const userIdInput = formRef.current.querySelector(
        `input[name="${userId.name}"]`,
      ) as HTMLInputElement;
      if (userIdInput) {
        userIdInput.value = selectedUserId;
        formRef.current.requestSubmit();
      }
    }
  };

  return (
    <div className={cn("p-6", "flex flex-col gap-3", "border rounded-lg")}>
      <h2 className={cn("text-lg font-semibold")}>メンバー管理</h2>

      <label htmlFor="search" className={cn("text-sm")}>
        メンバーを追加
      </label>

      <div className={cn("flex gap-5")}>
        <Input
          type="text"
          id="search"
          placeholder="ユーザー名またはメールアドレスで検索"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className={cn("flex-1")}
        />
        <Button
          type="button"
          onPress={handleSearch}
          isDisabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? "検索中..." : "検索"}
        </Button>
      </div>

      {searchError && <ErrorText>{searchError}</ErrorText>}

      {form.errors && <ErrorText>{form.errors}</ErrorText>}

      {searchResults.length > 0 && (
        <>
          <p className={cn("text-sm font-medium")}>検索結果:</p>
          {searchResults.map((user) => (
            <div
              key={user.id}
              className={cn(
                "flex items-center justify-between p-3",
                "border rounded-md",
              )}
            >
              <div>
                <p className={cn("font-semibold")}>{user.name}</p>
                <p className={cn("text-sm text-gray-500")}>{user.email}</p>
              </div>
              <Button
                type="button"
                onPress={() => handleAddMember(user.id)}
                isDisabled={isAdding}
              >
                {isAdding ? "追加中..." : "追加"}
              </Button>
            </div>
          ))}
        </>
      )}

      <form
        ref={formRef}
        id={form.id}
        onSubmit={form.onSubmit}
        action={action}
        className="hidden"
      >
        <input
          type="hidden"
          name={groupIdField.name}
          value={groupId}
          readOnly
        />
        <input type="hidden" name={userId.name} readOnly />
      </form>

      <hr />

      <h3 className={cn("text-sm font-medium")}>
        現在のメンバー ({members.length}人)
      </h3>

      {members.length === 0 ? (
        <div className={cn("text-center py-8 text-gray-500")}>
          メンバーがいません
        </div>
      ) : (
        <>
          {members.map((member) => (
            <div
              key={member.id}
              className={cn("flex items-center gap-4 p-4", "border rounded-md")}
            >
              <div
                className={cn(
                  "flex-shrink-0 w-10 h-10 rounded-full",
                  "bg-gradient-to-br from-primary-base to-primary-dark",
                  "flex items-center justify-center",
                  "text-white font-bold text-lg",
                )}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>

              <div className={cn("flex-1 min-w-0")}>
                <h3 className={cn("font-semibold truncate")}>{member.name}</h3>
                <p className={cn("text-sm text-gray-500 truncate")}>
                  {member.email}
                </p>
              </div>

              <Button
                type="button"
                isDisabled={true}
                color="error"
                colorStyle="outline"
              >
                削除
              </Button>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
