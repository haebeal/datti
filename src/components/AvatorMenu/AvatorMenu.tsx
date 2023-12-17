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
  name?: string;
  photoUrl?: string;
}

export const AvatorMenu = ({ isLoading, name, photoUrl }: Props) => {
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
          <Avatar borderWidth={1} borderColor="gray.100" src={photoUrl ?? ""} />
        </MenuButton>
        <MenuList>
          <MenuGroup title={name ?? "未ログイン"}>
            <MenuItem as={Link} href="/profile">
              プロフィール
            </MenuItem>
          </MenuGroup>
        </MenuList>
      </Menu>
    </motion.div>
  );
};
