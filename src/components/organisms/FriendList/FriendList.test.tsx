import { composeStories } from "@storybook/react";
import { getByText, render } from "@testing-library/react";

import * as stories from "./FriendList.stories";

const { NoFriends } = composeStories(stories);

describe("FriendListコンポーネントのテスト", () => {
  it("フレンドが存在しない場合、「フレンドが存在しません」が表示される", () => {
    /* Arrange */
    const { container } = render(<NoFriends />);

    /* Assert */
    expect(getByText(container, "フレンドが存在しません")).toBeInTheDocument();
  });
});
