import NextAuth from "next-auth/next";

import { authOptions } from "@/utils/authOptions";

export default NextAuth(authOptions);
