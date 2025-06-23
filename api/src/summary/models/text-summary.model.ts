import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type TextSummaryDocument = HydratedDocument<TextSummary>;

@Schema({ timestamps: true })
export class TextSummary {
  @Prop({ required: true, type: mongoose.Schema.Types.String })
  text!: string;

  @Prop({ type: String, required: false })
  summary?: string;
}

export const TextSummarySchema = SchemaFactory.createForClass(TextSummary);
