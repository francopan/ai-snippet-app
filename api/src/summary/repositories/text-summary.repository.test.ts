import { getModelToken } from '@nestjs/mongoose';
import { TextSummaryRepository } from './text-summary.repository';
import { Test } from '@nestjs/testing';

describe('TextSummaryRepository', () => {
  let service: TextSummaryRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TextSummaryRepository,
        {
          provide: getModelToken('TextSummary'),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<TextSummaryRepository>(TextSummaryRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

// import { Test, TestingModule } from '@nestjs/testing';
// import { getModelToken } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import { TextSummaryRepository } from './text-summary.repository';
// import { TextSummary, TextSummaryDocument } from '../models/text-summary.model';

// describe('TextSummaryRepository', () => {
//   let repository: TextSummaryRepository;
//   let model: jest.Mocked<Model<TextSummaryDocument>>;

//   beforeEach(async () => {
//     const modelMock = {
//       find: jest.fn(),
//       findById: jest.fn(),
//       countDocuments: jest.fn(),
//       findByIdAndUpdate: jest.fn(),
//       findByIdAndDelete: jest.fn(),
//     };

//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         TextSummaryRepository,
//         {
//           provide: getModelToken(TextSummary.name),
//           useValue: jest.fn().mockImplementation(() => ({
//             save: jest.fn(),
//           })),
//         },
//       ],
//     }).overrideProvider(getModelToken(TextSummary.name)).useValue(modelMock).compile();

//     repository = module.get<TextSummaryRepository>(TextSummaryRepository);
//     model = module.get<Model<TextSummaryDocument>>(getModelToken(TextSummary.name)) as jest.Mocked<Model<TextSummaryDocument>>;
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   it('should return all snippets', async () => {
//     const mockDocs = [
//       { _id: '1', text: 'code 1', summary: 'summary 1' },
//     ];

//     model.find.mockReturnValue({
//       lean: jest.fn().mockResolvedValue(mockDocs),
//     } as any);

//     const result = await repository.getAll();

//     expect(model.find).toHaveBeenCalled();
//     expect(result).toEqual([
//       { id: '1', text: 'code 1', summary: 'summary 1' },
//     ]);
//   });

//   it('should return a snippet by ID', async () => {
//     const mockDoc = { _id: '123', text: 'code', summary: 'summary' };

//     model.findById.mockReturnValue({
//       lean: jest.fn().mockResolvedValue(mockDoc),
//     } as any);

//     const result = await repository.getById('123');

//     expect(model.findById).toHaveBeenCalledWith('123');
//     expect(result).toEqual({ id: '123', text: 'code', summary: 'summary' });
//   });

//   it('should return null if snippet not found', async () => {
//     model.findById.mockReturnValue({
//       lean: jest.fn().mockResolvedValue(null),
//     } as any);

//     const result = await repository.getById('notfound');

//     expect(result).toBeNull();
//   });

//   it('should return paginated snippets with total count', async () => {
//     const mockDocs = [
//       { _id: '1', text: 'code 1', summary: 'summary 1' },
//       { _id: '2', text: 'code 2', summary: 'summary 2' },
//     ];

//     const skipMock = jest.fn().mockReturnValue({
//       limit: jest.fn().mockReturnValue({
//         lean: jest.fn().mockResolvedValue(mockDocs),
//       }),
//     });

//     model.find.mockReturnValue({ skip: skipMock } as any);
//     model.countDocuments.mockResolvedValue(10);

//     const result = await repository.getPaginatedWithCount(2, 2); // page 2, limit 2

//     expect(model.find).toHaveBeenCalled();
//     expect(skipMock).toHaveBeenCalledWith(2);
//     expect(result).toEqual({
//       items: [
//         { id: '1', text: 'code 1', summary: 'summary 1' },
//         { id: '2', text: 'code 2', summary: 'summary 2' },
//       ],
//       total: 10,
//     });
//   });

//   it('should create and return a snippet', async () => {
//     const saveMock = jest.fn().mockResolvedValue({
//       _id: 'abc',
//       text: 'new code',
//       summary: null,
//       toObject: () => ({
//         _id: 'abc',
//         text: 'new code',
//         summary: null,
//       }),
//     });

//     // Override the model constructor to return an object with save method
//     (model as any).mockImplementation = jest.fn(() => ({
//       save: saveMock,
//     }));

//     // Alternatively, directly replace the model with a callable mock for create:
//     const modelConstructorMock = jest.fn().mockImplementation(() => ({
//       save: saveMock,
//     }));

//     // Replace the injected model with our constructor mock
//     (repository as any).textSummaryModel = modelConstructorMock;

//     const result = await repository.create('new code', null);

//     expect(saveMock).toHaveBeenCalled();
//     expect(result).toEqual({
//       id: 'abc',
//       text: 'new code',
//       summary: null,
//     });
//   });

//   it('should update a snippet and return updated doc', async () => {
//     const updatedDoc = {
//       _id: '123',
//       text: 'updated text',
//       summary: 'updated summary',
//     };

//     model.findByIdAndUpdate.mockReturnValue({
//       lean: jest.fn().mockResolvedValue(updatedDoc),
//     } as any);

//     const result = await repository.update('123', { text: 'updated text', summary: 'updated summary' });

//     expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
//       '123',
//       { text: 'updated text', summary: 'updated summary' },
//       { new: true, lean: true },
//     );

//     expect(result).toEqual({
//       id: '123',
//       text: 'updated text',
//       summary: 'updated summary',
//     });
//   });

//   it('should return null when updating non-existing snippet', async () => {
//     model.findByIdAndUpdate.mockReturnValue({
//       lean: jest.fn().mockResolvedValue(null),
//     } as any);

//     const result = await repository.update('nonexistent', { text: 'x' });

//     expect(result).toBeNull();
//   });

//   it('should delete and return deleted snippet', async () => {
//     const deletedDoc = {
//       _id: '123',
//       text: 'deleted code',
//       summary: 'deleted summary',
//     };

//     model.findByIdAndDelete.mockReturnValue({
//       lean: jest.fn().mockResolvedValue(deletedDoc),
//     } as any);

//     const result = await repository.delete('123');

//     expect(model.findByIdAndDelete).toHaveBeenCalledWith('123');
//     expect(result).toEqual({
//       id: '123',
//       text: 'deleted code',
//       summary: 'deleted summary',
//     });
//   });

//   it('should return null when deleting non-existing snippet', async () => {
//     model.findByIdAndDelete.mockReturnValue({
//       lean: jest.fn().mockResolvedValue(null),
//     } as any);

//     const result = await repository.delete('nonexistent');

//     expect(result).toBeNull();
//   });
// });
