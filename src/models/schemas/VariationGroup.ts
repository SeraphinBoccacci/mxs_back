import mongoose from "mongoose";

import { VariationGroupKinds } from "../../types/overlays";

export const VariationGroupSchema = new mongoose.Schema({
  title: { type: String, required: true, default: "Unnamed Group" },
  variationsIds: [{ type: String }],
  kind: { type: String, enum: VariationGroupKinds, required: false },
});
