import {
  Link,
  Outlet,
  Form,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { json, ActionFunction } from "@remix-run/node";
import { ObjectId } from "mongodb";
import clientPromise from "~/utils/db";
import { useUser } from "~/context/UserContext";
import { useState } from "react";

interface URL {
  _id: ObjectId;
  name: string;
  url: string;
  username: string;
}

export const loader = async () => {
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

export const action: ActionFunction = async ({ request }) => {
  const client = await clientPromise;
  const db = client.db("yourDatabaseName");
  const collection = db.collection<URL>("links");

  const formData = await request.formData();
  const method = request.method.toUpperCase();

  switch (method) {
    case "POST": {
      const url = formData.get("url")?.toString();
      const name = formData.get("name")?.toString();
      const username = formData.get("username")?.toString();

      if (!url || !name || !username) {
        return json(
          { error: "URL, name, and username are required" },
          { status: 400 }
        );
      }

      await collection.insertOne({
        url,
        name,
        username,
        _id: new ObjectId(),
      });
      return json({ message: "Added successfully" });
    }

    case "PUT": {
      const id = formData.get("id")?.toString();
      const url = formData.get("url")?.toString();
      const name = formData.get("name")?.toString();
      const username = formData.get("username")?.toString();

      if (!id || !url || !name || !username) {
        return json(
          { error: "ID, URL, name, and username are required" },
          { status: 400 }
        );
      }

      await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { url, name, username } }
      );
      return json({ message: "Updated successfully" });
    }

    case "DELETE": {
      const id = formData.get("id")?.toString();

      if (!id) {
        return json({ error: "ID is required" }, { status: 400 });
      }

      await collection.deleteOne({ _id: new ObjectId(id) });
      return json({ message: "Deleted successfully" });
    }

    default:
      return json({ error: "Invalid method" }, { status: 405 });
  }
};

export default function Manage() {
  const { username } = useUser();
  const urls = useLoaderData<URL[]>();
  const [editId, setEditId] = useState<string | null>(null);
  const navigation = useNavigation();

  // Check if the current navigation state indicates a form submission
  const isSubmitting = navigation.state === "submitting";

  if (!username) {
    return (
      <div className="container mx-auto py-12">
        <p className="text-center text-lg">
          You must be logged in to access this page.
        </p>
        <Link to="/login" className="text-blue-500">
          Login
        </Link>
      </div>
    );
  }

  // Filter URLs to only show those belonging to the logged-in user
  const userUrls = urls.filter((url) => url.username === username);

  // Handle form submission completion
  const handleFormSubmit = () => {
    if (!isSubmitting) {
      setEditId(null); // Exit edit mode when the form is not submitting
    }
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold text-center mb-6">Manage Your URLs</h1>

      <Form method="post" className="mb-6">
        <input type="hidden" name="username" value={username} />
        <div className="mb-4">
          <label className="block text-lg">
            Name:
            <input
              type="text"
              name="name"
              required
              className="mt-1 p-2 border border-gray-300 rounded"
            />
          </label>
        </div>
        <div className="mb-4">
          <label className="block text-lg">
            URL:
            <input
              type="url"
              name="url"
              required
              className="mt-1 p-2 border border-gray-300 rounded"
            />
          </label>
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Add URL
        </button>
      </Form>

      {userUrls.map((url) => (
        <div
          key={url._id.toString()}
          className="mb-4 p-4 border border-gray-300 rounded"
        >
          <div className="mb-2">
            <strong>Name:</strong> {url.name}
          </div>
          <div className="mb-2">
            <strong>URL:</strong> {url.url}
          </div>
          <div className="mb-2">
            <strong>Username:</strong> {url.username}
          </div>

          <button
            onClick={() => setEditId(url._id.toString())}
            className="mr-4 text-blue-500"
          >
            Edit
          </button>

          <Form method="delete" className="inline">
            <input type="hidden" name="id" value={url._id.toString()} />
            <button type="submit" className="text-red-500">
              Delete
            </button>
          </Form>

          {editId === url._id.toString() && (
            <Form method="put" className="mt-4" onSubmit={handleFormSubmit}>
              <input type="hidden" name="id" value={url._id.toString()} />
              <input type="hidden" name="username" value={username} />
              <div className="mb-4">
                <label className="block text-lg">
                  Name:
                  <input
                    type="text"
                    name="name"
                    defaultValue={url.name}
                    required
                    className="mt-1 p-2 border border-gray-300 rounded"
                  />
                </label>
              </div>
              <div className="mb-4">
                <label className="block text-lg">
                  URL:
                  <input
                    type="url"
                    name="url"
                    defaultValue={url.url}
                    required
                    className="mt-1 p-2 border border-gray-300 rounded"
                  />
                </label>
              </div>
              <button
                type="submit"
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditId(null)}
                className="ml-4 px-4 py-2 bg-gray-300 text-black rounded"
              >
                Cancel
              </button>
            </Form>
          )}
        </div>
      ))}

      <Outlet />
    </div>
  );
}
