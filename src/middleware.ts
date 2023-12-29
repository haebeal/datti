export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/((?!signin|401|api).+)"],
};
