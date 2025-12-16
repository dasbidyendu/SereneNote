
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, AtSign, Hash } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MessagePart } from '@/firebase/firestore/chat';

export interface MentionData {
  id: string;
  display: string;
  photoURL?: string;
  initials?: string;
}

interface ChatInputProps {
  userMentionData: MentionData[];
  journalMentionData: MentionData[];
  onSendMessage: (parts: MessagePart[]) => void;
  disabled?: boolean;
}

const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '';

export function ChatInput({
  userMentionData,
  journalMentionData,
  onSendMessage,
  disabled,
}: ChatInputProps) {
  const [parts, setParts] = useState<MessagePart[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [activeTrigger, setActiveTrigger] = useState<'@' | '#' | null>(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLDivElement>(null);

  const filteredData = activeTrigger === '@'
    ? userMentionData.filter(u => u.display.toLowerCase().includes(searchTerm.toLowerCase()))
    : journalMentionData.filter(j => j.display.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleInputChange = (e: React.FormEvent<HTMLDivElement>) => {
    const text = e.currentTarget.textContent || '';
    setInputValue(text);

    const atIndex = text.lastIndexOf('@');
    const hashIndex = text.lastIndexOf('#');

    if (atIndex > hashIndex) {
      setActiveTrigger('@');
      setSearchTerm(text.substring(atIndex + 1));
      setPopoverOpen(true);
    } else if (hashIndex > atIndex) {
      setActiveTrigger('#');
      setSearchTerm(text.substring(hashIndex + 1));
      setPopoverOpen(true);
    } else {
      setActiveTrigger(null);
      setPopoverOpen(false);
    }
  };

  const handleSelect = (item: MentionData) => {
    const newPart: MessagePart = activeTrigger === '@'
      ? { type: 'mention', mention: { userId: item.id, name: item.display } }
      : { type: 'journal', journal: { id: item.id, title: item.display } };
    
    const lastTriggerIndex = inputValue.lastIndexOf(activeTrigger!);
    const textBefore = inputValue.substring(0, lastTriggerIndex);

    const existingTextPartIndex = parts.findIndex(p => p.type === 'text');
    if (textBefore && existingTextPartIndex !== -1) {
        // Append to existing text part
        const updatedParts = [...parts];
        updatedParts[existingTextPartIndex].text += textBefore;
        setParts([...updatedParts, newPart]);
    } else if (textBefore) {
        // Create a new text part
        setParts([...parts, { type: 'text', text: textBefore }, newPart]);
    } else {
        setParts([...parts, newPart]);
    }
    
    setInputValue('');
    setActiveTrigger(null);
    setPopoverOpen(false);
    setSearchTerm('');

    setTimeout(() => inputRef.current?.focus(), 0);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
     if (e.key === 'Backspace' && inputValue === '' && parts.length > 0) {
      e.preventDefault();
      // If the last part is text, trim it. Otherwise, remove the last pill.
      const lastPart = parts[parts.length - 1];
      if (lastPart.type === 'text' && lastPart.text) {
          if (lastPart.text.length > 1) {
             const newParts = [...parts];
             newParts[newParts.length - 1].text = lastPart.text.slice(0, -1);
             setParts(newParts);
          } else {
             setParts(parts.slice(0, -1));
          }
      } else {
         setParts(parts.slice(0, -1));
      }
    }
  };

  const handleSubmit = () => {
    let finalParts = [...parts];
    if (inputValue.trim()) {
      finalParts.push({ type: 'text', text: inputValue });
    }
    if (finalParts.length > 0) {
      onSendMessage(finalParts);
      setParts([]);
      setInputValue('');
    }
  };

  return (
    <Popover open={popoverOpen && filteredData.length > 0} onOpenChange={setPopoverOpen}>
      <div className="flex w-full gap-2 items-end">
        <PopoverTrigger asChild>
          <div className="flex-grow bg-background rounded-md border border-input p-2 flex flex-wrap items-center gap-1 min-h-[40px]">
            {parts.map((part, index) => (
              <span key={index} className={cn(
                  "py-0.5 px-2 rounded-md text-sm leading-tight",
                  part.type === 'mention' ? 'bg-blue-500/20 text-blue-300' : 
                  part.type === 'journal' ? 'bg-purple-500/20 text-purple-300' :
                  'bg-transparent'
              )}>
                {part.type === 'text' && part.text}
                {part.type === 'mention' && `@${part.mention?.name}`}
                {part.type === 'journal' && `#${part.journal?.title}`}
              </span>
            ))}
            <div
              ref={inputRef}
              contentEditable
              onInput={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-[50px] outline-none text-sm bg-transparent"
              data-placeholder="Type a message..."
            />
          </div>
        </PopoverTrigger>
        <Button type="button" size="icon" disabled={disabled || (parts.length === 0 && !inputValue.trim())} onClick={handleSubmit}>
          <Send className="h-4 w-4" />
        </Button>
      </div>

      <PopoverContent className="w-[300px] p-0" side="top" align="start">
        <p className="p-2 text-xs font-semibold text-muted-foreground">
          {activeTrigger === '@' ? 'Mention a user' : 'Link a journal'}
        </p>
        <ScrollArea className="max-h-[300px]">
          <div className="p-1">
            {filteredData.map(item => (
              <button
                key={item.id}
                onClick={() => handleSelect(item)}
                className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-accent"
              >
                {activeTrigger === '@' && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={item.photoURL} />
                    <AvatarFallback>{item.initials || getInitials(item.display)}</AvatarFallback>
                  </Avatar>
                )}
                 {activeTrigger === '#' && (
                  <Hash className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="text-sm flex-1 truncate">{item.display}</span>
              </button>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
