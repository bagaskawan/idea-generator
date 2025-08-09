"use client";

import useUser from "@/hooks/useUser";
import FullScreenLoading from "@/components/FullScreenLoading";
import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading: userLoading } = useUser();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  if (userLoading) {
    return (
      <AnimatePresence>
        <FullScreenLoading text="Loading..." />
      </AnimatePresence>
    );
  }

  return <>{children}</>;
}
