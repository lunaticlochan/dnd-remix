import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Outlet } from "@remix-run/react";
import { useState } from "react";
import { ObjectId } from "mongodb";
import clientPromise from "~/utils/db";

// Define the URL interface
interface URL {
  _id: ObjectId;
  name: string;
  url: string;
}

// Loader function to fetch URLs from MongoDB
export const loader: LoaderFunction = async () => {
  const client = await clientPromise;
  const db = client.db("yourDatabaseName");
  const urls = await db.collection<URL>("links").find({}).toArray();

  // Convert ObjectId to string for easier manipulation on the frontend
  const urlsWithIdString = urls.map((url) => ({
    ...url,
    _id: url._id.toString(),
  }));

  return json(urlsWithIdString);
};

// Main component
export default function Index() {
  const urls = useLoaderData<URL[]>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  // Handle search input focus and blur
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Filter URLs based on search query and minimum character length
  const filteredUrls =
    searchQuery.length >= 3
      ? urls.filter((url) => url.name.toLowerCase().includes(searchQuery))
      : [];

  return (
    <html>
      <head>
        <title>My Page</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css"
        />
      </head>
      <body className="flex flex-col">
        <main className="container mx-auto py-12 flex-grow">
          {/* Center the search bar horizontally with more margin at the top */}
          <div className="flex justify-center mb-6 relative mt-56">
            <input
              type="text"
              className="border border-indigo-300 rounded-full p-2 w-96 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600 transition"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={handleFocus}
              onBlur={() => setTimeout(handleBlur, 200)} // delay blur to allow click on the result
            />

            {/* Display filtered URLs in a dropdown below the search bar */}
            {isFocused &&
              searchQuery.length >= 3 &&
              filteredUrls.length > 0 && (
                <ul className="absolute top-12 w-96 border border-indigo-300 rounded shadow-lg z-10">
                  {filteredUrls.map((url) => (
                    <li key={url._id}>
                      <a
                        href={url.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 hover:bg-gray-200"
                      >
                        {url.name}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
          </div>

          {/* Display a message when there are no results or fewer than 3 characters */}
          <div className="flex justify-center">
            {searchQuery.length < 3 && (
              <p>Type at least 3 characters to start searching</p>
            )}
            {searchQuery.length >= 3 && filteredUrls.length === 0 && (
              <p>No results found</p>
            )}
          </div>

          <Outlet />
        </main>
      </body>
    </html>
  );
}
