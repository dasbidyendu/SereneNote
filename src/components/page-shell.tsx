'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function PageShell({ children, className, ...props }: PageShellProps) {
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={variants}
      transition={{ duration: 0.5 }}
      className={cn('flex flex-1 flex-col gap-8 p-4 sm:p-6 md:p-8', className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
