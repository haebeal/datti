import { composeStories } from "@storybook/react";
import { getByRole, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import * as stories from "./FriendCard.stories";

const user = userEvent.setup();

const { Friend, Applying, Applied } = composeStories(stories);

describe("FriendCardコンポーネントのテスト", () => {
  it("ユーザー情報が表示される", () => {
    /* Arrange */
    const { container } = render(<Friend />);

    /* Assert */
    expect(getByRole(container, "img")).toBeInTheDocument();
    expect(getByRole(container, "heading")).toBeInTheDocument();
  });

  describe("フレンド状態のテスト", () => {
    it("解除ボタンが表示される", () => {
      /* Arrange */
      const { container } = render(<Friend />);

      /* Assert */
      expect(
        getByRole(container, "button", {
          name: "解除",
        })
      ).toBeInTheDocument();
    });

    it("解除ボタン押下時、 onClickDenly が実行される", async () => {
      /* Arrange */
      const onClickDeny = vi.fn();
      const { container } = render(<Friend onClickDeny={onClickDeny} />);

      /* Act */
      await user.click(
        getByRole(container, "button", {
          name: "解除",
        })
      );

      /* Assert */
      expect(onClickDeny).toHaveBeenCalledWith(Friend.args.friend);
    });
  });

  describe("申請中状態のテスト", () => {
    it("申請取り消しボタンが表示される", () => {
      /* Arrange */
      const { container } = render(<Applying />);

      /* Assert */
      expect(
        getByRole(container, "button", {
          name: "申請取り消し",
        })
      ).toBeInTheDocument();
    });

    it("申請取り消しボタン押下時、 onClickDeny が実行される", async () => {
      /* Arrange */
      const onClickDeny = vi.fn();
      const { container } = render(<Applying onClickDeny={onClickDeny} />);

      /* Act */
      await user.click(
        getByRole(container, "button", {
          name: "申請取り消し",
        })
      );

      /* Assert */
      expect(onClickDeny).toHaveBeenCalledWith(Applying.args.friend);
    });
  });

  describe("申請中受理中のテスト", () => {
    it("承認ボタンが表示される", () => {
      /* Arrange */
      const { container } = render(<Applied />);

      /* Assert */
      expect(
        getByRole(container, "button", {
          name: "承認",
        })
      ).toBeInTheDocument();
    });

    it("承認ボタン押下時、 onClickApply が実行される", async () => {
      /* Arrange */
      const onClickApply = vi.fn();
      const { container } = render(<Applied onClickApply={onClickApply} />);

      /* Act */
      await user.click(
        getByRole(container, "button", {
          name: "承認",
        })
      );

      /* Assert */
      expect(onClickApply).toHaveBeenCalledWith(Applied.args.friend);
    });

    it("却下ボタンが表示される", () => {
      /* Arrange */
      const { container } = render(<Applied />);

      /* Assert */
      expect(
        getByRole(container, "button", {
          name: "却下",
        })
      ).toBeInTheDocument();
    });

    it("却下ボタン押下時、 onClickDeny が実行される", async () => {
      /* Arrange */
      const onClickDeny = vi.fn();
      const { container } = render(<Applied onClickDeny={onClickDeny} />);

      /* Act */
      await user.click(
        getByRole(container, "button", {
          name: "却下",
        })
      );

      /* Assert */
      expect(onClickDeny).toHaveBeenCalledWith(Applied.args.friend);
    });
  });
});
