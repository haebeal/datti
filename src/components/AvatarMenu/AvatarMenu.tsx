import {
  Avatar,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { User } from "firebase/auth";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  isLoading: boolean;
  isMobile: boolean;
  user?: User;
  signOut: () => Promise<void>;
}

export const AvatarMenu = ({ isLoading, isMobile, user, signOut }: Props) => {
  if (isLoading) return;

  return (
    <motion.div
      variants={{
        offscreen: {
          opacity: 0,
        },
        onscreen: {
          opacity: 1,
          transition: {
            duration: 0.5,
          },
        },
      }}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: false, amount: 0 }}
    >
      <Menu>
        <MenuButton>
          <Avatar borderColor="gray.100" src={user?.photoURL ?? ""} />
        </MenuButton>
        <MenuList>
          <MenuGroup title={user?.displayName ?? "未ログイン"}>
            <MenuItem as={Link} href="/setting">
              設定
            </MenuItem>
            {isMobile && <MenuItem onClick={signOut}>ログアウト</MenuItem>}
          </MenuGroup>
        </MenuList>
      </Menu>
    </motion.div>
  );
};
