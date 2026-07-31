export enum FormFieldType {
  TEXT = "text",
  SELECT = "select",
  NUMBER = "number",
  EMAIL = "email",
  PHONE = "phone",
}

export interface EventFormField {
  id: string;
  eventId: string;
  label: string;
  type: FormFieldType;
  options?: string[];
  isRequired: boolean;
  displayOrder: number;
}
