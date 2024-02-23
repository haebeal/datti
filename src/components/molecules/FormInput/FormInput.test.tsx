import { composeStories } from "@storybook/react";
import {
  getByPlaceholderText,
  getByRole,
  getByText,
  render,
} from "@testing-library/react";

import * as stories from "./FormInput.stories";

const { Default, Readonly, Disable, Error } = composeStories(stories);

describe("FormInputコンポーネントのテスト", () => {
  it("ラベルが表示される", () => {
    /* Arrange */
    const { container } = render(<Default />);
    const { label } = Default.args;

    /* Assert */
    expect(
      getByRole(container, "textbox", {
        name: label,
      })
    ).toBeInTheDocument();
  });

  it("placeholder が表示される", () => {
    /* Arrange */
    const { container } = render(<Default />);
    const { placeholder } = Default.args;

    /* Assert */
    expect(getByPlaceholderText(container, placeholder!)).toBeInTheDocument();
  });

  it("readonly が true の場合、読み取り専用になる", () => {
    /* Arrange */
    const { container } = render(<Readonly />);
    const { label } = Default.args;

    /* Assert */
    expect(
      getByRole(container, "textbox", {
        name: label,
      })
    ).toHaveAttribute("readonly");
  });

  it("disabled が true の場合、非活性になる", () => {
    /* Arrange */
    const { container } = render(<Disable />);
    expect(getByRole(container, "textbox")).toBeDisabled();
  });

  it("エラーが表示される", () => {
    /* Arrange */
    const { container } = render(<Error />);
    const { error } = Error.args;

    /* Assert */
    expect(getByText(container, error!)).toBeInTheDocument();
  });
});
