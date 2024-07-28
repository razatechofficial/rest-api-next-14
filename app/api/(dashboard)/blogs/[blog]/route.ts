import connect from "@/lib/db"; // Import the function to connect to the database
import Blog from "@/lib/modals/blog"; // Import the Blog model
import Category from "@/lib/modals/category"; // Import the Category model
import User from "@/lib/modals/user"; // Import the User model
import { Types } from "mongoose"; // Import utility functions from Mongoose
import { NextResponse } from "next/server"; // Import Next.js response utility

//! Handler for GET requests to fetch a single blog by ID
export const GET = async (request: Request, context: { params: any }) => {
  const blogId = context.params.blog; // Get the blog ID from the request context

  try {
    // Extract search parameters from the request URL
    const { searchParams } = new URL(request.url);

    // Get the userId and categoryId from the search parameters
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");

    // Validate the userId - it should be present and a valid ObjectId
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid user id" }), {
        status: 400,
      });
    }

    // Validate the categoryId - it should be present and a valid ObjectId
    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid category id" }),
        {
          status: 400,
        }
      );
    }

    // Validate the blogId - it should be present and a valid ObjectId
    if (!blogId || !Types.ObjectId.isValid(blogId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid blog id" }), {
        status: 400,
      });
    }

    // Establish a connection to the database
    await connect();

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // Find the category by categoryId
    const category = await Category.findById(categoryId);
    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: "Category not found" }),
        {
          status: 404,
        }
      );
    }

    // Find the blog by blogId, userId, and categoryId
    const blog = await Blog.findOne({
      _id: blogId,
      user: userId,
      category: categoryId,
    });
    if (!blog) {
      return new NextResponse(JSON.stringify({ message: "Blog not found" }), {
        status: 404,
      });
    }

    // Return the blog in the response
    return new NextResponse(JSON.stringify({ blog }), { status: 200 });
  } catch (error: any) {
    // Return an error response if something goes wrong
    return new Response("Error in fetching the specific blog" + error.message, {
      status: 500,
    });
  }
};

//! Handler for PATCH requests to update a single blog by ID
export const PATCH = async (request: Request, context: { params: any }) => {
  const blogId = context.params.blog; // Get the blog ID from the request context

  try {
    // Parse the JSON body of the request to get the title and description
    const body = await request.json();
    const { title, description } = body;

    // Extract search parameters from the request URL
    const { searchParams } = new URL(request.url);

    // Get the userId from the search parameters
    const userId = searchParams.get("userId");

    // Validate the userId - it should be present and a valid ObjectId
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid User ID" }), {
        status: 400,
      });
    }

    // Validate the blogId - it should be present and a valid ObjectId
    if (!blogId || !Types.ObjectId.isValid(blogId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid Blog ID" }), {
        status: 400,
      });
    }

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // Find the blog by blogId and userId
    const blog = await Blog.findOne({
      _id: blogId,
      user: userId,
    });
    if (!blog) {
      return new NextResponse(JSON.stringify({ message: "Blog not found" }), {
        status: 404,
      });
    }

    // Update the blog with the new title and description
    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { title, description },
      { new: true }
    );

    // Return the updated blog in the response
    return new NextResponse(
      JSON.stringify({ message: "Blog updated", blog: updatedBlog }),
      { status: 200 }
    );
  } catch (error: any) {
    // Return an error response if something goes wrong
    return new Response("Error in updating the blog" + error.message, {
      status: 500,
    });
  }
};

//! Handler for DELETE requests to delete a single blog by ID
export const DELETE = async (request: Request, context: { params: any }) => {
  const blogId = context.params.blog; // Get the blog ID from the request context

  try {
    // Extract search parameters from the request URL
    const { searchParams } = new URL(request.url);

    // Get the userId from the search parameters
    const userId = searchParams.get("userId");

    // Validate the userId - it should be present and a valid ObjectId
    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid User ID" }), {
        status: 400,
      });
    }

    // Validate the blogId - it should be present and a valid ObjectId
    if (!blogId || !Types.ObjectId.isValid(blogId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid Blog ID" }), {
        status: 400,
      });
    }

    // Find the user by userId
    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // Find the blog by blogId and userId
    const blog = await Blog.findOne({
      _id: blogId,
      user: userId,
    });
    if (!blog) {
      return new NextResponse(JSON.stringify({ message: "Blog not found" }), {
        status: 404,
      });
    }

    // Delete the blog by blogId
    await Blog.findByIdAndDelete(blogId);

    // Return a success response
    return new NextResponse(JSON.stringify({ message: "Blog deleted" }), {
      status: 200,
    });
  } catch (error: any) {
    // Return an error response if something goes wrong
    return new Response("Error in deleting the blog" + error.message, {
      status: 500,
    });
  }
};
