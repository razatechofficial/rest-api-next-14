import connect from "@/lib/db";
import User from "@/lib/modals/user";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
    await connect();
    const users = await User.find();
    return new NextResponse(JSON.stringify(users), { status: 200 });
  } catch (error: any) {
    return new NextResponse("Error in fetching users" + error.message, {
      status: 500,
    });
  }
};

export const POST = async (request: Request) => {
  try {
    // receiving the data and parsing into json
    const body = await request.json();
    // Connect to the database
    await connect();

    // Creating a new instanse to create a new user
    const newUser = new User(body);
    await newUser.save();

    return new NextResponse(
      JSON.stringify({ message: "User is created", user: newUser }),
      { status: 200 }
    );
  } catch (error: any) {
    return new NextResponse("Error in creating user" + error.message, {
      status: 500,
    });
  }
};

// Validating the Auto generated User_ID
const ObjectId = require("mongoose").Types.ObjectId;
export const PATCH = async (request: Request) => {
  try {
    // receiving the data and parsing into json
    const body = await request.json();
    const { userId, newUsername } = body;
    // Connect to the database
    await connect();

    // Checking the ID or Username is provided or not
    if (!userId || !newUsername) {
      return new NextResponse(
        JSON.stringify({
          message: "ID or username not found",
        }),
        {
          status: 400,
        }
      );
    }

    // Type checking the user_id
    if (!Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid User ID" }), {
        status: 400,
      });
    }

    // Find the user and update one
    const updatedUser = await User.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { username: newUsername },
      // Return the updated user rather than the old user
      { new: true }
    );

    // Return the message if user is not found in the database or some other kind of error
    if (!updatedUser) {
      return new NextResponse(
        JSON.stringify({ message: "User not found in database" }),
        {
          status: 400,
        }
      );
    }

    return new NextResponse(
      JSON.stringify({ message: "User is updated", user: updatedUser }),
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return new NextResponse("Error in updating user" + error.message, {
      status: 500,
    });
  }
};

export const DELETE = async (request: Request) => {
  try {
    // Get the user ID from the request
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return new NextResponse(JSON.stringify({ message: "ID not found" }), {
        status: 400,
      });
    }

    // Type checking the user_id
    if (!Types.ObjectId.isValid(userId)) {
      return new NextResponse(JSON.stringify({ message: "Invalid User ID" }), {
        status: 400,
      });
    }

    await connect();
    // Delete the user
    const deleteUser = await User.findByIdAndDelete(new Types.ObjectId(userId));

    if (!deleteUser) {
      return new NextResponse(
        JSON.stringify({ message: "User not found in database" }),
        {
          status: 400,
        }
      );
    }
    // Return a response with the deleted user
    return new NextResponse(
      JSON.stringify({ message: "User is deleted", user: deleteUser }),
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return new NextResponse("Error in deleting user" + error.message, {
      status: 500,
    });
  }
};
