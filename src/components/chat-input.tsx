
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
    const textBefore = inputValue.substring(0, lastTriggerIndex).trim();

    let newParts = [...parts];

    if (textBefore) {
        newParts.push({ type: 'text', text: textBefore });
    }
    
    newParts.push(newPart);
    setParts(newParts);
    
    setInputValue('');
    if (inputRef.current) {
        inputRef.current.textContent = '';
    }
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
     // Only remove the last part if the current text input is empty
     if (e.key === 'Backspace' && (e.currentTarget.textContent === '') && parts.length > 0) {
        e.preventDefault();
        // Remove the last part
        setParts(parts.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    let finalParts = [...parts];
    if (inputValue.trim()) {
      finalParts.push({ type: 'text', text: inputValue.trim() });
    }
    if (finalParts.length > 0) {
      onSendMessage(finalParts);
      setParts([]);
      setInputValue('');
       if (inputRef.current) {
        inputRef.current.textContent = '';
      }
    }
  };

  const renderParts = () => {
    const elements: JSX.Element[] = [];
    parts.forEach((part, index) => {
        if (part.type === 'text') {
            elements.push(<span key={`text-${index}`} className="text-sm">{part.text}</span>)
        } else if (part.type === 'mention' && part.mention) {
            elements.push(<span key={`mention-${index}`} className="bg-primary/30 px-2 py-1 rounded text-sm mx-1 inline-block">@{part.mention.name}</span>)
        } else if (part.type === 'journal' && part.journal) {
            elements.push(<span key={`journal-${index}`} className="bg-accent/20 text-accent-foreground px-2 py-1 rounded text-sm mx-1 inline-block">#{part.journal.title}</span>)
        }
    });
    return elements;
  }

  return (
    <Popover open={popoverOpen && filteredData.length > 0} onOpenChange={setPopoverOpen}>
      <div className="flex w-full gap-2 items-end">
        <PopoverTrigger asChild>
          <div className="flex-grow bg-background rounded-md border border-input p-2 flex flex-wrap items-center gap-x-1 gap-y-2 min-h-[40px]">
            {renderParts()}
            <div
              ref={inputRef}
              contentEditable
              onInput={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-[50px] outline-none text-sm bg-transparent"
              data-placeholder={parts.length === 0 ? "Type a message..." : ""}
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
