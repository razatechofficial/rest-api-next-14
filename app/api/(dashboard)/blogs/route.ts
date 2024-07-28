import connect from "@/lib/db"; // Import the function to connect to the database
import Blog from "@/lib/modals/blog"; // Import the Blog model
import Category from "@/lib/modals/category"; // Import the Category model
import User from "@/lib/modals/user"; // Import the User model
import { Types } from "mongoose"; // Import utility functions from Mongoose
import { NextResponse } from "next/server"; // Import Next.js response utility

//! Handler for GET requests
export const GET = async (request: Request) => {
  try {
    //^ Extract search parameters from the request URL (in search bar)
    const { searchParams } = new URL(request.url);

    // Get the userId and categoryId from the search parameters
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");

    //& Getting the Search Keyword / Date Range / Pagination / Per Page limit from URL
    const searchKeywords = searchParams.get("keywords") as string;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const page: any = parseInt(searchParams.get("page") || "1");
    const limit: any = parseInt(searchParams.get("limit") || "10");

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

    // Create a filter for fetching blogs that belong to the user and category
    const filter: any = {
      user: new Types.ObjectId(userId),
      category: new Types.ObjectId(categoryId),
    };

    //^ Perform Searching in the Blogs
    if (searchKeywords) {
      // The $or means that the search keywork should exist either in title or description

      // $options:"i" means that this should return the response either the keyword is in lower or upper case

      filter.$or = [
        {
          title: { $regex: searchKeywords, $options: "i" },
        },
        {
          description: { $regex: searchKeywords, $options: "i" },
        },
      ];
    }

    //& Filtering the Blog by Date Range
    if (startDate && endDate) {
      // The $gte means that the date should be greater than or equal to the startDate
      // The $lte means that the date should be less than or equal to the endDate
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      filter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.createdAt = { $lte: new Date(endDate) };
    }

    //~ skip is the builtin function provided by mongoose thats control the pagination, it controls the no of items or items range to skip e.g.Page 1: hide items: 1-10,Page 2: show items: 11-20

    /**
     * Example formula: Page 3
     * 3-1 = 2
     * 2*10 (10 is limit) = 20
     * skip 1st 20 blog and start returning the blog from 21 to 30
     */
    const skip = (page - 1) * limit;
    // Find blogs that match the filter
    const blogs = await Blog.find(filter)
      .sort({ createdAt: "asc" })
      .skip(skip)
      .limit(limit);

    // Return the blogs in the response
    return new NextResponse(JSON.stringify(blogs), {
      status: 200,
    });
  } catch (error: any) {
    // Return an error response if something goes wrong
    return new NextResponse(
      JSON.stringify({ message: "Error fetching blogs" }),
      {
        status: 500,
      }
    );
  }
};

//! Handler for POST requests
export const POST = async (request: Request) => {
  try {
    // Extract search parameters from the request URL
    const { searchParams } = new URL(request.url);

    // Get the userId and categoryId from the search parameters
    const userId = searchParams.get("userId");
    const categoryId = searchParams.get("categoryId");

    // Parse the JSON body of the request to get the title and description
    const body = await request.json();
    const { title, description } = body;

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

    // Create a new blog with the title, description, userId, and categoryId
    const newBlog = new Blog({
      title,
      description,
      user: new Types.ObjectId(userId),
      category: new Types.ObjectId(categoryId),
    });

    // Save the new blog to the database
    await newBlog.save();

    // Return a success response
    return new NextResponse(
      JSON.stringify({ message: "Blog created successfully" }),
      {
        status: 200,
      }
    );
  } catch (error: any) {
    // Return an error response if something goes wrong
    return new NextResponse(
      JSON.stringify({ message: "Error creating blog" }),
      {
        status: 500,
      }
    );
  }
};
