import {
  Avatar,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface Props {
  isLoading: boolean;
  isMobile: boolean;
  name?: string;
  photoUrl?: string;
}

export const AvatarMenu = ({ isLoading, isMobile, name, photoUrl }: Props) => {
  if (isLoading) return;

  const onClick = () => {
    signOut({
      callbackUrl: "/",
    });
  };

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
          <Avatar borderColor="gray.100" src={photoUrl ?? ""} />
        </MenuButton>
        <MenuList>
          <MenuGroup title={name ?? "未ログイン"}>
            <MenuItem as={Link} href="/settings">
              設定
            </MenuItem>
            {isMobile && <MenuItem onClick={onClick}>ログアウト</MenuItem>}
          </MenuGroup>
        </MenuList>
      </Menu>
    </motion.div>
  );
};
