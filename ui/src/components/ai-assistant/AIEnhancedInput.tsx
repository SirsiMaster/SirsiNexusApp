'use client';

import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, AlertCircle, CheckCircle, Sparkles, Lightbulb, ArrowRight } from 'lucide-react';
import { aiContextService, AIResponse } from '@/services/aiContextService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AIEnhancedInputProps {
  name: string;
  type?: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  required?: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean;
  };
  className?: string;
  disabled?: boolean;
  suggestions?: string[];
  aiEnabled?: boolean;
}

export default function AIEnhancedInput({
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  label,
  description,
  required,
  validation,
  className = '',
  disabled = false,
  suggestions = [],
  aiEnabled = true
}: AIEnhancedInputProps) {
  const [focused, setFocused] = useState(false);
  const [aiHelp, setAiHelp] = useState<AIResponse | null>(null);
  const [showAiHelp, setShowAiHelp] = useState(false);
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; aiHelp?: AIResponse } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Validation check
  useEffect(() => {
    if (value !== '' && value !== null && value !== undefined) {
      const result = aiContextService.validateField(name, value, validation);
      setValidationResult(result);
    } else {
      setValidationResult(null);
    }
  }, [value, name, validation]);

  // AI context awareness on focus
  const handleFocus = async () => {
    setFocused(true);
    if (aiEnabled) {
      const fieldHelp = aiContextService.getFieldHelp(name, type, value);
      setAiHelp(fieldHelp);
      setShowAiHelp(true);
    }
  };

  const handleBlur = () => {
    setFocused(false);
    // Keep AI help visible briefly after blur
    setTimeout(() => {
      if (!showAiHelp) setShowAiHelp(false);
    }, 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
    
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const toggleAiHelp = () => {
    setShowAiHelp(!showAiHelp);
    if (!aiHelp && aiEnabled) {
      const fieldHelp = aiContextService.getFieldHelp(name, type, value);
      setAiHelp(fieldHelp);
    }
  };

  const applySuggestion = (suggestion: string) => {
    onChange(suggestion);
    inputRef.current?.focus();
  };

  const getValidationIcon = () => {
    if (validationResult?.isValid === false) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (value && validationResult?.isValid === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const getInputBorderClass = () => {
    if (validationResult?.isValid === false) {
      return 'border-red-300 focus:border-red-500 focus:ring-red-200';
    }
    if (value && validationResult?.isValid === true) {
      return 'border-green-300 focus:border-green-500 focus:ring-green-200';
    }
    if (focused) {
      return 'border-blue-300 focus:border-blue-500 focus:ring-blue-200';
    }
    return 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-200';
  };

  const renderInput = () => {
    const baseClasses = `
      w-full px-3 py-2 rounded-lg transition-all duration-200
      ${getInputBorderClass()}
      focus:outline-none focus:ring-2
      ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-white dark:bg-gray-800'}
      ${className}
    `;

    if (type === 'textarea') {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          name={name}
          value={value || ''}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`${baseClasses} border resize-none`}
          rows={3}
        />
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        name={name}
        value={value || ''}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`${baseClasses} border`}
      />
    );
  };

  return (
    <div className="space-y-2">
      {/* Label */}
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {aiEnabled && (
            <button
              type="button"
              onClick={toggleAiHelp}
              className={`p-1 rounded-full transition-all duration-200 ${
                showAiHelp 
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' 
                  : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:bg-purple-900/20'
              }`}
              title="Get AI assistance"
            >
              <Sparkles className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {/* Input Container */}
      <div className="relative">
        {renderInput()}
        
        {/* Validation Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {isTyping && (
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-50 dark:bg-blue-900/200 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-50 dark:bg-blue-900/200 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1 h-1 bg-blue-50 dark:bg-blue-900/200 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          )}
          {!isTyping && getValidationIcon()}
        </div>

        {/* Suggestions Dropdown */}
        {focused && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-40 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => applySuggestion(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:bg-gray-900 text-sm transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Validation Error */}
      {validationResult?.isValid === false && validationResult?.aiHelp && (
        <div className="flex items-start space-x-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-red-700 dark:text-red-300 font-medium">{validationResult.aiHelp.message}</p>
            {validationResult.aiHelp.suggestions && validationResult.aiHelp.suggestions.length > 0 && (
              <div className="mt-1 space-x-2">
                {validationResult.aiHelp.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="text-xs text-red-600 hover:text-red-800 dark:text-red-300 underline"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Help Panel */}
      {showAiHelp && aiHelp && (
        <Card className="border-purple-200 dark:border-purple-700 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">{aiHelp.message}</p>
                
                {/* Tips */}
                {aiHelp.tips && aiHelp.tips.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <Lightbulb className="h-3 w-3 text-yellow-500" />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Tips:</span>
                    </div>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 ml-4">
                      {aiHelp.tips.map((tip, index) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warnings */}
                {aiHelp.warnings && aiHelp.warnings.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1">
                      <AlertCircle className="h-3 w-3 text-orange-500" />
                      <span className="text-xs font-medium text-orange-600">Warnings:</span>
                    </div>
                    <ul className="text-xs text-orange-600 space-y-0.5 ml-4">
                      {aiHelp.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Actions */}
                {aiHelp.suggestions && aiHelp.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {aiHelp.suggestions.slice(0, 3).map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-purple-100 dark:bg-purple-900/30 transition-colors"
                        onClick={() => console.log('AI suggestion:', suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => setShowAiHelp(false)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 mt-2"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
