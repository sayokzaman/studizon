interface BaseShort {
    id: number;
    creator_id: number;
    prompt: string;
    time_limit: number;
    max_points: number;
    background?: string | null;
    creator?: User;
    course?: Course;
    created_at: string;
    updated_at: string;
}

export type Short =
    | (BaseShort & {
          type: 'mcq';
          payload: MCQPayload;
          validate: ValidateMCQ;
      })
    | (BaseShort & {
          type: 'true_false';
          validate: ValidateMCQ;
      })
    | (BaseShort & {
          type: 'one_word';
          payload: OneWordPayload;
          validate: ValidateText;
      })
    | (BaseShort & {
          type: 'code_output';
          payload: CodeOutputPayload;
          validate: ValidateText;
      })
    | (BaseShort & {
          type: 'one_number';
          payload: OneNumberPayload;
          validate: ValidateNumeric;
    })

export type MCQChoice = {
    text?: string | null;
    img?: string | null;
    alt?: string | null;
};

export type MCQPayload = {
    choices: MCQChoice[];
};
export type OneWordPayload = { placeholder?: string }; // optional UI hint
export type CodeOutputPayload = { code: string; language?: string }; // display-only
export type OneNumberPayload = { unit?: string; placeholder?: string };

export type ValidateMCQ = { mode: 'mcq'; correctIndex: number };
export type ValidateTF = { mode: 'boolean'; answer: boolean };
export type ValidateText = {
    mode: 'text';
    answers: string[]; // synonyms accepted
    caseInsensitive?: boolean; // default true
    trim?: boolean; // default true
    collapseSpaces?: boolean; // default true
};
export type ValidateNumeric = {
    mode: 'numeric';
    exact: number;
    tolerance?: number; // default 0
};
