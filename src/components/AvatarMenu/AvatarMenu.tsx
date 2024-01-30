import { Profile } from "@/features/profile";
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
  profile?: Profile;
}

export const AvatarMenu = ({ isLoading, isMobile, profile }: Props) => {
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
          <Avatar borderColor="gray.100" src={profile?.picture ?? ""} />
        </MenuButton>
        <MenuList>
          <MenuGroup title={profile?.name ?? "未ログイン"}>
            <MenuItem as={Link} href="/setting">
              設定
            </MenuItem>
            {isMobile && (
              <MenuItem onClick={() => signOut()}>ログアウト</MenuItem>
            )}
          </MenuGroup>
        </MenuList>
      </Menu>
    </motion.div>
  );
};
