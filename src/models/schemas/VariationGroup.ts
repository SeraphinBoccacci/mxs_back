import mongoose from "mongoose";

export enum VariationGroupKinds {
  DEFAULT = "DEFAULT",
  CUSTOM = "CUSTOM",
}

export interface VariationGroup {
  title: string;
  _id: string;
  variationsIds: string[];
  kind: VariationGroupKinds;
}

export const VariationGroupSchema = new mongoose.Schema({
  title: { type: String, required: true, default: "Unnamed Group" },
  variationsIds: [{ type: String }],
  kind: { type: String, enum: VariationGroupKinds, required: false },
});
