import connect from "@/lib/db"; // Import the function to connect to the database
import Category from "@/lib/modals/category"; // Import the Category model
import User from "@/lib/modals/user"; // Import the User model
import { Types } from "mongoose"; // Import utility functions from Mongoose
import { NextResponse } from "next/server"; // Import Next.js response utility

// Define the PATCH method handler for updating a category
export const PATCH = async (request: Request, context: { params: any }) => {
  // Extract categoryId from the route parameters
  const categoryId = context.params.category;

  try {
    // Parse the JSON body of the request to get the new title
    const body = await request.json();
    const { title } = body;

    // Extract search parameters from the request URL
    const { searchParams } = new URL(request.url);

    // Get the userId from the search parameters
    const userId = searchParams.get("userId");

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

    // Establish a connection to the database
    await connect();

    // Find the user by userId
    const user = await User.findById(userId);
    // If the user is not found, return a 404 response
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    // Find the category by categoryId and userId to ensure it belongs to the user
    const category = await Category.findOne({ _id: categoryId, user: userId });
    // If the category is not found, return a 404 response
    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: "Category not found" }),
        {
          status: 404,
        }
      );
    }

    // Update the category's title and return the updated document
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { title },
      { new: true }
    );

    // Return a success response with the updated category
    return new NextResponse(
      JSON.stringify({
        message: "Category is updated",
        category: updatedCategory,
      }),
      {
        status: 200,
      }
    );
  } catch (error: any) {
    // If an error occurs, return a 500 response with the error message
    return new NextResponse("Error in updating the category" + error.message, {
      status: 500,
    });
  }
};

export const DELETE = async (request: Request, context: { params: any }) => {
  const categoryId = context.params.category;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid user id" }), {
        status: 400,
      });
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse(
        JSON.stringify({ message: "Invalid category id" }),
        {
          status: 400,
        }
      );
    }

    await connect();
    const user = await User.findById(userId);
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }
    const category = await Category.findOne({ _id: categoryId, user: userId });
    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: "Category not found" }),
        {
          status: 404,
        }
      );
    }
    await Category.findByIdAndDelete(categoryId);
    return new NextResponse(JSON.stringify({ message: "Category deleted" }), {
      status: 200,
    });
  } catch (error: any) {
    return new NextResponse("Error in deleting the category" + error.message, {
      status: 500,
    });
  }
};
