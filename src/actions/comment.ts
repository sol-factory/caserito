import { toObjectId } from "@/helpers/mdb";
import { CommentModel } from "@/schemas/sale";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export const upsert = async ({ data }, user) => {
  const newComment = new CommentModel({
    ...data,
    creator: user,
    date: new Date(),
  });

  await mongoose.model(data.model).findByIdAndUpdate(data.model_id, {
    $addToSet: { comments: newComment },
  });

  revalidatePath("/");

  return {
    ok: true,
    message: "Comentario agregado",
  };
};

export const getComments = async ({ filterId, model }) => {
  if (!filterId) {
    return [];
  }
  const [entity] = await mongoose.model(model).aggregate([
    { $match: { _id: toObjectId(filterId) } },
    {
      $project: {
        comments: {
          $map: {
            input: "$comments",
            as: "comment",
            in: {
              _id: { $toString: "$$comment._id" },
              text: "$$comment.text",
              creator: {
                _id: {
                  $toString: "$$comment.creator._id",
                },
                firstname: "$$comment.creator.firstname",
                lastname: "$$comment.creator.lastname",
                email: "$$comment.creator.email",
              },
              date: "$$comment.date",
              createdAt: "$$comment.createdAt",
            },
          },
        },
      },
    },
  ]);

  return { ok: true, data: entity.comments || [] };
};
