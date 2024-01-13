import { Profile } from "@/features/profile";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Avatar,
  Menu,
  MenuButton,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
  isLoading: boolean;
  isMobile: boolean;
  profile?: Profile;
}

export const AvatarMenu = ({ isLoading, isMobile, profile }: Props) => {
  const { logout } = useAuth0();

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
              <MenuItem onClick={() => logout()}>ログアウト</MenuItem>
            )}
          </MenuGroup>
        </MenuList>
      </Menu>
    </motion.div>
  );
};
