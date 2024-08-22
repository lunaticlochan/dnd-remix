import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";

import type { LinksFunction } from "@remix-run/node";
import stylesheet from "~/tailwind.css?url";
import Header from "./routes/components/Header";
import Footer from "./routes/components/Footer";
import { UserProvider } from "./context/UserContext";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="flex flex-col min-h-screen">
        <UserProvider>
          <Header />

          <main className="flex-grow">
            {children}
          </main>

          <Footer />

          <ScrollRestoration />
          <Scripts />
        </UserProvider>
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
