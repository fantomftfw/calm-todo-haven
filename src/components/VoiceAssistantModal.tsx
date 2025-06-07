
import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Brain } from 'lucide-react';
import { useTasks } from '../utils/api';
import { toast } from '@/hooks/use-toast';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTasksCreated: () => void;
}

const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ 
  isOpen, 
  onClose, 
  onTasksCreated 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { createTask } = useTasks();

  useEffect(() => {
    if (!isOpen) {
      setTranscript('');
      setIsListening(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }

        setTranscript(prev => prev + finalTranscript + interimTranscript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Error",
          description: "Speech recognition failed. Please try again.",
          variant: "destructive",
        });
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const extractTasksFromTranscript = async () => {
    if (!transcript.trim()) {
      toast({
        title: "No Speech",
        description: "Please speak something first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyB2TUPrXR8qQNcLselSNq8twBklnCU40a4', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Extract actionable tasks from the following text. Return ONLY a JSON array of tasks in this exact format:
              [{"title": "task title", "description": "brief description", "estimatedTime": number_in_minutes}]
              
              Rules:
              - Each task should be a clear, actionable item
              - Keep titles concise but descriptive
              - Estimate time in minutes (5-180 range)
              - If no clear tasks, return empty array []
              - Do not include any other text or explanation
              
              Text: "${transcript}"`
            }]
          }]
        })
      });

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) {
        throw new Error('No response from AI');
      }

      // Parse the JSON response
      let tasks;
      try {
        tasks = JSON.parse(content.trim());
      } catch {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          tasks = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Could not parse AI response');
        }
      }

      if (!Array.isArray(tasks) || tasks.length === 0) {
        toast({
          title: "No Tasks Found",
          description: "No actionable tasks were found in your speech.",
        });
        return;
      }

      // Create tasks using the API
      for (const task of tasks) {
        const taskData = {
          title: task.title,
          description: task.description || undefined,
          totalEstimatedTime: task.estimatedTime || undefined,
        };
        await createTask(taskData);
      }

      toast({
        title: "Success",
        description: `Created ${tasks.length} task(s) from your brain dump!`,
      });

      onTasksCreated();
      onClose();
    } catch (error) {
      console.error('Failed to extract tasks:', error);
      toast({
        title: "Error",
        description: "Failed to process your speech. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Brain className="text-purple-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-800">Brain Dump</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Speak your thoughts and I'll extract actionable tasks from them.
        </p>

        {/* Transcript Display */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 min-h-[120px]">
          <h3 className="font-medium text-gray-800 mb-2">Live Transcript:</h3>
          <p className="text-gray-600 text-sm">
            {transcript || "Start speaking to see your transcript here..."}
          </p>
        </div>

        {/* Controls */}
        <div className="flex space-x-3">
          {!isListening ? (
            <button
              onClick={startListening}
              className="flex-1 py-3 px-4 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors flex items-center justify-center"
            >
              <Mic size={16} className="mr-2" />
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopListening}
              className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-colors flex items-center justify-center"
            >
              <MicOff size={16} className="mr-2" />
              Stop Recording
            </button>
          )}

          <button
            onClick={extractTasksFromTranscript}
            disabled={!transcript.trim() || isProcessing}
            className="flex-1 py-3 px-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Brain size={16} className="mr-2" />
            {isProcessing ? 'Processing...' : 'Extract Tasks'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistantModal;
