export interface ILambdaAdapter {
  invokeEvent(functionName: string, payload: any): Promise<void>;
}