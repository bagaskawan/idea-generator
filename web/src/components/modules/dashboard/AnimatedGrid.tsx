"use client";

import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export const AnimatedGrid = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    variants={containerVariants}
    initial="hidden"
    animate="show"
  >
    {children}
  </motion.div>
);

export const AnimatedGridItem = ({
  children,
}: {
  children: React.ReactNode;
}) => <motion.div variants={itemVariants}>{children}</motion.div>;
