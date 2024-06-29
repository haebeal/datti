import { defer } from "@remix-run/cloudflare";
import { createRemixStub } from "@remix-run/testing";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { User } from "~/api/@types";
import { Header } from "~/components/Header";

const profileMock = {
  userId: "0001",
  status: "me",
  name: "テストユーザー",
  email: "test@example.com",
  photoUrl: "https://i.pravatar.cc/300",
} satisfies User;

const setup = async (profile?: User, initialPath?: string) => {
  const user = userEvent.setup();

  const RemixSub = createRemixStub([
    {
      path: "/",
      Component: () => (
        <>
          <p data-testid="pathname">/</p>
          <Header />
        </>
      ),
      loader: () =>
        profile
          ? defer({
              profile,
            })
          : new Promise(() => {}),
    },
    {
      path: "/groups",
      Component: () => (
        <>
          <p data-testid="pathname">/groups</p>
          <Header />
        </>
      ),
      loader: () =>
        profile
          ? defer({
              profile,
            })
          : new Promise(() => {}),
    },
    {
      path: "/setting",
      Component: () => <p data-testid="pathname">/setting</p>,
    },
    {
      path: "/friends",
      Component: () => <p data-testid="pathname">/friends</p>,
    },
    {
      path: "/api/auth/signout",
      action() {
        return new Response(undefined, { status: 200 });
      },
      Component: () => <p data-testid="pathname">/api/auth/signout</p>,
    },
  ]);

  render(<RemixSub initialEntries={[initialPath ? initialPath : "/"]} />);
  await screen.findByText("Datti");

  const clickLink = (name: string) =>
    user.click(
      screen.getByRole("link", {
        name,
      })
    );

  const clickMenuItem = (name: string) =>
    user.click(
      screen.getByRole("menuitem", {
        name,
      })
    );

  const clickAvatar = () =>
    user.click(
      screen.getByRole("img", {
        name: "avatar menu",
      })
    );

  return { clickLink, clickMenuItem, clickAvatar };
};

describe("Headerコンポーネントのテスト", () => {
  it("ホームへのリンクが表示される", async () => {
    /* Arrange */
    await setup(profileMock);

    /* Assert */
    await waitFor(() => {
      expect(
        screen.getByRole("link", {
          name: "ホーム",
        })
      ).toBeInTheDocument();
    });
  });

  it("ホームへのリンク押下時に遷移される", async () => {
    /* Arrange */
    const { clickLink } = await setup(profileMock, "/groups");

    /* Act */
    await clickLink("ホーム");

    /* Assert */
    expect(screen.getByTestId("pathname").textContent).toBe("/");
  });

  it("グループ一覧へのリンクが表示される", async () => {
    /* Arrange */
    await setup(profileMock, "/groups");

    /* Assert */
    await waitFor(() => {
      expect(
        screen.getByRole("link", {
          name: "グループ",
        })
      ).toBeInTheDocument();
    });
  });

  it("グループ一覧へのリンク押下時に遷移される", async () => {
    /* Arrange */
    const { clickLink } = await setup(profileMock, "/");

    /* Act */
    await clickLink("グループ");

    /* Assert */
    expect(screen.getByTestId("pathname").textContent).toBe("/groups");
  });

  it("アバターが表示される", async () => {
    /* Arrange */
    await setup(profileMock);

    /* Assert */
    expect(
      screen.getByRole("img", {
        name: "avatar menu",
      })
    ).toBeInTheDocument();
  });

  it("アバター押下時にドロップダウンメニューが表示される", async () => {
    /* Arrange */
    const { clickAvatar } = await setup(profileMock);

    /* Act */
    await clickAvatar();

    /* Assert */
    expect(
      screen.getByRole("menu", {
        name: "avatar menu",
      })
    ).toBeInTheDocument();
  });

  it("設定ボタン押下時に設定ページに遷移される", async () => {
    /* Arrange */
    const { clickMenuItem, clickAvatar } = await setup(profileMock, "/");

    /* Act */
    await clickAvatar();
    await clickMenuItem("設定");

    /* Assert */
    expect(screen.getByTestId("pathname").textContent).toBe("/setting");
  });

  it("フレンドボタン押下時に設定ページに遷移される", async () => {
    /* Arrange */
    const { clickMenuItem, clickAvatar } = await setup(profileMock, "/");

    /* Act */
    await clickAvatar();
    await clickMenuItem("フレンド");

    /* Assert */
    expect(screen.getByTestId("pathname").textContent).toBe("/friends");
  });

  it("ログアウトボタン押下時にログアウトされる", async () => {
    /* Arrange */
    const { clickMenuItem, clickAvatar } = await setup(profileMock, "/");

    /* Act */
    await clickAvatar();
    await clickMenuItem("ログアウト");

    /* Assert */
    expect(screen.getByTestId("pathname").textContent).toBe(
      "/api/auth/signout"
    );
  });
});
