import { BaseService } from './baseService';
import { STORES } from '../core/localDatabase';

class MusicService extends BaseService {
  constructor() {
    super(STORES.PERSONAL_MUSIC);
  }
}

export const musicService = new MusicService();
