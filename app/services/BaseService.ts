export abstract class BaseService {
  public constructor() {

  }
  public abstract initialize(): Promise<void>;
}
