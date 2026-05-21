import { BaseService } from './baseService';
import { STORES, localDb } from '../core/localDatabase';

class AcademicService extends BaseService {
  constructor() {
    super(STORES.ACADEMIC_SUBJECTS);
  }

  async getAssignments() {
    return localDb.getAll(STORES.ACADEMIC_ASSIGNMENTS);
  }

  async getPracticals() {
    return localDb.getAll(STORES.ACADEMIC_PRACTICALS);
  }

  async getRevisionLogs() {
    return localDb.getAll(STORES.ACADEMIC_REVISION_LOGS);
  }
}

export const academicService = new AcademicService();
