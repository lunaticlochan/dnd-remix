import { Form, Link, useActionData, useNavigate } from "@remix-run/react";
import { useEffect } from "react";
import { useUser } from "~/context/UserContext";
import clientPromise from "~/utils/db";
import { ActionFunction } from "@remix-run/node";
import bcrypt from 'bcryptjs';


type ActionData = {
  error?: string;
  name?: string;
};

// Action function to handle form submission
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const client = await clientPromise;
    const db = client.db("yourDatabaseName");
    const collection = db.collection("users");

    const user = await collection.findOne({ email });

    if (!user) {
      return { error: "No user found with this email" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { error: "Invalid password" };
    }

    // Instead of setting localStorage in the action, return the user's name
    return { name: user.name };

  } catch (error) {
    console.error(error);
    return { error: "Failed to login" };
  }
};




export default function Login() {
  const actionData = useActionData<ActionData>();
  const navigate = useNavigate();
  const { username, setUsername } = useUser();

  useEffect(() => {
    // Redirect if the user is already logged in
    if (username) {
      navigate("/"); // Redirect to the homepage or any other page
    }
  }, [username, navigate]);

  useEffect(() => {
    if (actionData?.name) {
      setUsername(actionData.name); // Update the context
      localStorage.setItem("uname", actionData.name); // Store in localStorage
      navigate("/"); // Redirect to home page after successful login
    }
  }, [actionData, setUsername, navigate]);

  return (
    <div className="bg-gray-100 flex bg-white flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 max-w">
          Or
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            create an account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {actionData?.error && <p className="text-red-500">{actionData.error}</p>}
          <Form method="post" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember_me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
