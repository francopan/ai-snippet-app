import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TextSummary, TextSummaryDocument } from '../models/text-summary.model';
import { TextSummaryDto } from '../dtos/text-summary.dto';

@Injectable()
export class TextSummaryRepository {
  constructor(
    @InjectModel(TextSummary.name)
    private readonly textSummaryModel: Model<TextSummaryDocument>,
  ) {}

  public async getAll(): Promise<TextSummaryDto[]> {
    const docs = await this.textSummaryModel.find().lean();
    return docs.map(doc => this.mapDocumentToInterface(doc));
  }

  public async getById(id: string): Promise<TextSummaryDto | null> {
    const doc = await this.textSummaryModel.findById(id).lean();
    if (!doc) return null;
    return this.mapDocumentToInterface(doc);
  }

  public async getPaginatedWithCount(
    page: number,
    limit: number,
  ): Promise<{ items: TextSummaryDto[]; total: number }> {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.textSummaryModel.find().skip(skip).limit(limit).lean(),
      this.textSummaryModel.countDocuments(),
    ]);

    return {
      items: items.map(doc => this.mapDocumentToInterface(doc)),
      total,
    };
  }

  public async create(
    text: string,
    summary?: string | null,
  ): Promise<TextSummaryDto> {
    const created = new this.textSummaryModel({ text, summary });
    const saved = await created.save();
    return this.mapDocumentToInterface(saved.toObject());
  }

  public async update(
    id: string,
    updates: Partial<TextSummaryDto>,
  ): Promise<TextSummaryDto | null> {
    const updatedDoc = await this.textSummaryModel.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        lean: true,
      },
    );
    if (!updatedDoc) {
      return null;
    }
    return this.mapDocumentToInterface(updatedDoc);
  }

  public async delete(id: string): Promise<TextSummaryDto | null> {
    const deletedDoc = await this.textSummaryModel.findByIdAndDelete(id).lean();
    if (!deletedDoc) return null;
    return this.mapDocumentToInterface(deletedDoc);
  }

  private mapDocumentToInterface(
    doc: TextSummary & { _id: any },
  ): TextSummaryDto {
    return {
      id: doc._id.toString(),
      text: doc.text,
      summary: doc.summary ?? null,
    };
  }
}
