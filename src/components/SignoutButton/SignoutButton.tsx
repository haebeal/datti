import { Button } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { signOut } from "next-auth/react";

export const SignoutButton = () => {
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
      <Button colorScheme="red" onClick={onClick}>
        ログアウト
      </Button>
    </motion.div>
  );
};
