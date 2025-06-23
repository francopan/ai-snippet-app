export enum OpenAITextModel {
  // === GPT-based Chat Models (Current) ===
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4',
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_4_0125_PREVIEW = 'gpt-4-0125-preview',
  GPT_4O = 'gpt-4o',

  // === GPT-based Legacy Instruction Models (Deprecated) ===
  TEXT_DAVINCI_003 = 'text-davinci-003',
  TEXT_CURIE_001 = 'text-curie-001',
  TEXT_BABBAGE_001 = 'text-babbage-001',
  TEXT_ADA_001 = 'text-ada-001',

  // === Codex Models for Code Generation (Deprecated) ===
  CODE_DAVINCI_002 = 'code-davinci-002',
  CODE_CUSHMAN_001 = 'code-cushman-001',
}
