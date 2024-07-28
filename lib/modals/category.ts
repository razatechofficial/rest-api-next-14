import { model, models, Schema } from "mongoose";

const CategorySchema = new Schema(
  {
    title: { type: "string", required: true },
    //^ Creating the relationship with user schema
    user: { type: Schema.Types.ObjectId, ref: "user" },
  },
  {
    timestamps: true,
  }
);

//! Check if Category model already exists; if not, create a new one
const Category = models.Category || model("Category", CategorySchema);

//& Export the Category model for use in other parts of the application
export default Category;
