interface Short {
    id: number;
    creator_id?: number;
    type: ShortType;
    prompt: string;
    payload: Payload;
    validate: Validate;
    time_limit: number;
    max_points: number;
    background?: string | null;
    creator?: User;
    course?: Course;
    created_at?: string;
    updated_at?: string;
}

export type ShortType =
    | 'mcq'
    | 'true_false'
    | 'one_word'
    | 'one_number'
    | 'fill_blanks'
    | 'sequence'
    | 'rearrange'
    | 'spot_error'
    | 'code_output';

export type Payload =
    | MCQPayload
    | OneWordPayload
    | CodeOutputPayload
    | OneNumberPayload
    | null;

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

export type Validate =
    | ValidateMCQ
    | ValidateTF
    | ValidateText
    | ValidateNumeric;

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
