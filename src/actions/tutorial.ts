import TutorialModel from "@/schemas/tutorial";

export const getItems = async ({}, user) => {
  const tutorials = await TutorialModel.find({
    roles: user.rol.name,
  });

  return tutorials.map((t) => ({ ...t.toObject(), _id: t._id.toString() }));
};
