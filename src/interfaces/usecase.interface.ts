// Base usecase interface
export interface IUseCase<TRequest, TResponse> {
  execute(request: TRequest): Promise<TResponse>;
}

// Usecase with validation
export interface IUseCaseWithValidation<TRequest, TResponse> extends IUseCase<TRequest, TResponse> {
  validate(request: TRequest): Promise<boolean>;
}

// Usecase result wrapper
export interface UseCaseResult<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

// Base request/response types
export interface BaseRequest {
  userId?: string;
  [key: string]: any;
}

export interface BaseResponse {
  success: boolean;
  message?: string;
  [key: string]: any;
}
