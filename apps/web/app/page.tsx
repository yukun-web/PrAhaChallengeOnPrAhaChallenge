"use client";

import { sayHello } from "@ponp/sample";
import { useEffect } from "react";

export default function HomePage() {
  useEffect(() => {
    sayHello();
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Welcome to Ponp Web</h1>
      <p>Open the browser console to see sayHello output.</p>
    </main>
  );
}
