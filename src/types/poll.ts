export interface QuestionSet {
  id: string;
  name: string;
  q1: string;
  q2: string;
  q3: string;
  active: boolean;
  created_at: string;
}

export interface AgentResponse {
  id: string;
  question_set_id: string;
  agent_email: string;
  a1: boolean;
  a2: boolean;
  a3: boolean;
  completed_at: string;
}

export interface QuestionData {
  text: string;
  yesCount: number;
  noCount: number;
}

export interface AggregatedPollData {
  set: QuestionSet;
  totalResponses: number;
  questions: QuestionData[];
}
