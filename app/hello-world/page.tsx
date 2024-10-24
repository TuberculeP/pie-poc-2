"use client";

import useUserHook from "@/hooks/userHook";
import { useEffect } from "react";

export default function HelloWorld() {
  const { user, fetchUserData } = useUserHook();
  useEffect(() => {
    fetchUserData();
  }, []);
  if (user) {
    return (
      <div>
        Hello, {user.first_name} {user.last_name}!
      </div>
    );
  }
  return <div>Hello, World!</div>;
}
