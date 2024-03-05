export type WorkflowParam = {
  name: string;
  path: string;
  description: string;
  valueType: string | number;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
};

export type ComfyUIWorkFlow = {
  name: string;
  slug: string;
};
