import { Test, TestingModule } from '@nestjs/testing';
import { NfsService } from './nfs.service';

describe('NfsService', () => {
  let service: NfsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NfsService],
    }).compile();

    service = module.get<NfsService>(NfsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
