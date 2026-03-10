export type ModelType = 'LLM' | 'LCM' | 'LAM' | 'MoE' | 'VLM' | 'SLM' | 'MLM' | 'SAM';

export interface ModelInfo {
  id: ModelType;
  name: string;
  fullName: string;
  description: string;
  icon: string;
  color: string;
}

export const MODELS: ModelInfo[] = [
  {
    id: 'LLM',
    name: 'LLM',
    fullName: 'Large Language Model',
    description: 'Advanced text generation, reasoning, and knowledge retrieval.',
    icon: 'MessageSquare',
    color: 'text-blue-500',
  },
  {
    id: 'VLM',
    name: 'VLM',
    fullName: 'Vision Language Model',
    description: 'Multimodal understanding of images and visual contexts.',
    icon: 'Eye',
    color: 'text-purple-500',
  },
  {
    id: 'LCM',
    name: 'LCM',
    fullName: 'Latent Consistency Model',
    description: 'Ultra-fast image generation and consistent visual synthesis.',
    icon: 'Zap',
    color: 'text-yellow-500',
  },
  {
    id: 'LAM',
    name: 'LAM',
    fullName: 'Large Action Model',
    description: 'Agents capable of executing complex tasks and tool interactions.',
    icon: 'MousePointer2',
    color: 'text-emerald-500',
  },
  {
    id: 'SLM',
    name: 'SLM',
    fullName: 'Small Language Model',
    description: 'Efficient, low-latency models optimized for edge devices.',
    icon: 'Cpu',
    color: 'text-orange-500',
  },
  {
    id: 'MoE',
    name: 'MoE',
    fullName: 'Mixture of Experts',
    description: 'Sparse architecture that activates only relevant sub-networks.',
    icon: 'Network',
    color: 'text-pink-500',
  },
  {
    id: 'MLM',
    name: 'MLM',
    fullName: 'Masked Language Model',
    description: 'Bidirectional context understanding by predicting hidden tokens.',
    icon: 'Ghost',
    color: 'text-indigo-500',
  },
  {
    id: 'SAM',
    name: 'SAM',
    fullName: 'Segment Anything Model',
    description: 'Zero-shot object segmentation and spatial awareness.',
    icon: 'BoxSelect',
    color: 'text-cyan-500',
  },
];
