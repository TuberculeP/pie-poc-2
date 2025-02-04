"use client";

import useFooBarHook from "@/hooks/fooBarHook";
import { useEffect } from "react";

export default function Home() {
  const { fooBarData, fetchData } = useFooBarHook();

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h1>Test</h1>
      <pre>{JSON.stringify(fooBarData, null, 2)}</pre>
    </div>
  );
}
