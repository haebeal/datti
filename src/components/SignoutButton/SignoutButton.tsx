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
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: [0, 0.71, 0.2, 1.01],
        scale: {
          type: "spring",
          damping: 5,
          stiffness: 100,
          restDelta: 0.001,
        },
      }}
    >
      <Button colorScheme="red" onClick={onClick}>
        ログアウト
      </Button>
    </motion.div>
  );
};
